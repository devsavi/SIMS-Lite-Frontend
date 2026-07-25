"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { formatRelative } from "@/utils/format";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { ChevronRight, ArrowUp, ArrowDown } from "lucide-react";
import type { InventoryAdjustment } from "../../types";

interface AdjustmentRowProps {
  item: InventoryAdjustment;
}

function AdjustmentRow({ item }: AdjustmentRowProps) {
  const isIncrease = item.adjustment_type === "increase";
  const Icon = isIncrease ? ArrowUp : ArrowDown;

  return (
    <li className="flex items-start gap-3 py-3">
      <div
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center",
          isIncrease
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        )}
      >
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">{item.product_name}</p>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className={cn(
              "font-semibold",
              isIncrease ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
            )}
          >
            {isIncrease ? "+" : "-"}{item.quantity}
          </span>
          <span>·</span>
          <span className="truncate">{item.reason}</span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground/70">
          By {item.adjusted_by} · {formatRelative(item.adjusted_at)}
        </p>
      </div>
    </li>
  );
}

function AdjustmentSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 py-3">
          <div className="mt-0.5 h-7 w-7 shrink-0 animate-pulse bg-muted" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-32 animate-pulse bg-muted" />
            <div className="h-3 w-44 animate-pulse bg-muted" />
            <div className="h-3 w-28 animate-pulse bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface RecentAdjustmentsWidgetProps {
  adjustments?: InventoryAdjustment[];
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
}

export function RecentAdjustmentsWidget({
  adjustments,
  loading,
  error,
  onRetry,
}: RecentAdjustmentsWidgetProps) {
  return (
    <div className="border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Recent Adjustments</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Inventory changes</p>
        </div>
        <Link
          href="/inventory"
          className="flex items-center gap-1 text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="View inventory"
        >
          View all <ChevronRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
      <div className="px-6">
        {loading ? (
          <AdjustmentSkeleton />
        ) : error ? (
          <div className="py-8">
            <ErrorState error={error} onRetry={onRetry} title="Failed to load adjustments" />
          </div>
        ) : !adjustments || adjustments.length === 0 ? (
          <EmptyState
            title="No recent adjustments"
            description="Inventory adjustments will appear here."
            className="py-10"
          />
        ) : (
          <ul className="divide-y divide-border" aria-label="Recent adjustments list">
            {adjustments.map((item) => (
              <AdjustmentRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
