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
} from "lucide-react";
import { cn } from "@/utils/cn";
import { formatRelative } from "@/utils/format";
import { Button } from "@/app/components/ui/button";
import type { Notification, NotificationType } from "../../types";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }
> = {
  info: {
    icon: Info,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  success: {
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
  error: {
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/5",
  },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface NotificationCardProps {
  notification: Notification;
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
  const cfg = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.info;
  const Icon = cfg.icon ?? Bell;

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
      {/* Unread indicator strip */}
      {!notification.is_read && (
        <span
          className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary"
          aria-hidden="true"
        />
      )}

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
              className="mt-1.5 h-2 w-2 shrink-0 rounded-none bg-primary"
              aria-label="Unread"
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
          {notification.sender && (
            <>
              <span className="text-muted-foreground/40" aria-hidden="true">
                ·
              </span>
              <span className="text-xs text-muted-foreground/70">
                {notification.sender.full_name}
              </span>
            </>
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
