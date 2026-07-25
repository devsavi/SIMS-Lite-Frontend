"use client";

import * as React from "react";
import { cn } from "@/utils/cn";
import { formatRelative } from "@/utils/format";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import {
  Package,
  ShoppingCart,
  ClipboardList,
  ArrowUpFromLine,
  Settings,
  User,
  Activity,
} from "lucide-react";
import type { ActivityItem } from "../../types";

const ACTIVITY_ICONS: Record<ActivityItem["type"], React.ComponentType<{ className?: string }>> = {
  product: Package,
  purchase_order: ShoppingCart,
  grn: ClipboardList,
  stock_release: ArrowUpFromLine,
  inventory_adjustment: Settings,
  user: User,
};

const ACTION_COLORS: Record<string, string> = {
  created: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  updated: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  deleted: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  received: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  released: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

interface ActivityItemRowProps {
  item: ActivityItem;
}

function ActivityItemRow({ item }: ActivityItemRowProps) {
  const Icon = ACTIVITY_ICONS[item.type] ?? Activity;
  const actionColor = ACTION_COLORS[item.action] ?? "bg-muted text-muted-foreground";

  return (
    <li className="flex items-start gap-3 py-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center bg-muted text-muted-foreground">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-medium text-foreground truncate">
            {item.user_name}
          </span>
          <span
            className={cn(
              "inline-flex items-center px-1.5 py-0.5 text-xs font-medium",
              actionColor
            )}
          >
            {item.action}
          </span>
          {item.reference && (
            <span className="text-xs text-muted-foreground font-mono">
              {item.reference}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground truncate">
          {item.description}
        </p>
      </div>
      <time
        dateTime={item.created_at}
        className="shrink-0 text-xs text-muted-foreground"
        title={item.created_at}
      >
        {formatRelative(item.created_at)}
      </time>
    </li>
  );
}

// Skeleton rows
function ActivitySkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 py-3">
          <div className="mt-0.5 h-7 w-7 shrink-0 animate-pulse bg-muted" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-32 animate-pulse bg-muted" />
            <div className="h-3 w-48 animate-pulse bg-muted" />
          </div>
          <div className="h-3 w-16 animate-pulse bg-muted" />
        </div>
      ))}
    </div>
  );
}

interface RecentActivitiesWidgetProps {
  activities?: ActivityItem[];
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
}

export function RecentActivitiesWidget({
  activities,
  loading,
  error,
  onRetry,
}: RecentActivitiesWidgetProps) {
  return (
    <div className="border border-border bg-card shadow-sm">
      <div className="border-b border-border px-6 py-4">
        <h3 className="text-sm font-semibold text-foreground">Recent Activities</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">Latest system events</p>
      </div>
      <div className="px-6">
        {loading ? (
          <ActivitySkeleton />
        ) : error ? (
          <div className="py-8">
            <ErrorState error={error} onRetry={onRetry} title="Failed to load activities" />
          </div>
        ) : !activities || activities.length === 0 ? (
          <EmptyState
            title="No recent activities"
            description="System events will appear here."
            className="py-10"
          />
        ) : (
          <ul className="divide-y divide-border" aria-label="Recent activities list">
            {activities.map((item) => (
              <ActivityItemRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
