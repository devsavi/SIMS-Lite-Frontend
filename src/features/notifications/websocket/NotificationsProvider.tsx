"use client";

/**
 * NotificationsProvider
 *
 * Wraps the application tree and:
 *  1. Connects the WsClient when the user is authenticated.
 *  2. Disconnects on logout or component unmount.
 *  3. Dispatches incoming WS events to:
 *     - TanStack Query cache invalidations
 *     - Toast notifications for important events
 *     - Browser (desktop) notifications when the tab is backgrounded
 *  4. Provides connection status via context.
 */

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getWsClient, configureWsClient, type WsStatus } from "@/lib/websocket/ws-client";
import { useAuthStore } from "@/stores/auth.store";
import { accessToken } from "@/lib/auth/token";
import { notificationKeys } from "../hooks/use-notifications";
import { toast } from "@/app/components/ui/use-toast";
import { showBrowserNotification } from "../utils/browser-notifications";
import type { WsEvent } from "../types";

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
// Query keys for other features (for cache invalidation)
// ---------------------------------------------------------------------------

const INVENTORY_KEY = ["inventory"];
const DASHBOARD_KEY = ["dashboard"];
const PURCHASE_ORDERS_KEY = ["purchase-orders"];
const GRNS_KEY = ["grns"];
const STOCK_RELEASE_KEY = ["stock-release"];
const USERS_KEY = ["users"];

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

  // -------------------------------------------------------------------------
  // Wire token getter once
  // -------------------------------------------------------------------------
  React.useEffect(() => {
    configureWsClient({ getToken: () => accessToken.get() });
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

    // Subscribe to status changes
    const unsubStatus = ws.onStatus(setStatus);

    // Connect (no-op if already connected)
    ws.connect();

    // -----------------------------------------------------------------------
    // Event handlers
    // -----------------------------------------------------------------------

    function invalidate(keys: readonly unknown[]) {
      queryClient.invalidateQueries({ queryKey: keys });
    }

    // Generic notification event — refresh badge + list
    const unsubNotification = ws.on<WsEvent["payload"]>("notification", (payload) => {
      invalidate(notificationKeys.all);
      const n = payload as { title?: string; message?: string; priority?: string };
      if (n.title) {
        const isUrgent = n.priority === "high" || n.priority === "urgent";
        toast({
          title: n.title,
          description: n.message,
          variant: isUrgent ? "destructive" : "default",
        });
        showBrowserNotification({
          id: `ws-${Date.now()}`,
          title: n.title,
          body: n.message,
        });
      }
    });

    // --- Inventory ---
    const unsubLowStock = ws.on("low_stock_alert", (payload) => {
      invalidate(INVENTORY_KEY);
      invalidate(DASHBOARD_KEY);
      invalidate(notificationKeys.unreadCount());
      const p = payload as { product_name?: string; current_quantity?: number };
      toast({
        title: "Low Stock Alert",
        description: p.product_name
          ? `${p.product_name} — only ${p.current_quantity} units remaining.`
          : "A product is running low on stock.",
        variant: "destructive",
      });
    });

    const unsubStockAdjustment = ws.on("stock_adjustment_completed", () => {
      invalidate(INVENTORY_KEY);
      invalidate(DASHBOARD_KEY);
      invalidate(notificationKeys.unreadCount());
    });

    // --- Stock Release ---
    const unsubStockRelease = ws.on("stock_release_approved", () => {
      invalidate(STOCK_RELEASE_KEY);
      invalidate(DASHBOARD_KEY);
      invalidate(notificationKeys.unreadCount());
    });

    ws.on("stock_release_rejected", () => {
      invalidate(STOCK_RELEASE_KEY);
      invalidate(DASHBOARD_KEY);
      invalidate(notificationKeys.unreadCount());
    });

    // --- Purchase Orders ---
    const unsubPO = ws.on("purchase_order_submitted", () => {
      invalidate(PURCHASE_ORDERS_KEY);
      invalidate(DASHBOARD_KEY);
      invalidate(notificationKeys.unreadCount());
    });
    ws.on("purchase_order_approved", () => {
      invalidate(PURCHASE_ORDERS_KEY);
      invalidate(DASHBOARD_KEY);
      invalidate(notificationKeys.unreadCount());
    });
    ws.on("purchase_order_rejected", () => {
      invalidate(PURCHASE_ORDERS_KEY);
      invalidate(DASHBOARD_KEY);
      invalidate(notificationKeys.unreadCount());
    });

    // --- GRNs ---
    const unsubGRN = ws.on("grn_submitted", () => {
      invalidate(GRNS_KEY);
      invalidate(DASHBOARD_KEY);
      invalidate(notificationKeys.unreadCount());
    });
    ws.on("grn_approved", () => {
      invalidate(GRNS_KEY);
      invalidate(DASHBOARD_KEY);
      invalidate(notificationKeys.unreadCount());
    });

    // --- Users ---
    const unsubUsers = ws.on("user_created", () => {
      invalidate(USERS_KEY);
      invalidate(notificationKeys.unreadCount());
    });
    ws.on("role_changed", () => {
      invalidate(USERS_KEY);
    });

    // --- System broadcasts ---
    const unsubBroadcast = ws.on("broadcast", (payload) => {
      invalidate(notificationKeys.unreadCount());
      const p = payload as { title?: string; message?: string; priority?: string };
      if (p.title) {
        toast({
          title: p.title,
          description: p.message,
          variant: p.priority === "urgent" ? "destructive" : "default",
        });
        showBrowserNotification({
          id: `broadcast-${Date.now()}`,
          title: p.title,
          body: p.message,
          forceShowWhenFocused: true,
        });
      }
    });

    ws.on("maintenance", (payload) => {
      const p = payload as { title?: string; message?: string };
      toast({
        title: p.title ?? "Maintenance Notice",
        description: p.message,
        variant: "destructive",
      });
    });

    // -----------------------------------------------------------------------
    // Cleanup
    // -----------------------------------------------------------------------
    return () => {
      unsubStatus();
      unsubNotification();
      unsubLowStock();
      unsubStockAdjustment();
      unsubStockRelease();
      unsubPO();
      unsubGRN();
      unsubUsers();
      unsubBroadcast();
    };
  }, [isAuthenticated, queryClient]);

  return (
    <NotificationsContext.Provider
      value={{ status, isConnected: status === "connected" }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
