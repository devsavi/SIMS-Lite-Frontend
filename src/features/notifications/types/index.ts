/**
 * Notifications feature — TypeScript types.
 * Aligned with the backend Notification API spec.
 */

// ---------------------------------------------------------------------------
// Core notification types
// ---------------------------------------------------------------------------

export type NotificationType =
  | "INFO"
  | "WARNING"
  | "ERROR"
  | "SUCCESS"
  | "PURCHASE_ORDER"
  | "GRN"
  | "INVENTORY"
  | "STOCK_RELEASE"
  | "LOW_STOCK"
  | "OUT_OF_STOCK"
  | "USER"
  | "SECURITY"
  | "SYSTEM";

export type NotificationPriority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";

export type RecipientType = "USER" | "ROLE" | "BROADCAST";

export type RecipientRole = "ADMIN" | "OFFICER" | "STORE_KEEPER";

/** Full server-side notification object (NotificationRead) */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  recipient_type: RecipientType;
  recipient_role: string | null;
  recipient_user_id: string | null;
  sender_id: string | null;
  is_read: boolean;
  read_at: string | null;
  data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/** Lightweight summary used in dashboard/recent and dashboard/critical-alerts */
export interface NotificationSummary {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  is_read: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// API response wrappers
// ---------------------------------------------------------------------------

/**
 * The paginated list endpoint returns:
 * { "status": "success", "data": [...], "pagination": { ... } }
 * Note: "pagination" is a sibling of "data", not nested inside it.
 */
export interface PaginatedApiResponse<T> {
  status: "success";
  data: T[];
  pagination: {
    page: number;
    size: number;
    total: number;
    pages: number;
  };
}

export interface PaginatedNotifications {
  data: Notification[];
  pagination: {
    page: number;
    size: number;
    total: number;
    pages: number;
  };
}

export interface UnreadCountResponse {
  unread_count: number;
  critical_count: number;
  high_count: number;
}

export interface RecentNotificationsResponse {
  notifications: NotificationSummary[];
  unread_count: number;
}

export interface CriticalAlertsResponse {
  alerts: NotificationSummary[];
  total: number;
}

// ---------------------------------------------------------------------------
// Filter params
// ---------------------------------------------------------------------------

export interface NotificationFilterParams {
  page?: number;
  size?: number;
  search?: string;
  type?: NotificationType | "ALL";
  is_read?: boolean | "ALL";
  from_date?: string;
  to_date?: string;
}

// ---------------------------------------------------------------------------
// Compose payload (admin)
// ---------------------------------------------------------------------------

export type ComposeNotificationPayload =
  | {
      title: string;
      message: string;
      type: NotificationType;
      priority: NotificationPriority;
      broadcast_all: true;
    }
  | {
      title: string;
      message: string;
      type: NotificationType;
      priority: NotificationPriority;
      recipient_role: RecipientRole;
    }
  | {
      title: string;
      message: string;
      type: NotificationType;
      priority: NotificationPriority;
      recipient_user_id: string;
    };

// ---------------------------------------------------------------------------
// User notification preferences
// ---------------------------------------------------------------------------

export interface NotificationPreferences {
  user_id?: string;
  enable_websocket: boolean;
  enable_email: boolean;
  enable_system: boolean;
  mute_until: string | null;
  updated_at?: string;
}

// ---------------------------------------------------------------------------
// WebSocket — server → client events
// Event shape: { "event": "<name>", "payload": {...}, "room": null, "sender": null }
// ---------------------------------------------------------------------------

export interface WsEnvelope<T = unknown> {
  event: string;
  payload: T;
  room: string | null;
  sender: string | null;
}

// Payloads for each server→client event
export interface WsConnectedPayload {
  connection_id: string;
  user_id: string;
  role: string;
  channels: string[];
}

export interface WsUnreadCountPayload {
  unread_count: number;
  critical_count: number;
  high_count: number;
}

export interface WsNotificationReadPayload {
  notification_id: string;
}

export interface WsNotificationDeletedPayload {
  notification_id: string;
}

export type WsServerEvent =
  | WsEnvelope<WsConnectedPayload>        // system.connected
  | WsEnvelope<WsUnreadCountPayload>      // notification.unread_count
  | WsEnvelope<{ notification: NotificationSummary }> // notification.new
  | WsEnvelope<{ notification: NotificationSummary }> // notification.broadcast
  | WsEnvelope<WsNotificationReadPayload> // notification.read
  | WsEnvelope<{ count: number }>         // notification.all_read
  | WsEnvelope<WsNotificationDeletedPayload>; // notification.deleted

// Convenience type alias for WS event names
export type WsEventType =
  | "system.connected"
  | "system.pong"
  | "system.error"
  | "notification.new"
  | "notification.broadcast"
  | "notification.read"
  | "notification.all_read"
  | "notification.deleted"
  | "notification.unread_count";

// Category alias for backwards compatibility
export type NotificationCategory = NotificationType;
