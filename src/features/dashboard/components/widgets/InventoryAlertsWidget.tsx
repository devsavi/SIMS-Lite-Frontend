"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { formatRelative } from "@/utils/format";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { AlertTriangle, PackageX, Clock, TrendingUp, ChevronRight } from "lucide-react";
import type { InventoryAlert } from "../../types";

const ALERT_CONFIG: Record<
  InventoryAlert["type"],
  { icon: React.ComponentType<{ className?: string }>; label: string }
> = {
  low_stock: { icon: AlertTriangle, label: "Low Stock" },
  out_of_stock: { icon: PackageX, label: "Out of Stock" },
  expiring_soon: { icon: Clock, label: "Expiring Soon" },
  overstock: { icon: TrendingUp, label: "Overstock" },
};

const SEVERITY_STYLES: Record<InventoryAlert["severity"], string> = {
  high: "border-l-4 border-l-destructive bg-destructive/5",
  medium: "border-l-4 border-l-warning bg-warning/5",
  low: "border-l-4 border-l-muted-foreground bg-muted/30",
};

const SEVERITY_ICON_STYLES: Record<InventoryAlert["severity"], string> = {
  high: "text-destructive",
  medium: "text-warning",
  low: "text-muted-foreground",
};

interface AlertRowProps {
  item: InventoryAlert;
}

function AlertRow({ item }: AlertRowProps) {
  const config = ALERT_CONFIG[item.type];
  const Icon = config?.icon ?? AlertTriangle;

  return (
    <li
      className={cn(
        "flex items-start gap-3 px-6 py-3",
        SEVERITY_STYLES[item.severity]
      )}
    >
      <Icon
        className={cn("mt-0.5 h-4 w-4 shrink-0", SEVERITY_ICON_STYLES[item.severity])}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">
            {item.product_name}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground font-mono">
            {item.product_code}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{item.message}</p>
        <time className="mt-0.5 text-xs text-muted-foreground/70" dateTime={item.created_at}>
          {formatRelative(item.created_at)}
        </time>
      </div>
    </li>
  );
}

function AlertSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 px-6 py-3">
          <div className="mt-0.5 h-4 w-4 shrink-0 animate-pulse bg-muted rounded-full" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-32 animate-pulse bg-muted" />
            <div className="h-3 w-48 animate-pulse bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface InventoryAlertsWidgetProps {
  alerts?: InventoryAlert[];
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
}

export function InventoryAlertsWidget({
  alerts,
  loading,
  error,
  onRetry,
}: InventoryAlertsWidgetProps) {
  const highCount = alerts?.filter((a) => a.severity === "high").length ?? 0;

  return (
    <div className="border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            Inventory Alerts
            {highCount > 0 && (
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center bg-destructive px-1.5 text-xs font-bold text-destructive-foreground">
                {highCount}
              </span>
            )}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Active inventory issues</p>
        </div>
        <Link
          href="/inventory"
          className="flex items-center gap-1 text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="View inventory"
        >
          View all <ChevronRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
      {loading ? (
        <AlertSkeleton />
      ) : error ? (
        <div className="px-6 py-8">
          <ErrorState error={error} onRetry={onRetry} title="Failed to load alerts" />
        </div>
      ) : !alerts || alerts.length === 0 ? (
        <div className="px-6">
          <EmptyState
            title="No active alerts"
            description="All inventory levels are within normal range."
            className="py-10"
          />
        </div>
      ) : (
        <ul
          className="divide-y divide-border"
          aria-label="Inventory alerts list"
          aria-live="polite"
        >
          {alerts.map((item) => (
            <AlertRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}
