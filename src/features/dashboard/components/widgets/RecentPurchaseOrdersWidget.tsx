"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { formatRelative, formatCurrency } from "@/utils/format";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Badge } from "@/app/components/ui/badge";
import { ChevronRight } from "lucide-react";
import type { RecentPurchaseOrder } from "../../types";

const STATUS_CONFIG: Record<
  RecentPurchaseOrder["status"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  draft: { label: "Draft", variant: "secondary" },
  pending: { label: "Pending", variant: "outline" },
  approved: { label: "Approved", variant: "default" },
  partially_received: { label: "Partial", variant: "outline" },
  received: { label: "Received", variant: "default" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

interface PurchaseOrderRowProps {
  item: RecentPurchaseOrder;
}

function PurchaseOrderRow({ item }: PurchaseOrderRowProps) {
  const statusConfig = STATUS_CONFIG[item.status];

  return (
    <li>
      <Link
        href={`/purchase-orders/${item.id}`}
        className="flex items-center gap-3 py-3 hover:bg-muted/50 -mx-6 px-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Purchase order ${item.po_number}`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium font-mono text-foreground">
              {item.po_number}
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
            <span>{formatRelative(item.created_at)}</span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold text-foreground">
            {formatCurrency(item.total_amount)}
          </p>
        </div>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      </Link>
    </li>
  );
}

function PurchaseOrderSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="h-4 w-24 animate-pulse bg-muted" />
              <div className="h-5 w-16 animate-pulse bg-muted" />
            </div>
            <div className="h-3 w-36 animate-pulse bg-muted" />
          </div>
          <div className="h-4 w-20 animate-pulse bg-muted" />
        </div>
      ))}
    </div>
  );
}

interface RecentPurchaseOrdersWidgetProps {
  orders?: RecentPurchaseOrder[];
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  title?: string;
}

export function RecentPurchaseOrdersWidget({
  orders,
  loading,
  error,
  onRetry,
  title = "Recent Purchase Orders",
}: RecentPurchaseOrdersWidgetProps) {
  return (
    <div className="border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Latest purchase orders</p>
        </div>
        <Link
          href="/purchase-orders"
          className="flex items-center gap-1 text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="View all purchase orders"
        >
          View all <ChevronRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
      <div className="px-6">
        {loading ? (
          <PurchaseOrderSkeleton />
        ) : error ? (
          <div className="py-8">
            <ErrorState error={error} onRetry={onRetry} title="Failed to load purchase orders" />
          </div>
        ) : !orders || orders.length === 0 ? (
          <EmptyState
            title="No purchase orders"
            description="Purchase orders will appear here."
            className="py-10"
          />
        ) : (
          <ul className="divide-y divide-border" aria-label="Recent purchase orders list">
            {orders.map((item) => (
              <PurchaseOrderRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
