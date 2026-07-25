"use client";

import * as React from "react";
import Link from "next/link";
import { formatRelative } from "@/utils/format";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Badge } from "@/app/components/ui/badge";
import { ChevronRight } from "lucide-react";
import type { PendingStockRelease } from "../../types";

const STATUS_CONFIG: Record<
  PendingStockRelease["status"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "Pending", variant: "outline" },
  approved: { label: "Approved", variant: "default" },
  processing: { label: "Processing", variant: "secondary" },
  released: { label: "Released", variant: "default" },
};

interface StockReleaseRowProps {
  item: PendingStockRelease;
}

function StockReleaseRow({ item }: StockReleaseRowProps) {
  const statusConfig = STATUS_CONFIG[item.status];

  return (
    <li>
      <Link
        href={`/stock-release/${item.id}`}
        className="flex items-center gap-3 py-3 hover:bg-muted/50 -mx-6 px-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Stock release ${item.release_number}`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium font-mono text-foreground">
              {item.release_number}
            </span>
            {statusConfig && (
              <Badge variant={statusConfig.variant} className="text-xs h-5">
                {statusConfig.label}
              </Badge>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span>By {item.requested_by}</span>
            <span>·</span>
            <span>{item.items_count} item{item.items_count !== 1 ? "s" : ""}</span>
            <span>·</span>
            <span>{formatRelative(item.requested_at)}</span>
          </div>
        </div>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      </Link>
    </li>
  );
}

function StockReleaseSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="h-4 w-24 animate-pulse bg-muted" />
              <div className="h-5 w-16 animate-pulse bg-muted" />
            </div>
            <div className="h-3 w-40 animate-pulse bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface PendingStockReleasesWidgetProps {
  releases?: PendingStockRelease[];
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
}

export function PendingStockReleasesWidget({
  releases,
  loading,
  error,
  onRetry,
}: PendingStockReleasesWidgetProps) {
  return (
    <div className="border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Pending Stock Releases</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Awaiting processing</p>
        </div>
        <Link
          href="/stock-release"
          className="flex items-center gap-1 text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="View all stock releases"
        >
          View all <ChevronRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
      <div className="px-6">
        {loading ? (
          <StockReleaseSkeleton />
        ) : error ? (
          <div className="py-8">
            <ErrorState error={error} onRetry={onRetry} title="Failed to load stock releases" />
          </div>
        ) : !releases || releases.length === 0 ? (
          <EmptyState
            title="No pending releases"
            description="Stock release requests will appear here."
            className="py-10"
          />
        ) : (
          <ul className="divide-y divide-border" aria-label="Pending stock releases list">
            {releases.map((item) => (
              <StockReleaseRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
