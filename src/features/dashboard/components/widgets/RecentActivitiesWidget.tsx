"use client";

import * as React from "react";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/format";
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

const ACTION_CHIP: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  created: {
    bg:     "bg-[#DCEBFC] dark:bg-[rgba(96,165,250,0.15)]",
    text:   "text-[#1D63C4] dark:text-[#60A5FA]",
    border: "border border-[#B4D5F8] dark:border-[rgba(96,165,250,0.4)]",
    dot:    "bg-[#1D63C4] dark:bg-[#60A5FA]",
  },
  submitted: {
    bg:     "bg-[#E0E3FC] dark:bg-[rgba(129,140,248,0.15)]",
    text:   "text-[#4338CA] dark:text-[#818CF8]",
    border: "border border-[#C1C7F8] dark:border-[rgba(129,140,248,0.4)]",
    dot:    "bg-[#4338CA] dark:bg-[#818CF8]",
  },
  approved: {
    bg:     "bg-[#D6F5DE] dark:bg-[rgba(52,211,153,0.15)]",
    text:   "text-[#1B8A4C] dark:text-[#34D399]",
    border: "border border-[#AEE8C0] dark:border-[rgba(52,211,153,0.4)]",
    dot:    "bg-[#1B8A4C] dark:bg-[#34D399]",
  },
  rejected: {
    bg:     "bg-[#FDE2E2] dark:bg-[rgba(248,113,113,0.15)]",
    text:   "text-[#C0362C] dark:text-[#F87171]",
    border: "border border-[#F8C1BC] dark:border-[rgba(248,113,113,0.4)]",
    dot:    "bg-[#C0362C] dark:bg-[#F87171]",
  },
  updated: {
    bg:     "bg-[#FEEAD3] dark:bg-[rgba(251,146,60,0.15)]",
    text:   "text-[#C1650F] dark:text-[#FB923C]",
    border: "border border-[#FBD2A0] dark:border-[rgba(251,146,60,0.4)]",
    dot:    "bg-[#C1650F] dark:bg-[#FB923C]",
  },
  deleted: {
    bg:     "bg-[#E7E7E7] dark:bg-[rgba(148,163,184,0.15)]",
    text:   "text-[#4A4A4A] dark:text-[#94A3B8]",
    border: "border border-[#CFCFCF] dark:border-[rgba(148,163,184,0.4)]",
    dot:    "bg-[#4A4A4A] dark:bg-[#94A3B8]",
  },
  received: {
    bg:     "bg-[#D3F3F1] dark:bg-[rgba(45,212,191,0.15)]",
    text:   "text-[#12796F] dark:text-[#2DD4BF]",
    border: "border border-[#A7E5E0] dark:border-[rgba(45,212,191,0.4)]",
    dot:    "bg-[#12796F] dark:bg-[#2DD4BF]",
  },
  released: {
    bg:     "bg-[#EAE1FB] dark:bg-[rgba(167,139,250,0.15)]",
    text:   "text-[#6D28D9] dark:text-[#A78BFA]",
    border: "border border-[#D3C0F5] dark:border-[rgba(167,139,250,0.4)]",
    dot:    "bg-[#6D28D9] dark:bg-[#A78BFA]",
  },
};

// Height of one row ≈ 64px; show 5 rows initially
const VISIBLE_HEIGHT = "320px";

interface ActivityItemRowProps {
  item: ActivityItem;
}

function ActivityItemRow({ item }: ActivityItemRowProps) {
  const Icon = ACTIVITY_ICONS[item.type] ?? Activity;
  const chip = ACTION_CHIP[item.action];
  const label = item.resource_name || item.reference;

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
          {chip ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-semibold",
                chip.bg, chip.text, chip.border
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", chip.dot)} aria-hidden="true" />
              {item.action}
            </span>
          ) : (
            <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium border border-border bg-muted text-muted-foreground">
              {item.action}
            </span>
          )}
        </div>
        {label && (
          <p className="mt-0.5 text-xs text-muted-foreground font-mono truncate">
            {label}
          </p>
        )}
        <p className="mt-0.5 text-xs text-muted-foreground truncate" title={item.description ?? undefined}>
          {item.description}
        </p>
      </div>
      <time
        dateTime={item.created_at}
        className="shrink-0 text-xs text-muted-foreground whitespace-nowrap"
        title={item.created_at}
      >
        {formatDateTime(item.created_at)}
      </time>
    </li>
  );
}

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
          <div className="h-3 w-24 animate-pulse bg-muted" />
        </div>
      ))}
    </div>
  );
}

interface RecentActivitiesWidgetProps {
  activities?: ActivityItem[];
  total?: number;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
}

export function RecentActivitiesWidget({
  activities,
  total,
  loading,
  error,
  onRetry,
}: RecentActivitiesWidgetProps) {
  return (
    <div className="border border-border bg-card shadow-sm">
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Recent Activities</h3>
          {total != null && total > 0 && (
            <span className="inline-flex h-5 min-w-[20px] items-center justify-center bg-muted px-1.5 text-xs font-medium text-muted-foreground">
              {total}
            </span>
          )}
        </div>
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
          <div
            style={{ maxHeight: VISIBLE_HEIGHT }}
            className="overflow-y-auto"
            aria-label="Recent activities"
          >
            <ul className="divide-y divide-border" aria-label="Recent activities list">
              {activities.map((item) => (
                <ActivityItemRow key={item.id} item={item} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
