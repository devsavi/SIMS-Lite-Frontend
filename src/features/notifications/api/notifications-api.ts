/**
 * Notifications feature — REST API calls.
 * All responses are wrapped in { "status": "success", "data": ... }.
 */

import { get, post, patch, put, del } from "@/lib/api/client";
import type { SuccessResponse } from "@/features/auth/types";
import type {
  Notification,
  NotificationFilterParams,
  PaginatedNotifications,
  PaginatedApiResponse,
  UnreadCountResponse,
  RecentNotificationsResponse,
  CriticalAlertsResponse,
  ComposeNotificationPayload,
  NotificationPreferences,
} from "../types";

const BASE = "/notifications";

export const notificationsApi = {
  // ---------------------------------------------------------------------------
  // List — GET /notifications  (paginated, filterable)
  // ---------------------------------------------------------------------------

  async getNotifications(
    params?: NotificationFilterParams
  ): Promise<PaginatedNotifications> {
    const query: Record<string, unknown> = {
      page: params?.page ?? 1,
      size: params?.size ?? 20,
    };
    if (params?.search) query.search = params.search;
    if (params?.type && params.type !== "ALL") query.type = params.type;
    if (params?.is_read !== undefined && params.is_read !== "ALL")
      query.is_read = params.is_read;
    if (params?.from_date) query.from_date = params.from_date;
    if (params?.to_date) query.to_date = params.to_date;

    // Server returns { status, data: [...], pagination: {...} }
    // "pagination" is a sibling of "data", not nested inside it.
    const res = await get<PaginatedApiResponse<Notification>>(BASE, { params: query });
    return { data: res.data, pagination: res.pagination };
  },

  // ---------------------------------------------------------------------------
  // Dashboard — unread count badge
  // GET /notifications/dashboard/unread-count
  // ---------------------------------------------------------------------------

  async getUnreadCount(): Promise<UnreadCountResponse> {
    const res = await get<SuccessResponse<UnreadCountResponse>>(
      `${BASE}/dashboard/unread-count`
    );
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // Dashboard — recent notifications (header popup)
  // GET /notifications/dashboard/recent?limit=10
  // ---------------------------------------------------------------------------

  async getRecentNotifications(limit = 10): Promise<RecentNotificationsResponse> {
    const res = await get<SuccessResponse<RecentNotificationsResponse>>(
      `${BASE}/dashboard/recent`,
      { params: { limit } }
    );
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // Dashboard — critical alerts
  // GET /notifications/dashboard/critical-alerts
  // ---------------------------------------------------------------------------

  async getCriticalAlerts(): Promise<CriticalAlertsResponse> {
    const res = await get<SuccessResponse<CriticalAlertsResponse>>(
      `${BASE}/dashboard/critical-alerts`
    );
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // Single notification
  // GET /notifications/{id}
  // ---------------------------------------------------------------------------

  async getNotification(id: string): Promise<Notification> {
    const res = await get<SuccessResponse<Notification>>(`${BASE}/${id}`);
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // Mark as read / unread
  // ---------------------------------------------------------------------------

  /** PATCH /notifications/{id}/read */
  async markAsRead(id: string): Promise<Notification> {
    const res = await patch<SuccessResponse<Notification>>(`${BASE}/${id}/read`);
    return res.data;
  },

  /** PATCH /notifications/read-all */
  async markAllAsRead(): Promise<{ updated_count: number }> {
    const res = await patch<SuccessResponse<{ updated_count: number }>>(
      `${BASE}/read-all`
    );
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // Delete
  // DELETE /notifications/{id}
  // ---------------------------------------------------------------------------

  async deleteNotification(id: string): Promise<void> {
    await del(`${BASE}/${id}`);
  },

  // ---------------------------------------------------------------------------
  // Compose (admin only)
  // POST /admin/notifications/send
  // ---------------------------------------------------------------------------

  async compose(payload: ComposeNotificationPayload): Promise<Notification> {
    const res = await post<SuccessResponse<Notification>>(
      `admin/notifications/send`,
      payload
    );
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // Preferences
  // ---------------------------------------------------------------------------

  /** GET /notifications/preferences/me */
  async getPreferences(): Promise<NotificationPreferences> {
    const res = await get<SuccessResponse<NotificationPreferences>>(
      `${BASE}/preferences/me`
    );
    return res.data;
  },

  /** PUT /notifications/preferences/me */
  async updatePreferences(
    prefs: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const res = await put<SuccessResponse<NotificationPreferences>>(
      `${BASE}/preferences/me`,
      prefs
    );
    return res.data;
  },
};
