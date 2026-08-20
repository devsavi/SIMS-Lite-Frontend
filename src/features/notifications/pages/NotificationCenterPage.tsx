"use client";

import * as React from "react";
import {
  Bell,
  Search,
  Filter,
  CheckCheck,
  RefreshCw,
  Send,
  Settings,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Separator } from "@/app/components/ui/separator";
import { cn } from "@/utils/cn";
import { NotificationList } from "../components/notification-list/NotificationList";
import { ComposeNotification } from "../components/compose-notification/ComposeNotification";
import { NotificationSettings } from "../components/notification-settings/NotificationSettings";
import { useMarkAllAsRead, useUnreadCount } from "../hooks/use-notifications";
import { useWsNotifications } from "../websocket/use-ws-notifications";
import { useAuthStore } from "@/stores/auth.store";
import type { NotificationFilterParams, NotificationType } from "../types";

// ---------------------------------------------------------------------------
// Connection status indicator
// ---------------------------------------------------------------------------

function ConnectionStatus() {
  const { status, isConnected } = useWsNotifications();

  const label: Record<string, string> = {
    idle: "Connecting…",
    connecting: "Connecting…",
    connected: "Live",
    disconnected: "Reconnecting…",
    error: "Disconnected",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs",
        isConnected ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
      )}
      aria-live="polite"
      aria-atomic
      title={isConnected ? "Real-time updates active" : "Real-time updates unavailable"}
    >
      {isConnected ? (
        <Wifi className="h-3 w-3" aria-hidden />
      ) : (
        <WifiOff className="h-3 w-3" aria-hidden />
      )}
      <span>{label[status] ?? status}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filter bar
// ---------------------------------------------------------------------------

interface FilterState {
  search: string;
  type: string;
  is_read: string;
}

function useFilters() {
  const [filters, setFilters] = React.useState<FilterState>({
    search: "",
    type: "ALL",
    is_read: "ALL",
  });

  const debouncedSearch = React.useDeferredValue(filters.search);

  const queryParams = React.useMemo<Omit<NotificationFilterParams, "page">>(() => {
    const params: Omit<NotificationFilterParams, "page"> = {
      size: 20,
    };
    if (debouncedSearch) params.search = debouncedSearch;
    if (filters.type !== "ALL")
      params.type = filters.type as NotificationType;
    if (filters.is_read !== "ALL")
      params.is_read = filters.is_read === "unread" ? false : true;
    return params;
  }, [debouncedSearch, filters.type, filters.is_read]);

  return { filters, setFilters, queryParams };
}

// ---------------------------------------------------------------------------
// Notification Center Page
// ---------------------------------------------------------------------------

export function NotificationCenterPage() {
  const { filters, setFilters, queryParams } = useFilters();
  const { data: unreadCount = 0 } = useUnreadCount();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();
  const { can } = useAuthStore();
  const canCompose = can("notifications.send");
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-6 px-4 py-6 md:px-6">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-primary/10">
              <Bell className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Notification Center
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                {unreadCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {unreadCount} unread
                  </span>
                )}
                <ConnectionStatus />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Settings */}
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Notification settings"
                  title="Notification preferences"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Notification Preferences</DialogTitle>
                  <DialogDescription>
                    Customise how and when you receive notifications.
                  </DialogDescription>
                </DialogHeader>
                <NotificationSettings />
              </DialogContent>
            </Dialog>

            {/* Mark all read */}
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsRead()}
                disabled={isMarkingAll}
                className="hidden sm:flex"
              >
                <CheckCheck className="mr-2 h-3.5 w-3.5" />
                Mark all read
              </Button>
            )}

            {/* Compose notification */}
            {canCompose && (
              <ComposeNotification
                trigger={
                  <Button size="sm">
                    <Send className="mr-2 h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Compose</span>
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="notification-search"
            placeholder="Search notifications…"
            className="pl-9"
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            aria-label="Search notifications"
          />
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <Select
            value={filters.type}
            onValueChange={(v) =>
              setFilters((prev) => ({ ...prev, type: v }))
            }
          >
            <SelectTrigger className="h-9 w-[160px]" aria-label="Filter by type">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="INFO">Info</SelectItem>
              <SelectItem value="SUCCESS">Success</SelectItem>
              <SelectItem value="WARNING">Warning</SelectItem>
              <SelectItem value="ERROR">Error</SelectItem>
              <SelectItem value="PURCHASE_ORDER">Purchase Order</SelectItem>
              <SelectItem value="GRN">GRN</SelectItem>
              <SelectItem value="INVENTORY">Inventory</SelectItem>
              <SelectItem value="STOCK_RELEASE">Stock Release</SelectItem>
              <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
              <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="SECURITY">Security</SelectItem>
              <SelectItem value="SYSTEM">System</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Read/unread filter */}
        <Select
          value={filters.is_read}
          onValueChange={(v) =>
            setFilters((prev) => ({ ...prev, is_read: v }))
          }
        >
          <SelectTrigger className="h-9 w-[140px]" aria-label="Filter by read status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
          </SelectContent>
        </Select>

        {/* Mobile: mark all read */}
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead()}
            disabled={isMarkingAll}
            className="sm:hidden"
          >
            <CheckCheck className="mr-2 h-3.5 w-3.5" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Notification list */}
      <NotificationList filters={queryParams} />
    </div>
  );
}
