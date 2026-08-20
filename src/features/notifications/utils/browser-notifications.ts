/**
 * Browser notification utilities.
 *
 * - requestPermission()
 * - showBrowserNotification()
 * - isBrowserNotificationsSupported()
 * - Deduplication guard (suppress when app tab is focused)
 */

// ---------------------------------------------------------------------------
// Support check
// ---------------------------------------------------------------------------

export function isBrowserNotificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

// ---------------------------------------------------------------------------
// Permission
// ---------------------------------------------------------------------------

export type NotificationPermissionState =
  | "granted"
  | "denied"
  | "default"
  | "unsupported";

export function getCurrentPermission(): NotificationPermissionState {
  if (!isBrowserNotificationsSupported()) return "unsupported";
  return Notification.permission as NotificationPermissionState;
}

/**
 * Request browser notification permission.
 * Returns the resulting permission state.
 * Safe to call multiple times — already-granted/denied returns immediately.
 */
export async function requestPermission(): Promise<NotificationPermissionState> {
  if (!isBrowserNotificationsSupported()) return "unsupported";
  if (Notification.permission !== "default") {
    return Notification.permission as NotificationPermissionState;
  }
  try {
    const result = await Notification.requestPermission();
    return result as NotificationPermissionState;
  } catch {
    return "denied";
  }
}

// ---------------------------------------------------------------------------
// Deduplication
// ---------------------------------------------------------------------------

const _shown = new Map<string, number>();
const DEDUP_WINDOW_MS = 5_000;

function isDuplicate(id: string): boolean {
  const last = _shown.get(id);
  const now = Date.now();
  if (last !== undefined && now - last < DEDUP_WINDOW_MS) return true;
  _shown.set(id, now);
  // Clean old entries
  for (const [k, ts] of _shown) {
    if (now - ts > DEDUP_WINDOW_MS * 10) _shown.delete(k);
  }
  return false;
}

/**
 * Register service worker for system push & mobile notifications.
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    return registration;
  } catch (err) {
    console.warn("ServiceWorker registration failed:", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Show notification
// ---------------------------------------------------------------------------

export interface BrowserNotificationOptions {
  /** Unique ID for deduplication. */
  id: string;
  title: string;
  body?: string;
  icon?: string;
  tag?: string;
  /** If true, show even when the document is focused. Default false. */
  forceShowWhenFocused?: boolean;
  onClick?: () => void;
}

/**
 * Show a browser (desktop/mobile) notification.
 * - Silently skips if permission is not granted.
 * - Silently skips if the document is focused and forceShowWhenFocused is false.
 * - Deduplicates by `id` within a 5-second window.
 * - Uses ServiceWorker registration if available (required on Mobile Chrome), falling back to Notification constructor.
 */
export async function showBrowserNotification(opts: BrowserNotificationOptions): Promise<void> {
  if (!isBrowserNotificationsSupported()) return;
  if (Notification.permission !== "granted") return;
  if (!opts.forceShowWhenFocused && document.visibilityState === "visible") return;
  if (isDuplicate(opts.id)) return;

  const title = opts.title;
  const options: NotificationOptions = {
    body: opts.body,
    icon: opts.icon ?? "/favicon.ico",
    tag: opts.tag ?? opts.id,
    data: { url: "/notifications" },
  };

  // Try ServiceWorker showNotification first (required on Android Chrome / Mobile browsers)
  if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && typeof reg.showNotification === "function") {
        await reg.showNotification(title, options);
        return;
      }
    } catch {
      // Fall through to standard Notification constructor
    }
  }

  // Fallback to Notification constructor for Desktop browsers
  try {
    const n = new Notification(title, options);
    if (opts.onClick) {
      n.addEventListener("click", () => {
        if (typeof window !== "undefined") window.focus();
        opts.onClick!();
        n.close();
      });
    }
  } catch (err) {
    console.warn("Browser notification display failed:", err);
  }
}

