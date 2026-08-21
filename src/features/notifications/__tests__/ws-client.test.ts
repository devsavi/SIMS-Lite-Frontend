/**
 * WsClient — unit tests
 * Uses fake timers to test heartbeat and reconnect behaviour.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WsClient } from "@/lib/websocket/ws-client";

// ---------------------------------------------------------------------------
// Mock WebSocket — proper class so vi.stubGlobal works correctly
// ---------------------------------------------------------------------------

type EventHandler = (e: unknown) => void;

class MockWebSocket {
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  static CONNECTING = 0;

  readyState = MockWebSocket.CONNECTING;
  url: string;

  private listeners: Record<string, EventHandler[]> = {};

  // Track all created instances
  static instances: MockWebSocket[] = [];

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  addEventListener(event: string, handler: EventHandler) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(handler);
  }

  removeEventListener(event: string, handler: EventHandler) {
    this.listeners[event] = (this.listeners[event] ?? []).filter(
      (h) => h !== handler
    );
  }

  send = vi.fn();

  close(code = 1000, reason = "") {
    this.readyState = MockWebSocket.CLOSED;
    this._emit("close", { code, reason });
  }

  // Test helpers
  _open() {
    this.readyState = MockWebSocket.OPEN;
    this._emit("open", {});
  }

  _message(data: unknown) {
    this._emit("message", { data: JSON.stringify(data) });
  }

  _emit(event: string, payload: unknown) {
    (this.listeners[event] ?? []).forEach((h) => h(payload));
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function lastSocket(): MockWebSocket {
  const all = MockWebSocket.instances;
  return all[all.length - 1];
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("WsClient", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    MockWebSocket.instances = [];
    vi.stubGlobal("WebSocket", MockWebSocket);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  // -------------------------------------------------------------------------
  // Connection lifecycle
  // -------------------------------------------------------------------------

  it("starts in idle status", () => {
    const client = new WsClient({ url: "ws://localhost/ws" });
    expect(client.status).toBe("idle");
  });

  it("transitions to connecting then connected on open", () => {
    const client = new WsClient({ url: "ws://localhost/ws" });
    const statuses: string[] = [];
    client.onStatus((s) => statuses.push(s));
    client.connect();
    expect(statuses).toContain("connecting");
    lastSocket()._open();
    expect(client.status).toBe("connected");
    expect(client.isConnected).toBe(true);
  });

  it("appends token to URL when getToken is provided", () => {
    const client = new WsClient({
      url: "ws://localhost/ws",
      getToken: () => "my-jwt-token",
    });
    client.connect();
    expect(lastSocket().url).toContain("token=my-jwt-token");
  });

  it("does not append token when getToken returns null", () => {
    const client = new WsClient({
      url: "ws://localhost/ws",
      getToken: () => null,
    });
    client.connect();
    expect(lastSocket().url).not.toContain("token=");
  });

  it("disconnects intentionally without reconnecting", () => {
    const client = new WsClient({ url: "ws://localhost/ws" });
    client.connect();
    lastSocket()._open();
    client.disconnect();
    expect(client.status).toBe("disconnected");
    // Advance time — no reconnect should happen
    vi.advanceTimersByTime(10_000);
    expect(MockWebSocket.instances).toHaveLength(1);
  });

  // -------------------------------------------------------------------------
  // Reconnect
  // -------------------------------------------------------------------------

  it("schedules reconnect after unexpected close", () => {
    const client = new WsClient({
      url: "ws://localhost/ws",
      baseReconnectDelay: 500,
      maxReconnectAttempts: 3,
    });
    client.connect();
    lastSocket()._open();
    lastSocket().close(1001); // Abnormal close
    expect(client.status).toBe("disconnected");
    vi.advanceTimersByTime(600);
    // Should have attempted a new connection
    expect(MockWebSocket.instances).toHaveLength(2);
  });

  it("stops reconnecting after maxReconnectAttempts", () => {
    const client = new WsClient({
      url: "ws://localhost/ws",
      baseReconnectDelay: 100,
      reconnectMultiplier: 1,
      maxReconnectAttempts: 2,
    });
    client.connect();

    // Connection attempt 1 fails without opening
    lastSocket().close(1006);
    vi.advanceTimersByTime(150);

    // Connection attempt 2 fails without opening
    lastSocket().close(1006);
    vi.advanceTimersByTime(150);

    // Final attempt fails -> should reach error status
    lastSocket().close(1006);

    expect(client.status).toBe("error");
  });

  // -------------------------------------------------------------------------
  // Heartbeat
  // -------------------------------------------------------------------------

  it("sends ping on heartbeat interval", () => {
    const client = new WsClient({
      url: "ws://localhost/ws",
      heartbeatInterval: 1_000,
    });
    client.connect();
    lastSocket()._open();
    vi.advanceTimersByTime(1_100);
    expect(lastSocket().send).toHaveBeenCalledWith(JSON.stringify({ event: "system.ping" }));
  });

  it("stops heartbeat on disconnect", () => {
    const client = new WsClient({
      url: "ws://localhost/ws",
      heartbeatInterval: 1_000,
    });
    client.connect();
    const s = lastSocket();
    s._open();
    client.disconnect();
    s.send.mockClear();
    vi.advanceTimersByTime(2_000);
    expect(s.send).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Event dispatch
  // -------------------------------------------------------------------------

  it("dispatches events by type to subscribers", () => {
    const client = new WsClient({ url: "ws://localhost/ws" });
    const handler = vi.fn();
    client.on("low_stock_alert", handler);
    client.connect();
    lastSocket()._open();
    lastSocket()._message({ type: "low_stock_alert", payload: { product_name: "A" } });
    expect(handler).toHaveBeenCalledWith({ product_name: "A" });
  });

  it("dispatches to catch-all '*' handlers", () => {
    const client = new WsClient({ url: "ws://localhost/ws" });
    const handler = vi.fn();
    client.on("*", handler);
    client.connect();
    lastSocket()._open();
    lastSocket()._message({ type: "broadcast", payload: { title: "Test" } });
    expect(handler).toHaveBeenCalled();
  });

  it("ignores pong messages", () => {
    const client = new WsClient({ url: "ws://localhost/ws" });
    const handler = vi.fn();
    client.on("pong", handler);
    client.connect();
    lastSocket()._open();
    lastSocket()._message({ type: "pong" });
    expect(handler).not.toHaveBeenCalled();
  });

  it("unsubscribes handlers correctly", () => {
    const client = new WsClient({ url: "ws://localhost/ws" });
    const handler = vi.fn();
    const unsub = client.on("notification", handler);
    unsub();
    client.connect();
    lastSocket()._open();
    lastSocket()._message({ type: "notification", payload: {} });
    expect(handler).not.toHaveBeenCalled();
  });
});
