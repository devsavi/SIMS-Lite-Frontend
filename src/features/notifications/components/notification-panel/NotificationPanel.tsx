"use client";

import * as React from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/app/components/ui/button";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Separator } from "@/app/components/ui/separator";
import { NotificationCard } from "../notification-card/NotificationCard";
import { EmptyState } from "@/components/common/empty-state";
import { useNotificationList, useMarkAsRead, useMarkAllAsRead } from "../../hooks/use-notifications";

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function NotificationSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-3 px-4 py-3">
          <div className="mt-0.5 h-7 w-7 shrink-0 animate-pulse rounded-none bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-48 animate-pulse rounded-none bg-muted" />
            <div className="h-3 w-64 animate-pulse rounded-none bg-muted" />
            <div className="h-2.5 w-24 animate-pulse rounded-none bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface NotificationPanelProps {
  /** Called when the panel should close */
  onClose?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { data, isLoading, isError, refetch } = useNotificationList({
    page: 1,
    size: 10,
  });

  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();

  const notifications = data?.data ?? [];
  const unreadCount = data?.unread_count ?? 0;

  return (
    <div
      className="flex flex-col overflow-hidden w-full"
      style={{ maxHeight: "min(520px, calc(100dvh - 80px))" }}
      role="dialog"
      aria-label="Notifications panel"
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
          {unreadCount > 0 && (
            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-none bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => refetch()}
            aria-label="Refresh notifications"
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => markAllAsRead()}
              disabled={isMarkingAll}
              aria-label="Mark all as read"
            >
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Notification list */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <NotificationSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <p className="text-sm text-muted-foreground">
              Failed to load notifications.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            title="No notifications"
            description="You're all caught up!"
            className="py-12"
          />
        ) : (
          <ul
            className="divide-y divide-border"
            aria-label="Recent notifications"
            aria-live="polite"
            aria-atomic="false"
          >
            {notifications.map((n) => (
              <li key={n.id}>
                <NotificationCard
                  notification={n}
                  onMarkAsRead={markAsRead}
                  compact
                />
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>

      {/* Footer */}
      <Separator />
      <div className="shrink-0 p-2">
        <Button
          variant="ghost"
          className="h-8 w-full text-xs text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link href="/notifications" onClick={onClose}>
            View all notifications
          </Link>
        </Button>
      </div>
    </div>
  );
}
