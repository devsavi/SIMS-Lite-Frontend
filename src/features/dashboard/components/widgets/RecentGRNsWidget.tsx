"use client";

import * as React from "react";
import Link from "next/link";
import { formatRelative } from "@/utils/format";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Badge } from "@/app/components/ui/badge";
import { ChevronRight } from "lucide-react";
import type { RecentGRN } from "../../types";

const STATUS_CONFIG: Record<
  RecentGRN["status"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  draft: { label: "Draft", variant: "secondary" },
  pending: { label: "Pending", variant: "outline" },
  verified: { label: "Verified", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
};

interface GRNRowProps {
  item: RecentGRN;
}

function GRNRow({ item }: GRNRowProps) {
  const statusConfig = STATUS_CONFIG[item.status];

  return (
    <li>
      <Link
        href={`/grn/${item.id}`}
        className="flex items-center gap-3 py-3 hover:bg-muted/50 -mx-6 px-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`GRN ${item.grn_number}`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium font-mono text-foreground">
              {item.grn_number}
            </span>
            {statusConfig && (
              <Badge variant={statusConfig.variant} className="text-xs h-5">
                {statusConfig.label}
              </Badge>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="truncate">{item.supplier_name}</span>
            <span>·</span>
            <span className="font-mono">{item.po_number}</span>
            <span>·</span>
            <span>{formatRelative(item.received_at)}</span>
          </div>
        </div>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      </Link>
    </li>
  );
}

function GRNSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="h-4 w-24 animate-pulse bg-muted" />
              <div className="h-5 w-16 animate-pulse bg-muted" />
            </div>
            <div className="h-3 w-44 animate-pulse bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface RecentGRNsWidgetProps {
  grns?: RecentGRN[];
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  title?: string;
}

export function RecentGRNsWidget({
  grns,
  loading,
  error,
  onRetry,
  title = "Recent GRNs",
}: RecentGRNsWidgetProps) {
  return (
    <div className="border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Goods receipt notes</p>
        </div>
        <Link
          href="/grn"
          className="flex items-center gap-1 text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="View all GRNs"
        >
          View all <ChevronRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
      <div className="px-6">
        {loading ? (
          <GRNSkeleton />
        ) : error ? (
          <div className="py-8">
            <ErrorState error={error} onRetry={onRetry} title="Failed to load GRNs" />
          </div>
        ) : !grns || grns.length === 0 ? (
          <EmptyState
            title="No GRNs found"
            description="Goods receipt notes will appear here."
            className="py-10"
          />
        ) : (
          <ul className="divide-y divide-border" aria-label="Recent GRNs list">
            {grns.map((item) => (
              <GRNRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
