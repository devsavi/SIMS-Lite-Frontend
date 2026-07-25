"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { formatRelative } from "@/utils/format";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Bell, Info, CheckCircle2, AlertTriangle, XCircle, ChevronRight } from "lucide-react";
import type { NotificationItem } from "../../types";

const NOTIFICATION_CONFIG: Record<
  NotificationItem["type"],
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  info: { icon: Info, color: "text-blue-600 dark:text-blue-400" },
  success: { icon: CheckCircle2, color: "text-green-600 dark:text-green-400" },
  warning: { icon: AlertTriangle, color: "text-yellow-600 dark:text-yellow-400" },
  error: { icon: XCircle, color: "text-destructive" },
};

interface NotificationRowProps {
  item: NotificationItem;
}

function NotificationRow({ item }: NotificationRowProps) {
  const config = NOTIFICATION_CONFIG[item.type];
  const Icon = config?.icon ?? Bell;
  const colorClass = config?.color ?? "text-muted-foreground";

  const content = (
    <div
      className={cn(
        "flex items-start gap-3 py-3",
        !item.is_read && "bg-primary/5 -mx-6 px-6"
      )}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", colorClass)} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm font-medium text-foreground truncate", !item.is_read && "font-semibold")}>
            {item.title}
          </p>
          {!item.is_read && (
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{item.message}</p>
        <time
          dateTime={item.created_at}
          className="mt-1 text-xs text-muted-foreground/70"
        >
          {formatRelative(item.created_at)}
        </time>
      </div>
    </div>
  );

  if (item.action_url) {
    return (
      <li>
        <Link
          href={item.action_url}
          className="block hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={item.title}
        >
          {content}
        </Link>
      </li>
    );
  }

  return <li>{content}</li>;
}

function NotificationSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 py-3">
          <div className="mt-0.5 h-4 w-4 shrink-0 animate-pulse bg-muted rounded-full" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-40 animate-pulse bg-muted" />
            <div className="h-3 w-56 animate-pulse bg-muted" />
            <div className="h-3 w-20 animate-pulse bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface NotificationsWidgetProps {
  notifications?: NotificationItem[];
  unreadCount?: number;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
}

export function NotificationsWidget({
  notifications,
  unreadCount = 0,
  loading,
  error,
  onRetry,
}: NotificationsWidgetProps) {
  return (
    <div className="border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            Recent Notifications
            {unreadCount > 0 && (
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center bg-primary px-1.5 text-xs font-bold text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Your latest alerts</p>
        </div>
        <Link
          href="/notifications"
          className="flex items-center gap-1 text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="View all notifications"
        >
          View all <ChevronRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
      <div className="px-6">
        {loading ? (
          <NotificationSkeleton />
        ) : error ? (
          <div className="py-8">
            <ErrorState error={error} onRetry={onRetry} title="Failed to load notifications" />
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <EmptyState
            title="No notifications"
            description="You're all caught up."
            className="py-10"
          />
        ) : (
          <ul
            className="divide-y divide-border"
            aria-label="Notifications list"
            aria-live="polite"
            aria-atomic="false"
          >
            {notifications.map((item) => (
              <NotificationRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
