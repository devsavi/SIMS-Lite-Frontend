"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { ChevronRight, AlertTriangle } from "lucide-react";
import type { LowStockItem } from "../../types";

interface LowStockRowProps {
  item: LowStockItem;
}

function LowStockRow({ item }: LowStockRowProps) {
  const stockPercentage = Math.round((item.current_quantity / item.reorder_level) * 100);
  const isCritical = item.current_quantity === 0;
  const isVeryLow = stockPercentage <= 50;

  return (
    <li>
      <Link
        href={`/inventory?product=${item.id}`}
        className="flex items-center gap-3 py-3 hover:bg-muted/50 -mx-6 px-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Low stock: ${item.product_name}`}
      >
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center",
            isCritical ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
          )}
        >
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">{item.product_name}</p>
          <div className="mt-1 flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full",
                  isCritical ? "bg-destructive" : isVeryLow ? "bg-warning" : "bg-yellow-400"
                )}
                style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                aria-hidden="true"
              />
            </div>
            <span className="shrink-0 text-xs text-muted-foreground font-mono">
              {item.current_quantity} / {item.reorder_level} {item.unit}
            </span>
          </div>
        </div>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      </Link>
    </li>
  );
}

function LowStockSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          <div className="h-7 w-7 shrink-0 animate-pulse bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-36 animate-pulse bg-muted" />
            <div className="h-1.5 w-full animate-pulse bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface LowStockWidgetProps {
  items?: LowStockItem[];
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
}

export function LowStockWidget({
  items,
  loading,
  error,
  onRetry,
}: LowStockWidgetProps) {
  return (
    <div className="border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            Low Stock Alert
            {items && items.length > 0 && (
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center bg-warning px-1.5 text-xs font-bold text-warning-foreground">
                {items.length}
              </span>
            )}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Products below reorder level</p>
        </div>
        <Link
          href="/inventory?filter=low_stock"
          className="flex items-center gap-1 text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="View all low stock items"
        >
          View all <ChevronRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
      <div className="px-6">
        {loading ? (
          <LowStockSkeleton />
        ) : error ? (
          <div className="py-8">
            <ErrorState error={error} onRetry={onRetry} title="Failed to load low stock data" />
          </div>
        ) : !items || items.length === 0 ? (
          <EmptyState
            title="All stock levels are healthy"
            description="No products are below reorder level."
            className="py-10"
          />
        ) : (
          <ul
            className="divide-y divide-border max-h-[280px] overflow-y-auto overflow-x-hidden"
            aria-label="Low stock items list"
          >
            {items.map((item) => (
              <LowStockRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
