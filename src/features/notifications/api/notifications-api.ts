/**
 * Notifications feature — REST API calls.
 * All paths relative to NEXT_PUBLIC_API_URL.
 */

import { get, post, patch, put, del } from "@/lib/api/client";
import type { SuccessResponse } from "@/features/auth/types";
import type {
  Notification,
  NotificationFilterParams,
  PaginatedNotifications,
  UnreadCountResponse,
  ComposeNotificationPayload,
  NotificationPreferences,
} from "../types";

const BASE = "/notifications";

export const notificationsApi = {
  // ---------------------------------------------------------------------------
  // List — paginated with optional filters
  // ---------------------------------------------------------------------------

  /**
   * GET /notifications
   * Returns paginated notifications for the current user.
   */
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

    return get<PaginatedNotifications>(BASE, { params: query });
  },

  // ---------------------------------------------------------------------------
  // Unread count
  // ---------------------------------------------------------------------------

  /**
   * GET /notifications/unread-count
   * Returns the current unread notification count.
   */
  async getUnreadCount(): Promise<number> {
    const res = await get<SuccessResponse<UnreadCountResponse>>(
      `${BASE}/dashboard/unread-count`
    );
    return res.data.unread_count;
  },

  // ---------------------------------------------------------------------------
  // Mark as read / unread
  // ---------------------------------------------------------------------------

  /**
   * PATCH /notifications/:id/read
   */
  async markAsRead(id: string): Promise<Notification> {
    const res = await patch<SuccessResponse<Notification>>(`${BASE}/${id}/read`);
    return res.data;
  },

  /**
   * PATCH /notifications/:id/unread
   */
  async markAsUnread(id: string): Promise<Notification> {
    const res = await patch<SuccessResponse<Notification>>(`${BASE}/${id}/unread`);
    return res.data;
  },

  /**
   * PATCH /notifications/read-all
   * Marks all notifications for the current user as read.
   */
  async markAllAsRead(): Promise<{ updated_count: number }> {
    const res = await patch<SuccessResponse<{ updated_count: number }>>(
      `${BASE}/read-all`
    );
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  /**
   * DELETE /notifications/:id
   */
  async deleteNotification(id: string): Promise<void> {
    await del(`${BASE}/${id}`);
  },

  // ---------------------------------------------------------------------------
  // Compose (admin only)
  // ---------------------------------------------------------------------------

  /**
   * POST /api/v1/admin/notifications/send
   * Sends a notification to a user, a role, or all users.
   *
   * Only one targeting field is set per request:
   *   broadcast_all   → all users
   *   recipient_role  → users in that role
   *   recipient_user_id → one specific user (UUID)
   */
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

  /**
   * GET /notifications/preferences/me
   */
  async getPreferences(): Promise<NotificationPreferences> {
    const res = await get<SuccessResponse<NotificationPreferences>>(
      `${BASE}/preferences/me`
    );
    return res.data;
  },

  /**
   * PUT /notifications/preferences/me
   */
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
