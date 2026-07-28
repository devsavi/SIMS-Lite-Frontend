// Public barrel export for the notifications feature module

// Pages
export { NotificationCenterPage } from "./pages/NotificationCenterPage";

// Components
export { NotificationBell } from "./components/notification-bell/NotificationBell";
export { NotificationPanel } from "./components/notification-panel/NotificationPanel";
export { NotificationList } from "./components/notification-list/NotificationList";
export { NotificationCard } from "./components/notification-card/NotificationCard";
export { NotificationSettings } from "./components/notification-settings/NotificationSettings";
export { ComposeNotification } from "./components/compose-notification/ComposeNotification";

// WebSocket
export { NotificationsProvider } from "./websocket/NotificationsProvider";
export { useWsNotifications } from "./websocket/use-ws-notifications";

// Hooks
export {
  notificationKeys,
  useNotificationList,
  useInfiniteNotifications,
  useUnreadCount,
  useNotificationPreferences,
  useMarkAsRead,
  useMarkAsUnread,
  useMarkAllAsRead,
  useDeleteNotification,
  useComposeNotification,
  useUpdateNotificationPreferences,
} from "./hooks/use-notifications";

// API
export { notificationsApi } from "./api/notifications-api";

// Types
export type {
  Notification,
  NotificationType,
  NotificationCategory,
  NotificationPriority,
  NotificationFilterParams,
  PaginatedNotifications,
  UnreadCountResponse,
  ComposeNotificationPayload,
  NotificationPreferences,
  WsEventType,
  WsEvent,
} from "./types";

// Schemas
export {
  composeNotificationSchema,
  notificationPreferencesSchema,
} from "./schemas";
export type {
  ComposeNotificationFormValues,
  NotificationPreferencesFormValues,
} from "./schemas";

// Utils
export {
  isBrowserNotificationsSupported,
  getCurrentPermission,
  requestPermission,
  showBrowserNotification,
} from "./utils/browser-notifications";
export type { BrowserNotificationOptions, NotificationPermissionState } from "./utils/browser-notifications";
