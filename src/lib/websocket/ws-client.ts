/**
 * Production-grade WebSocket client.
 *
 * Features:
 *  - Authenticated connection via ?token= query param
 *  - Typed event dispatch (subscribe by event type string)
 *  - Exponential-backoff reconnect (up to 10 attempts, cap 30 s)
 *  - Heartbeat ping every 30 s to keep the connection alive
 *  - Observable connection status
 *  - Graceful disconnect (stops reconnect loop)
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WsStatus = "idle" | "connecting" | "connected" | "disconnected" | "error";

export type WsEventHandler<T = unknown> = (payload: T) => void;
export type WsStatusHandler = (status: WsStatus) => void;

export interface WsMessage {
  type: string;
  payload?: unknown;
}

interface WsClientOptions {
  /** Base WebSocket URL — token appended automatically. */
  url: string;
  /** Token getter called right before each (re)connect. */
  getToken?: () => string | null;
  /** Base delay in ms for first reconnect attempt. Default 1000. */
  baseReconnectDelay?: number;
  /** Multiplier applied on each retry. Default 1.5. */
  reconnectMultiplier?: number;
  /** Maximum reconnect delay cap in ms. Default 30 000. */
  maxReconnectDelay?: number;
  /** Maximum number of reconnect attempts. Default 10. */
  maxReconnectAttempts?: number;
  /** Heartbeat ping interval in ms. Default 30 000. */
  heartbeatInterval?: number;
}

// ---------------------------------------------------------------------------
// WsClient
// ---------------------------------------------------------------------------

export class WsClient {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private _status: WsStatus = "idle";
  private _intentionalClose = false;

  private readonly opts: Required<WsClientOptions>;

  // Handlers keyed by event type ("*" = all)
  private eventHandlers: Map<string, Set<WsEventHandler>> = new Map();
  private statusHandlers: Set<WsStatusHandler> = new Set();

  constructor(options: WsClientOptions) {
    this.opts = {
      getToken: () => null,
      baseReconnectDelay: 1_000,
      reconnectMultiplier: 1.5,
      maxReconnectDelay: 30_000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30_000,
      ...options,
    };
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /** Initiate a WebSocket connection. Safe to call multiple times. */
  connect(): void {
    if (typeof window === "undefined") return;
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return;

    this._intentionalClose = false;
    this._setStatus("connecting");

    const token = this.opts.getToken();
    const url = token
      ? `${this.opts.url}${this.opts.url.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`
      : this.opts.url;

    try {
      this.socket = new WebSocket(url);
    } catch {
      this._setStatus("error");
      this._scheduleReconnect();
      return;
    }

    this.socket.addEventListener("open", this._handleOpen);
    this.socket.addEventListener("message", this._handleMessage);
    this.socket.addEventListener("close", this._handleClose);
    this.socket.addEventListener("error", this._handleError);
  }

  /** Gracefully close the connection and stop reconnecting. */
  disconnect(): void {
    this._intentionalClose = true;
    this._clearHeartbeat();
    this._clearReconnectTimer();
    if (this.socket) {
      this.socket.removeEventListener("open", this._handleOpen);
      this.socket.removeEventListener("message", this._handleMessage);
      this.socket.removeEventListener("close", this._handleClose);
      this.socket.removeEventListener("error", this._handleError);
      this.socket.close(1000, "Client disconnect");
      this.socket = null;
    }
    this._setStatus("disconnected");
  }

  /** Send a JSON-serialisable message (no-op if not connected). */
  send(message: WsMessage): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  // -------------------------------------------------------------------------
  // Subscriptions
  // -------------------------------------------------------------------------

  /**
   * Subscribe to messages of a specific event type.
   * Use `"*"` to receive all events.
   * Returns an unsubscribe function.
   */
  on<T = unknown>(eventType: string, handler: WsEventHandler<T>): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler as WsEventHandler);
    return () => {
      this.eventHandlers.get(eventType)?.delete(handler as WsEventHandler);
    };
  }

  /** Subscribe to connection status changes. Returns unsubscribe function. */
  onStatus(handler: WsStatusHandler): () => void {
    this.statusHandlers.add(handler);
    // Immediately fire with current status
    handler(this._status);
    return () => this.statusHandlers.delete(handler);
  }

  get status(): WsStatus {
    return this._status;
  }

  get isConnected(): boolean {
    return this._status === "connected";
  }

  // -------------------------------------------------------------------------
  // Private — event handlers
  // -------------------------------------------------------------------------

  private _handleOpen = (): void => {
    this.reconnectAttempts = 0;
    this._setStatus("connected");
    this._startHeartbeat();
  };

  private _handleMessage = (event: MessageEvent): void => {
    let msg: WsMessage;
    try {
      msg = JSON.parse(event.data as string) as WsMessage;
    } catch {
      return; // Ignore non-JSON frames
    }

    // Pong response — no further dispatch needed
    if (msg.type === "pong") return;

    // Dispatch to specific-type handlers
    this.eventHandlers.get(msg.type)?.forEach((h) => h(msg.payload));

    // Dispatch to catch-all handlers
    this.eventHandlers.get("*")?.forEach((h) => h(msg));
  };

  private _handleClose = (event: CloseEvent): void => {
    this._clearHeartbeat();
    if (this._intentionalClose) {
      this._setStatus("disconnected");
      return;
    }
    this._setStatus("disconnected");
    // Do not reconnect on auth failures (4001/4003/4401)
    if (event.code === 4001 || event.code === 4003 || event.code === 4401) {
      this._setStatus("error");
      return;
    }
    this._scheduleReconnect();
  };

  private _handleError = (): void => {
    this._setStatus("error");
    // The `close` event will fire immediately after, which handles reconnect
  };

  // -------------------------------------------------------------------------
  // Private — helpers
  // -------------------------------------------------------------------------

  private _setStatus(status: WsStatus): void {
    if (this._status === status) return;
    this._status = status;
    this.statusHandlers.forEach((h) => h(status));
  }

  private _startHeartbeat(): void {
    this._clearHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.send({ type: "ping" });
    }, this.opts.heartbeatInterval);
  }

  private _clearHeartbeat(): void {
    if (this.heartbeatTimer !== null) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private _scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.opts.maxReconnectAttempts) {
      this._setStatus("error");
      return;
    }

    const delay = Math.min(
      this.opts.baseReconnectDelay *
        Math.pow(this.opts.reconnectMultiplier, this.reconnectAttempts),
      this.opts.maxReconnectDelay
    );

    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      if (!this._intentionalClose) {
        this.connect();
      }
    }, delay);
  }

  private _clearReconnectTimer(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

// ---------------------------------------------------------------------------
// Singleton — lazy-initialised on client only
// ---------------------------------------------------------------------------

let _wsClient: WsClient | null = null;

/**
 * Returns the global WsClient singleton.
 * Must call `configureWsClient` before the first connect.
 */
export function getWsClient(): WsClient {
  if (!_wsClient) {
    // Derive the WS URL from NEXT_PUBLIC_WS_URL or fall back to converting
    // NEXT_PUBLIC_API_URL (http→ws, https→wss) and appending the notifications path.
    const wsUrl = (() => {
      if (process.env.NEXT_PUBLIC_WS_URL) {
        return `${process.env.NEXT_PUBLIC_WS_URL}/notifications`;
      }
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001/api/v1";
      return apiUrl
        .replace(/^http:\/\//, "ws://")
        .replace(/^https:\/\//, "wss://")
        .replace(/\/$/, "") + "/ws/notifications";
    })();

    _wsClient = new WsClient({ url: wsUrl });
  }
  return _wsClient;
}

/**
 * Configure the singleton with a token getter.
 * Should be called once from the auth/session provider.
 */
export function configureWsClient(opts: { getToken: () => string | null }): void {
  const client = getWsClient();
  // Patch the token getter at runtime (avoids recreating the singleton)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (client as any).opts.getToken = opts.getToken;
}
