/**
 * Notifications feature — TypeScript types.
 * Aligned with the backend Notification API.
 */

// ---------------------------------------------------------------------------
// Core notification types
// ---------------------------------------------------------------------------

export type NotificationType = "info" | "success" | "warning" | "error";

export type NotificationCategory =
  | "inventory"
  | "procurement"
  | "stock_release"
  | "administration"
  | "system"
  | "general";

export type NotificationPriority = "low" | "normal" | "high" | "urgent";

export interface SenderRef {
  id: string;
  full_name: string;
  email: string;
}

/** Full server-side notification object */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  is_read: boolean;
  sender: SenderRef | null;
  recipient_id: string;
  action_url: string | null;
  created_at: string;
  read_at: string | null;
}

// ---------------------------------------------------------------------------
// API response wrappers
// ---------------------------------------------------------------------------

export interface PaginatedNotifications {
  data: Notification[];
  pagination: {
    page: number;
    size: number;
    total: number;
    pages: number;
  };
  unread_count: number;
}

export interface UnreadCountResponse {
  unread_count: number;
}

// ---------------------------------------------------------------------------
// Filter params
// ---------------------------------------------------------------------------

export interface NotificationFilterParams {
  page?: number;
  size?: number;
  search?: string;
  type?: NotificationType | "ALL";
  category?: NotificationCategory | "ALL";
  is_read?: boolean | "ALL";
  from_date?: string;
  to_date?: string;
}

// ---------------------------------------------------------------------------
// Compose payload (admin)
// ---------------------------------------------------------------------------

export type RecipientType = "all" | "role" | "user";

export interface ComposeNotificationPayload {
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  recipient_type: RecipientType;
  recipient_role?: string;
  recipient_user_id?: string;
  action_url?: string;
}

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
// WebSocket event types (discriminated union)
// ---------------------------------------------------------------------------

export type WsEventType =
  // Inventory
  | "low_stock_alert"
  | "stock_adjustment_completed"
  | "stock_release_approved"
  | "stock_release_rejected"
  // Procurement
  | "purchase_order_submitted"
  | "purchase_order_approved"
  | "purchase_order_rejected"
  | "grn_submitted"
  | "grn_approved"
  // Administration
  | "user_created"
  | "role_changed"
  | "settings_updated"
  // System
  | "broadcast"
  | "maintenance"
  // Generic
  | "notification";

export interface WsBaseEvent {
  type: WsEventType;
  timestamp: string;
}

export interface WsNotificationEvent extends WsBaseEvent {
  type: "notification";
  payload: Notification;
}

export interface WsLowStockEvent extends WsBaseEvent {
  type: "low_stock_alert";
  payload: {
    product_id: string;
    product_name: string;
    current_quantity: number;
    reorder_level: number;
  };
}

export interface WsPurchaseOrderEvent extends WsBaseEvent {
  type:
    | "purchase_order_submitted"
    | "purchase_order_approved"
    | "purchase_order_rejected";
  payload: {
    purchase_order_id: string;
    po_number: string;
    status: string;
  };
}

export interface WsGrnEvent extends WsBaseEvent {
  type: "grn_submitted" | "grn_approved";
  payload: {
    grn_id: string;
    grn_number: string;
  };
}

export interface WsStockReleaseEvent extends WsBaseEvent {
  type: "stock_release_approved" | "stock_release_rejected";
  payload: {
    stock_release_id: string;
    release_number: string;
  };
}

export interface WsBroadcastEvent extends WsBaseEvent {
  type: "broadcast" | "maintenance";
  payload: {
    title: string;
    message: string;
    priority: NotificationPriority;
  };
}

export interface WsUserEvent extends WsBaseEvent {
  type: "user_created" | "role_changed";
  payload: {
    user_id: string;
    user_name: string;
  };
}

export interface WsStockAdjustmentEvent extends WsBaseEvent {
  type: "stock_adjustment_completed";
  payload: {
    adjustment_id: string;
    product_name: string;
  };
}

export type WsEvent =
  | WsNotificationEvent
  | WsLowStockEvent
  | WsPurchaseOrderEvent
  | WsGrnEvent
  | WsStockReleaseEvent
  | WsBroadcastEvent
  | WsUserEvent
  | WsStockAdjustmentEvent;
