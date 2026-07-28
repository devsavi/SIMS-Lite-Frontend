/**
 * Notifications feature — TanStack Query hooks.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { notificationsApi } from "../api/notifications-api";
import { toast } from "@/app/components/ui/use-toast";
import type {
  NotificationFilterParams,
  ComposeNotificationPayload,
  NotificationPreferences,
} from "../types";

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (params?: NotificationFilterParams) =>
    [...notificationKeys.lists(), params] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
  preferences: () => [...notificationKeys.all, "preferences"] as const,
};

// ---------------------------------------------------------------------------
// Read hooks
// ---------------------------------------------------------------------------

export function useNotificationList(params?: NotificationFilterParams) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationsApi.getNotifications(params),
    staleTime: 1000 * 30, // 30 s
  });
}

/** Paginated infinite-scroll variant for the full notification center. */
export function useInfiniteNotifications(
  params?: Omit<NotificationFilterParams, "page">
) {
  return useInfiniteQuery({
    queryKey: [...notificationKeys.lists(), "infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      notificationsApi.getNotifications({ ...params, page: pageParam as number }),
    getNextPageParam: (last) => {
      const { page, pages } = last.pagination;
      return page < pages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 30,
  });
}

/** Unread badge count — short stale time, refetched on WS events. */
export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationsApi.getUnreadCount(),
    staleTime: 1000 * 15, // 15 s
    refetchInterval: 1000 * 60, // 60 s polling fallback
    refetchIntervalInBackground: false,
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: () => notificationsApi.getPreferences(),
    staleTime: 1000 * 60 * 5,
    retry: 1, // Gracefully handle if backend doesn't support preferences
  });
}

// ---------------------------------------------------------------------------
// Mutation hooks
// ---------------------------------------------------------------------------

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    // Optimistic update: decrement unread count immediately
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.unreadCount() });
      const prev = queryClient.getQueryData<number>(notificationKeys.unreadCount());
      queryClient.setQueryData<number>(
        notificationKeys.unreadCount(),
        (old) => Math.max(0, (old ?? 0) - 1)
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      // Roll back optimistic update
      if (ctx?.prev !== undefined) {
        queryClient.setQueryData(notificationKeys.unreadCount(), ctx.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAsUnread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsUnread(id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.unreadCount() });
      const prev = queryClient.getQueryData<number>(notificationKeys.unreadCount());
      queryClient.setQueryData<number>(
        notificationKeys.unreadCount(),
        (old) => (old ?? 0) + 1
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) {
        queryClient.setQueryData(notificationKeys.unreadCount(), ctx.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.unreadCount() });
      queryClient.setQueryData<number>(notificationKeys.unreadCount(), 0);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
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
