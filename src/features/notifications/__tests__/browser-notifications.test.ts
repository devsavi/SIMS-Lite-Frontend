/**
 * Browser notification utilities — unit tests.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import {
  isBrowserNotificationsSupported,
  getCurrentPermission,
  requestPermission,
  showBrowserNotification,
  registerServiceWorker,
} from "../utils/browser-notifications";

// ---------------------------------------------------------------------------
// Helper: mock the Notification global using a class
// ---------------------------------------------------------------------------

function makeNotifClass(permission: "granted" | "denied" | "default") {
  class FakeNotification {
    static permission = permission;
    static requestPermission = vi.fn().mockResolvedValue(permission);
    addEventListener = vi.fn();
    close = vi.fn();
    constructor(_title: string, _opts?: object) {}
  }
  return FakeNotification;
}

// ---------------------------------------------------------------------------
// isBrowserNotificationsSupported
// ---------------------------------------------------------------------------

describe("isBrowserNotificationsSupported", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns true when Notification exists in window", () => {
    vi.stubGlobal("Notification", makeNotifClass("default"));
    expect(isBrowserNotificationsSupported()).toBe(true);
  });

  it("returns false when Notification is not in window", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const backup = (globalThis as any).Notification;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).Notification;
    expect(isBrowserNotificationsSupported()).toBe(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).Notification = backup;
  });
});

// ---------------------------------------------------------------------------
// getCurrentPermission
// ---------------------------------------------------------------------------

describe("getCurrentPermission", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns 'unsupported' when Notification is not available", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const backup = (globalThis as any).Notification;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).Notification;
    expect(getCurrentPermission()).toBe("unsupported");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).Notification = backup;
  });

  it("returns current permission state", () => {
    vi.stubGlobal("Notification", makeNotifClass("granted"));
    expect(getCurrentPermission()).toBe("granted");
  });
});

// ---------------------------------------------------------------------------
// requestPermission
// ---------------------------------------------------------------------------

describe("requestPermission", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns 'unsupported' when API is unavailable", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const backup = (globalThis as any).Notification;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).Notification;
    const result = await requestPermission();
    expect(result).toBe("unsupported");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).Notification = backup;
  });

  it("returns current permission immediately if already granted", async () => {
    const cls = makeNotifClass("granted");
    vi.stubGlobal("Notification", cls);
    const result = await requestPermission();
    expect(result).toBe("granted");
    // requestPermission() should NOT have been called (already determined)
    expect(cls.requestPermission).not.toHaveBeenCalled();
  });

  it("calls requestPermission API when in default state", async () => {
    const cls = makeNotifClass("default");
    cls.requestPermission = vi.fn().mockResolvedValue("granted");
    vi.stubGlobal("Notification", cls);
    const result = await requestPermission();
    expect(cls.requestPermission).toHaveBeenCalled();
    expect(result).toBe("granted");
  });
});

// ---------------------------------------------------------------------------
// registerServiceWorker
// ---------------------------------------------------------------------------

describe("registerServiceWorker", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("registers service worker when navigator.serviceWorker exists", async () => {
    const mockRegister = vi.fn().mockResolvedValue({ scope: "/" });
    vi.stubGlobal("navigator", { serviceWorker: { register: mockRegister } });

    const reg = await registerServiceWorker();
    expect(mockRegister).toHaveBeenCalledWith("/sw.js", { scope: "/" });
    expect(reg).toEqual({ scope: "/" });
  });
});

// ---------------------------------------------------------------------------
// showBrowserNotification
// ---------------------------------------------------------------------------

describe("showBrowserNotification", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("does not throw when permission is not granted", async () => {
    vi.stubGlobal("Notification", makeNotifClass("denied"));
    await expect(
      showBrowserNotification({ id: "no-perm-1", title: "Test" })
    ).resolves.not.toThrow();
  });

  it("does not show notification when document is focused and forceShowWhenFocused is false", async () => {
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");

    const constructorSpy = vi.fn();
    class FakeNotif {
      static permission = "granted";
      static requestPermission = vi.fn();
      addEventListener = vi.fn();
      close = vi.fn();
      constructor(title: string, opts?: object) {
        constructorSpy(title, opts);
      }
    }
    vi.stubGlobal("Notification", FakeNotif);

    await showBrowserNotification({ id: "visible-1", title: "Should not show" });
    expect(constructorSpy).not.toHaveBeenCalled();
  });

  it("shows notification when forceShowWhenFocused is true even if focused", async () => {
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");

    const constructorSpy = vi.fn();
    class FakeNotif {
      static permission = "granted";
      static requestPermission = vi.fn();
      addEventListener = vi.fn();
      close = vi.fn();
      constructor(title: string, opts?: object) {
        constructorSpy(title, opts);
      }
    }
    vi.stubGlobal("Notification", FakeNotif);

    await showBrowserNotification({
      id: "force-visible-1",
      title: "Forced Alert",
      forceShowWhenFocused: true,
    });
    expect(constructorSpy).toHaveBeenCalledWith("Forced Alert", expect.objectContaining({
      tag: "force-visible-1",
    }));
  });

  it("shows notification when document is hidden", async () => {
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");

    const constructorSpy = vi.fn();
    class FakeNotif {
      static permission = "granted";
      static requestPermission = vi.fn();
      addEventListener = vi.fn();
      close = vi.fn();
      constructor(title: string, opts?: object) {
        constructorSpy(title, opts);
      }
    }
    vi.stubGlobal("Notification", FakeNotif);

    await showBrowserNotification({
      id: "show-hidden-1",
      title: "Alert",
      body: "Message body",
    });
    expect(constructorSpy).toHaveBeenCalledWith("Alert", {
      body: "Message body",
      icon: "/favicon.ico",
      tag: "show-hidden-1",
      data: { url: "/notifications" },
    });
  });

  it("deduplicates notifications with the same id within the window", async () => {
    vi.useFakeTimers();
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");

    const constructorSpy = vi.fn();
    class FakeNotif {
      static permission = "granted";
      static requestPermission = vi.fn();
      addEventListener = vi.fn();
      close = vi.fn();
      constructor(title: string, opts?: object) {
        constructorSpy(title, opts);
      }
    }
    vi.stubGlobal("Notification", FakeNotif);

    const UNIQUE_ID = `dedup-test-${Math.random()}`;
    await showBrowserNotification({ id: UNIQUE_ID, title: "First" });
    await showBrowserNotification({ id: UNIQUE_ID, title: "Duplicate - same id" });
    expect(constructorSpy).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });
});

