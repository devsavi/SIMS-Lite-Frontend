"use client";

import * as React from "react";
import {
  useInfiniteNotifications,
  useMarkAsRead,
  useMarkAsUnread,
  useDeleteNotification,
} from "../../hooks/use-notifications";
import { NotificationCard } from "../notification-card/NotificationCard";
import { Button } from "@/app/components/ui/button";
import { Loader2 } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import type { NotificationFilterParams } from "../../types";

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function ListSkeleton() {
  return (
    <div className="divide-y divide-border border border-border">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex gap-3 px-4 py-3">
          <div className="mt-0.5 h-7 w-7 shrink-0 animate-pulse rounded-none bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-48 animate-pulse rounded-none bg-muted" />
            <div className="h-3 w-72 animate-pulse rounded-none bg-muted" />
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

interface NotificationListProps {
  filters?: Omit<NotificationFilterParams, "page">;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NotificationList({ filters }: NotificationListProps) {
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteNotifications(filters);

  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAsUnread } = useMarkAsUnread();
  const { mutate: deleteNotification } = useDeleteNotification();

  const pages = data?.pages ?? [];
  const notifications = pages.flatMap((p) => p.data);
  const totalCount = pages[0]?.pagination.total ?? 0;

  if (isLoading) return <ListSkeleton />;

  if (isError) {
    return (
      <ErrorState
        title="Could not load notifications"
        description="Failed to load notifications. Please try again."
        onRetry={() => refetch()}
        className="py-16"
      />
    );
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        title="No notifications"
        description="When you receive notifications, they'll appear here."
        className="py-20"
      />
    );
  }

  return (
    <div className="space-y-0">
      <p className="mb-2 text-xs text-muted-foreground">
        {totalCount} notification{totalCount !== 1 ? "s" : ""}
      </p>

      <ul
        className="divide-y divide-border border border-border"
        aria-label="Notifications"
        aria-live="polite"
        aria-atomic="false"
      >
        {notifications.map((n) => (
          <li key={n.id}>
            <NotificationCard
              notification={n}
              onMarkAsRead={markAsRead}
              onMarkAsUnread={markAsUnread}
              onDelete={deleteNotification}
            />
          </li>
        ))}
      </ul>

      {/* Load more */}
      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Loading…
              </>
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
