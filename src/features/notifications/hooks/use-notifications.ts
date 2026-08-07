/**
 * Notifications feature — TanStack Query hooks.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  type InfiniteData,
} from "@tanstack/react-query";
import { notificationsApi } from "../api/notifications-api";
import { toast } from "@/app/components/ui/use-toast";
import type {
  Notification,
  NotificationFilterParams,
  PaginatedNotifications,
  UnreadCountResponse,
  ComposeNotificationPayload,
  NotificationPreferences,
  NotificationSummary,
} from "../types";

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (params?: NotificationFilterParams) =>
    [...notificationKeys.lists(), params] as const,
  infinite: (params?: Omit<NotificationFilterParams, "page">) =>
    [...notificationKeys.lists(), "infinite", params] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
  recent: (limit?: number) => [...notificationKeys.all, "recent", limit] as const,
  criticalAlerts: () => [...notificationKeys.all, "critical-alerts"] as const,
  preferences: () => [...notificationKeys.all, "preferences"] as const,
};

// ---------------------------------------------------------------------------
// Read hooks
// ---------------------------------------------------------------------------

/** Used by the header notification panel — GET /notifications/dashboard/recent */
export function useRecentNotifications(limit = 10) {
  return useQuery({
    queryKey: notificationKeys.recent(limit),
    queryFn: () => notificationsApi.getRecentNotifications(limit),
    staleTime: 1000 * 30,
    refetchOnMount: true,
  });
}

/** Non-paginated list — used where a flat page is needed */
export function useNotificationList(params?: NotificationFilterParams) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationsApi.getNotifications(params),
    staleTime: 1000 * 30,
    refetchOnMount: true,
  });
}

/** Infinite-scroll variant — used by the Notification Center page */
export function useInfiniteNotifications(
  params?: Omit<NotificationFilterParams, "page">
) {
  return useInfiniteQuery({
    queryKey: notificationKeys.infinite(params),
    queryFn: ({ pageParam = 1 }) =>
      notificationsApi.getNotifications({ ...params, page: pageParam as number }),
    getNextPageParam: (last) => {
      const { page, pages } = last.pagination;
      return page < pages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 30,
    refetchOnMount: true,
  });
}

/** Unread badge count — returns just the number. Used by simple consumers. */
export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationsApi.getUnreadCount(),
    staleTime: 0,
    refetchInterval: 1000 * 60,
    refetchIntervalInBackground: false,
    refetchOnMount: true,
    select: (data) => data.unread_count,
  });
}

/**
 * Full unread count breakdown (unread_count, critical_count, high_count).
 * Used by the bell icon to show the critical/high indicator.
 */
export function useUnreadCountFull() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationsApi.getUnreadCount(),
    staleTime: 0,
    refetchInterval: 1000 * 60,
    refetchIntervalInBackground: false,
    refetchOnMount: true,
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: () => notificationsApi.getPreferences(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

// ---------------------------------------------------------------------------
// Mutation hooks
// ---------------------------------------------------------------------------

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    // Optimistically flip is_read in every cached list
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      // Snapshot
      const prevCount = queryClient.getQueryData<UnreadCountResponse>(
        notificationKeys.unreadCount()
      );

      // Update unread count
      queryClient.setQueryData<UnreadCountResponse>(
        notificationKeys.unreadCount(),
        (old) =>
          old
            ? { ...old, unread_count: Math.max(0, old.unread_count - 1) }
            : old
      );

      // Update infinite list pages
      queryClient.setQueriesData<InfiniteData<PaginatedNotifications>>(
        { queryKey: notificationKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((n) =>
                n.id === id
                  ? { ...n, is_read: true, read_at: new Date().toISOString() }
                  : n
              ),
            })),
          };
        }
      );

      // Update recent list
      queryClient.setQueriesData<{ notifications: NotificationSummary[]; unread_count: number }>(
        { queryKey: notificationKeys.recent() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            unread_count: Math.max(0, old.unread_count - 1),
            notifications: old.notifications.map((n) =>
              n.id === id ? { ...n, is_read: true } : n
            ),
          };
        }
      );

      return { prevCount };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prevCount !== undefined) {
        queryClient.setQueryData(notificationKeys.unreadCount(), ctx.prevCount);
      }
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
}

export function useMarkAsUnread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      const prevCount = queryClient.getQueryData<UnreadCountResponse>(
        notificationKeys.unreadCount()
      );

      queryClient.setQueryData<UnreadCountResponse>(
        notificationKeys.unreadCount(),
        (old) => (old ? { ...old, unread_count: old.unread_count + 1 } : old)
      );

      queryClient.setQueriesData<InfiniteData<PaginatedNotifications>>(
        { queryKey: notificationKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((n) =>
                n.id === id ? { ...n, is_read: false, read_at: null } : n
              ),
            })),
          };
        }
      );

      return { prevCount };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prevCount !== undefined) {
        queryClient.setQueryData(notificationKeys.unreadCount(), ctx.prevCount);
      }
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      // Zero out unread count immediately
      queryClient.setQueryData<UnreadCountResponse>(
        notificationKeys.unreadCount(),
        (old) => (old ? { ...old, unread_count: 0, critical_count: 0, high_count: 0 } : old)
      );

      // Mark all as read in every list cache
      queryClient.setQueriesData<InfiniteData<PaginatedNotifications>>(
        { queryKey: notificationKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((n) => ({
                ...n,
                is_read: true,
                read_at: new Date().toISOString(),
              })),
            })),
          };
        }
      );

      queryClient.setQueriesData<{ notifications: NotificationSummary[]; unread_count: number }>(
        { queryKey: notificationKeys.recent() },
        (old) => {
          if (!old) return old;
          return {
            unread_count: 0,
            notifications: old.notifications.map((n) => ({ ...n, is_read: true })),
          };
        }
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
    onSuccess: () => {
      toast({ title: "All notifications marked as read", variant: "default" });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.deleteNotification(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      // Remove from infinite list
      queryClient.setQueriesData<InfiniteData<PaginatedNotifications>>(
        { queryKey: notificationKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((n) => n.id !== id),
              pagination: {
                ...page.pagination,
                total: Math.max(0, page.pagination.total - 1),
              },
            })),
          };
        }
      );

      // Remove from recent list
      queryClient.setQueriesData<{ notifications: NotificationSummary[]; unread_count: number }>(
        { queryKey: notificationKeys.recent() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            notifications: old.notifications.filter((n) => n.id !== id),
          };
        }
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onSuccess: () => {
      toast({ title: "Notification deleted", variant: "default" });
    },
    onError: () => {
      toast({ title: "Failed to delete notification", variant: "destructive" });
    },
  });
}

export function useComposeNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ComposeNotificationPayload) =>
      notificationsApi.compose(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast({ title: "Notification sent successfully", variant: "success" });
    },
    onError: () => {
      toast({
        title: "Failed to send notification",
        description: "Please check your inputs and try again.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prefs: Partial<NotificationPreferences>) =>
      notificationsApi.updatePreferences(prefs),
    onSuccess: (data) => {
      queryClient.setQueryData(notificationKeys.preferences(), data);
      toast({ title: "Preferences saved", variant: "success" });
    },
    onError: () => {
      toast({ title: "Failed to save preferences", variant: "destructive" });
    },
  });
}
