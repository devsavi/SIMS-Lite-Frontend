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
 * Show a browser (desktop) notification.
 * - Silently skips if permission is not granted.
 * - Silently skips if the document is focused and forceShowWhenFocused is false.
 * - Deduplicates by `id` within a 5-second window.
 */
export function showBrowserNotification(opts: BrowserNotificationOptions): void {
  if (!isBrowserNotificationsSupported()) return;
  if (Notification.permission !== "granted") return;
  if (!opts.forceShowWhenFocused && document.visibilityState === "visible") return;
  if (isDuplicate(opts.id)) return;

  const n = new Notification(opts.title, {
    body: opts.body,
    icon: opts.icon ?? "/favicon.ico",
    tag: opts.tag ?? opts.id,
  });

  if (opts.onClick) {
    n.addEventListener("click", () => {
      window.focus();
      opts.onClick!();
      n.close();
    });
  }
}
