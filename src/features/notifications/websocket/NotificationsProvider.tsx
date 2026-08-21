"use client";

/**
 * NotificationsProvider
 *
 * Wraps the application tree and:
 *  1. Connects the WsClient when the user is authenticated.
 *  2. Disconnects on logout / component unmount.
 *  3. Handles all server→client WS events:
 *       system.connected         — logs connection info
 *       notification.unread_count — syncs badge count in cache
 *       notification.new          — prepends to lists, increments badge
 *       notification.broadcast    — same as notification.new + toast
 *       notification.read         — flips is_read in cache locally
 *       notification.all_read     — marks all as read in cache locally
 *       notification.deleted      — removes from cache locally
 *  4. Shows toasts + browser notifications for important events.
 *  5. Provides connection status via context.
 */

import * as React from "react";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { getWsClient, configureWsClient, type WsStatus } from "@/lib/websocket/ws-client";
import { useAuthStore } from "@/stores/auth.store";
import { accessToken, refreshToken } from "@/lib/auth/token";
import { authApi } from "@/features/auth/api/auth-api";
import { notificationKeys } from "../hooks/use-notifications";
import {
  categoryKeys,
  brandKeys,
  uomKeys,
  supplierKeys,
  productKeys,
} from "@/features/master-data/hooks/query-keys";
import { adminUsersKeys } from "@/features/admin/users/hooks/use-admin-users";
import { PO_QUERY_KEYS } from "@/features/procurement/purchase-orders/hooks/use-purchase-orders";
import { GRN_QUERY_KEYS } from "@/features/procurement/grns/hooks/use-grns";
import { stockReleaseKeys } from "@/features/stock-release/hooks/use-stock-release";
import { inventoryKeys } from "@/features/inventory/hooks/use-inventory";
import { toast } from "@/app/components/ui/use-toast";
import { showBrowserNotification, registerServiceWorker } from "../utils/browser-notifications";
import type {
  Notification,
  NotificationSummary,
  PaginatedNotifications,
  UnreadCountResponse,
  WsConnectedPayload,
  WsUnreadCountPayload,
  WsNotificationReadPayload,
  WsNotificationDeletedPayload,
  NotificationPreferences,
} from "../types";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface NotificationsContextValue {
  status: WsStatus;
  isConnected: boolean;
}

const NotificationsContext = React.createContext<NotificationsContextValue>({
  status: "idle",
  isConnected: false,
});

export function useNotificationsContext(): NotificationsContextValue {
  return React.useContext(NotificationsContext);
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface NotificationsProviderProps {
  children: React.ReactNode;
}

export function NotificationsProvider({ children }: NotificationsProviderProps) {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [status, setStatus] = React.useState<WsStatus>("idle");

  const maybeShowBrowserNotification = React.useCallback(
    (opts: Parameters<typeof showBrowserNotification>[0]) => {
      const prefs = queryClient.getQueryData<NotificationPreferences>(
        notificationKeys.preferences()
      );
      if (prefs) {
        if (!prefs.enable_system) return;
        if (prefs.mute_until && new Date(prefs.mute_until).getTime() > Date.now()) return;
      }
      showBrowserNotification(opts);
    },
    [queryClient]
  );

  // -------------------------------------------------------------------------
  // Wire token getter once & register Service Worker for notifications
  // -------------------------------------------------------------------------
  React.useEffect(() => {
    configureWsClient({ getToken: () => accessToken.get() });
    registerServiceWorker();
  }, []);

  // -------------------------------------------------------------------------
  // Connect / disconnect based on auth state
  // -------------------------------------------------------------------------
  React.useEffect(() => {
    const ws = getWsClient();

    if (!isAuthenticated) {
      ws.disconnect();
      return;
    }

    const unsubStatus = ws.onStatus(setStatus);
    ws.connect();

    // -----------------------------------------------------------------------
    // Toast deduplication — prevents showing two toasts when the backend sends
    // both notification.new and notification.broadcast for the same notification.
    // -----------------------------------------------------------------------
    const _toastedIds = new Set<string>();
    function toastOnce(id: string, title: string, message: string | undefined, isUrgent: boolean) {
      if (_toastedIds.has(id)) return;
      _toastedIds.add(id);
      // Auto-clean after 5 s so repeated distinct notifications aren't suppressed
      setTimeout(() => _toastedIds.delete(id), 5_000);
      toast({
        title,
        description: message,
        variant: isUrgent ? "destructive" : "default",
      });
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    /** Convert a full Notification to a NotificationSummary */
    function toSummary(n: Notification): NotificationSummary {
      return {
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        priority: n.priority,
        is_read: n.is_read,
        created_at: n.created_at,
      };
    }

    /** Prepend a new notification to all infinite-query pages (page 1 only) */
    function prependToInfiniteList(notification: Notification) {
      queryClient.setQueriesData<InfiniteData<PaginatedNotifications>>(
        { queryKey: notificationKeys.lists() },
        (old) => {
          if (!old) return old;
          const firstPage = old.pages[0];
          if (!firstPage) return old;
          // Avoid duplicates
          const alreadyExists = firstPage.data.some((n) => n.id === notification.id);
          if (alreadyExists) return old;
          return {
            ...old,
            pages: [
              {
                ...firstPage,
                data: [notification, ...firstPage.data],
                pagination: {
                  ...firstPage.pagination,
                  total: firstPage.pagination.total + 1,
                },
              },
              ...old.pages.slice(1),
            ],
          };
        }
      );
    }

    /** Prepend a notification summary to the recent list in cache */
    function prependToRecentList(notification: Notification) {
      queryClient.setQueriesData<{ notifications: NotificationSummary[]; unread_count: number }>(
        { queryKey: notificationKeys.recent() },
        (old) => {
          if (!old) return old;
          const summary = toSummary(notification);
          // Avoid duplicates
          if (old.notifications.some((n) => n.id === notification.id)) return old;
          return {
            // Do not touch unread_count here — it is owned by the
            // notification.unread_count WS event (or the unread-count cache key).
            // Bumping it here AND in the count cache = double inflation.
            unread_count: old.unread_count,
            notifications: [summary, ...old.notifications].slice(0, 10),
          };
        }
      );
    }

    // -----------------------------------------------------------------------
    // system.connected — server confirms connection + sends initial unread count
    // -----------------------------------------------------------------------
    const unsubConnected = ws.on<WsConnectedPayload>("system.connected", () => {
      // Connection confirmed — the server will follow immediately with
      // notification.unread_count, so nothing extra needed here.
    });

    // -----------------------------------------------------------------------
    // system.auth_error — token was rejected (code 4001); refresh and reconnect
    // -----------------------------------------------------------------------
    const unsubAuthError = ws.on<number>("system.auth_error", async () => {
      const rt = refreshToken.get();
      if (!rt) return; // No refresh token — stay disconnected
      try {
        const tokenRes = await authApi.refreshToken({ refresh_token: rt });
        accessToken.set(tokenRes.access_token, tokenRes.expires_in);
        refreshToken.set(tokenRes.refresh_token);
        // Reconnect — getToken() will now return the fresh access token
        ws.connect();
      } catch {
        // Refresh failed — clear session
        useAuthStore.getState().clearSession();
        if (typeof window !== "undefined") {
          window.location.replace("/login");
        }
      }
    });

    // -----------------------------------------------------------------------
    // notification.unread_count — sync badge from server
    // -----------------------------------------------------------------------
    const unsubUnreadCount = ws.on<WsUnreadCountPayload>(
      "notification.unread_count",
      (payload) => {
        queryClient.setQueryData<UnreadCountResponse>(
          notificationKeys.unreadCount(),
          payload
        );
      }
    );

    // Helper: refetch the count from REST — used whenever a WS event changes state
    function refetchUnreadCount() {
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    }

    // -----------------------------------------------------------------------
    // notification.new — a new notification for this user
    // -----------------------------------------------------------------------
    const unsubNew = ws.on<{ notification: NotificationSummary }>(
      "notification.new",
      ({ notification }) => {
        const fullNotif: Notification = {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority,
          is_read: notification.is_read,
          created_at: notification.created_at,
          recipient_type: "USER",
          recipient_role: null,
          recipient_user_id: null,
          sender_id: null,
          read_at: null,
          data: null,
          updated_at: notification.created_at,
        };

        prependToInfiniteList(fullNotif);
        prependToRecentList(fullNotif);
        refetchUnreadCount();

        const isUrgent =
          notification.priority === "HIGH" || notification.priority === "CRITICAL";

        toastOnce(notification.id, notification.title, notification.message, isUrgent);

        maybeShowBrowserNotification({
          id: notification.id,
          title: notification.title,
          body: notification.message,
        });
      }
    );

    // -----------------------------------------------------------------------
    // notification.broadcast — broadcast to all users
    // -----------------------------------------------------------------------
    const unsubBroadcast = ws.on<{ notification: NotificationSummary }>(
      "notification.broadcast",
      ({ notification }) => {
        const fullNotif: Notification = {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority,
          is_read: notification.is_read,
          created_at: notification.created_at,
          recipient_type: "BROADCAST",
          recipient_role: null,
          recipient_user_id: null,
          sender_id: null,
          read_at: null,
          data: null,
          updated_at: notification.created_at,
        };

        prependToInfiniteList(fullNotif);
        prependToRecentList(fullNotif);
        refetchUnreadCount();

        const isUrgent =
          notification.priority === "HIGH" || notification.priority === "CRITICAL";

        toastOnce(notification.id, notification.title, notification.message, isUrgent);

        maybeShowBrowserNotification({
          id: notification.id,
          title: notification.title,
          body: notification.message,
          forceShowWhenFocused: true,
        });
      }
    );

    // -----------------------------------------------------------------------
    // notification.read — a notification was marked read (could be from another tab)
    // -----------------------------------------------------------------------
    const unsubRead = ws.on<WsNotificationReadPayload>(
      "notification.read",
      ({ notification_id }) => {
        // Flip is_read locally without a network round-trip
        queryClient.setQueriesData<InfiniteData<PaginatedNotifications>>(
          { queryKey: notificationKeys.lists() },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.map((n) =>
                  n.id === notification_id
                    ? { ...n, is_read: true, read_at: new Date().toISOString() }
                    : n
                ),
              })),
            };
          }
        );

        queryClient.setQueriesData<{ notifications: NotificationSummary[]; unread_count: number }>(
          { queryKey: notificationKeys.recent() },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              notifications: old.notifications.map((n) =>
                n.id === notification_id ? { ...n, is_read: true } : n
              ),
            };
          }
        );

        // The server follows notification.read with notification.unread_count,
        // but we also hit the REST endpoint directly to guarantee accuracy.
        refetchUnreadCount();
      }
    );

    // -----------------------------------------------------------------------
    // notification.all_read — bulk mark all read
    // -----------------------------------------------------------------------
    const unsubAllRead = ws.on("notification.all_read", () => {
      queryClient.setQueryData<UnreadCountResponse>(
        notificationKeys.unreadCount(),
        (old) => (old ? { ...old, unread_count: 0, critical_count: 0, high_count: 0 } : old)
      );

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

      refetchUnreadCount();
    });

    // -----------------------------------------------------------------------
    // notification.deleted — a notification was deleted
    // -----------------------------------------------------------------------
    const unsubDeleted = ws.on<WsNotificationDeletedPayload>(
      "notification.deleted",
      ({ notification_id }) => {
        queryClient.setQueriesData<InfiniteData<PaginatedNotifications>>(
          { queryKey: notificationKeys.lists() },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.filter((n) => n.id !== notification_id),
                pagination: {
                  ...page.pagination,
                  total: Math.max(0, page.pagination.total - 1),
                },
              })),
            };
          }
        );

        queryClient.setQueriesData<{ notifications: NotificationSummary[]; unread_count: number }>(
          { queryKey: notificationKeys.recent() },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              notifications: old.notifications.filter((n) => n.id !== notification_id),
            };
          }
        );
      }
    );

    // -----------------------------------------------------------------------
    // Domain Events — system-wide real-time invalidation
    // -----------------------------------------------------------------------
    const unsubDomainEvents = ws.on("*", (msg: unknown) => {
      const message = msg as { event?: string };
      const event = message?.event;
      if (!event || typeof event !== "string") return;

      // Master Data signals -> update dropdowns, lists & forms instantly for all users
      if (event === "master_data.category_changed") {
        queryClient.invalidateQueries({ queryKey: categoryKeys.all, refetchType: "all" });
        queryClient.invalidateQueries({ queryKey: productKeys.all, refetchType: "all" });
      } else if (event === "master_data.brand_changed") {
        queryClient.invalidateQueries({ queryKey: brandKeys.all, refetchType: "all" });
        queryClient.invalidateQueries({ queryKey: productKeys.all, refetchType: "all" });
      } else if (event === "master_data.uom_changed") {
        queryClient.invalidateQueries({ queryKey: uomKeys.all, refetchType: "all" });
        queryClient.invalidateQueries({ queryKey: productKeys.all, refetchType: "all" });
      } else if (event === "master_data.supplier_changed") {
        queryClient.invalidateQueries({ queryKey: supplierKeys.all, refetchType: "all" });
        queryClient.invalidateQueries({ queryKey: productKeys.all, refetchType: "all" });
        queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.all, refetchType: "all" });
        queryClient.invalidateQueries({ queryKey: ["dashboard"], refetchType: "all" });
      } else if (event === "master_data.product_changed") {
        queryClient.invalidateQueries({ queryKey: productKeys.all, refetchType: "all" });
        queryClient.invalidateQueries({ queryKey: inventoryKeys.all, refetchType: "all" });
        queryClient.invalidateQueries({ queryKey: ["dashboard"], refetchType: "all" });
      } else if (event === "user.changed") {
        queryClient.invalidateQueries({ queryKey: adminUsersKeys.all, refetchType: "all" });
        queryClient.invalidateQueries({ queryKey: ["users"], refetchType: "all" });
      }

      // Workflow & Operational signals -> update live lists & dashboards instantly
      else if (event.startsWith("procurement.")) {
        queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.all, refetchType: "all" });
        queryClient.invalidateQueries({ queryKey: GRN_QUERY_KEYS.all, refetchType: "all" });
        queryClient.invalidateQueries({ queryKey: ["dashboard"], refetchType: "all" });
      } else if (event.startsWith("inventory.")) {
        queryClient.invalidateQueries({ queryKey: inventoryKeys.all, refetchType: "all" });
        queryClient.invalidateQueries({ queryKey: ["dashboard"], refetchType: "all" });
      } else if (event.startsWith("stock_release.")) {
        queryClient.invalidateQueries({ queryKey: stockReleaseKeys.all, refetchType: "all" });
        queryClient.invalidateQueries({ queryKey: ["dashboard"], refetchType: "all" });
      }
    });

    // -----------------------------------------------------------------------
    // Page visibility — request fresh count when tab regains focus
    // -----------------------------------------------------------------------
    function handleVisibilityChange() {
      if (
        document.visibilityState === "visible" &&
        ws.isConnected
      ) {
        ws.emit("notification.unread_count");
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // -----------------------------------------------------------------------
    // Cleanup
    // -----------------------------------------------------------------------
    return () => {
      unsubStatus();
      unsubConnected();
      unsubAuthError();
      unsubUnreadCount();
      unsubNew();
      unsubBroadcast();
      unsubRead();
      unsubAllRead();
      unsubDeleted();
      unsubDomainEvents();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, queryClient, maybeShowBrowserNotification]);

  return (
    <NotificationsContext.Provider
      value={{ status, isConnected: status === "connected" }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
