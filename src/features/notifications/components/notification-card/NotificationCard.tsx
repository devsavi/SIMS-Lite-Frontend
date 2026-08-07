"use client";

import * as React from "react";
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Bell,
  Check,
  Undo2,
  Trash2,
  ClipboardList,
  Package,
  Archive,
  ArrowUpFromLine,
  User,
  Lock,
  Settings2,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { formatRelative } from "@/utils/format";
import { Button } from "@/app/components/ui/button";
import type {
  Notification,
  NotificationSummary,
  NotificationType,
  NotificationPriority,
} from "../../types";

// ---------------------------------------------------------------------------
// Type config — icon + colour for each notification type
// ---------------------------------------------------------------------------

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }
> = {
  INFO: {
    icon: Info,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  SUCCESS: {
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  WARNING: {
    icon: AlertTriangle,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
  ERROR: {
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/5",
  },
  PURCHASE_ORDER: {
    icon: ClipboardList,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
  },
  GRN: {
    icon: Package,
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-950/30",
  },
  INVENTORY: {
    icon: Archive,
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-50 dark:bg-slate-950/30",
  },
  STOCK_RELEASE: {
    icon: ArrowUpFromLine,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/30",
  },
  LOW_STOCK: {
    icon: AlertTriangle,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/30",
  },
  OUT_OF_STOCK: {
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/5",
  },
  USER: {
    icon: User,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/30",
  },
  SECURITY: {
    icon: Lock,
    color: "text-destructive",
    bg: "bg-destructive/5",
  },
  SYSTEM: {
    icon: Settings2,
    color: "text-muted-foreground",
    bg: "bg-muted/40",
  },
};

// ---------------------------------------------------------------------------
// Priority indicator
// ---------------------------------------------------------------------------

const PRIORITY_COLOR: Record<NotificationPriority, string> = {
  CRITICAL: "bg-destructive",
  HIGH: "bg-orange-500",
  NORMAL: "bg-primary",
  LOW: "bg-muted-foreground/40",
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface NotificationCardProps {
  /** Accepts both the full Notification and the lightweight NotificationSummary */
  notification: Notification | NotificationSummary;
  onMarkAsRead?: (id: string) => void;
  onMarkAsUnread?: (id: string) => void;
  onDelete?: (id: string) => void;
  /** Compact mode — hides action buttons. Used in the bell panel. */
  compact?: boolean;
  /** Loading state for async actions */
  isLoading?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NotificationCard({
  notification,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
  compact = false,
  isLoading = false,
}: NotificationCardProps) {
  const cfg = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.INFO;
  const Icon = cfg.icon ?? Bell;
  const priorityColor = PRIORITY_COLOR[notification.priority] ?? PRIORITY_COLOR.NORMAL;

  const handleReadToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (notification.is_read) {
      onMarkAsUnread?.(notification.id);
    } else {
      onMarkAsRead?.(notification.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(notification.id);
  };

  return (
    <article
      role="article"
      aria-label={notification.title}
      className={cn(
        "group relative flex gap-3 px-4 py-3 transition-colors",
        "focus-within:bg-muted/40 hover:bg-muted/40",
        !notification.is_read && "bg-primary/5 hover:bg-primary/8"
      )}
    >
      {/* Priority + unread indicator strip */}
      <span
        className={cn(
          "absolute left-0 top-0 bottom-0 w-0.5",
          notification.is_read ? "bg-transparent" : priorityColor
        )}
        aria-hidden="true"
      />

      {/* Type icon */}
      <div
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-none",
          cfg.bg
        )}
        aria-hidden="true"
      >
        <Icon className={cn("h-3.5 w-3.5", cfg.color)} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "truncate text-sm text-foreground",
              !notification.is_read && "font-semibold"
            )}
          >
            {notification.title}
          </p>
          {!notification.is_read && (
            <span
              className={cn(
                "mt-1.5 h-2 w-2 shrink-0 rounded-none",
                priorityColor
              )}
              aria-label={`${notification.priority.toLowerCase()} priority, unread`}
            />
          )}
        </div>

        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
          {notification.message}
        </p>

        <div className="mt-1 flex items-center gap-2">
          <time
            dateTime={notification.created_at}
            className="text-xs text-muted-foreground/70"
          >
            {formatRelative(notification.created_at)}
          </time>
          {/* Priority label for CRITICAL and HIGH */}
          {(notification.priority === "CRITICAL" ||
            notification.priority === "HIGH") && (
            <span
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wide",
                notification.priority === "CRITICAL"
                  ? "text-destructive"
                  : "text-orange-500"
              )}
            >
              {notification.priority}
            </span>
          )}
        </div>
      </div>

      {/* Action buttons — shown on hover (hidden in compact mode) */}
      {!compact && (
        <div
          className={cn(
            "absolute right-3 top-3 flex items-center gap-1",
            "opacity-0 transition-opacity group-hover:opacity-100",
            "focus-within:opacity-100"
          )}
          role="group"
          aria-label={`Actions for ${notification.title}`}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleReadToggle}
            disabled={isLoading}
            aria-label={notification.is_read ? "Mark as unread" : "Mark as read"}
            title={notification.is_read ? "Mark as unread" : "Mark as read"}
          >
            {notification.is_read ? (
              <Undo2 className="h-3 w-3" />
            ) : (
              <Check className="h-3 w-3" />
            )}
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={isLoading}
              aria-label="Delete notification"
              title="Delete notification"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
    </article>
  );
}
