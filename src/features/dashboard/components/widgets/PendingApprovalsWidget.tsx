"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { formatDateTime, formatCurrency } from "@/utils/format";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/app/components/ui/button";
import { ShoppingCart, ArrowUpFromLine, ClipboardList, ChevronRight } from "lucide-react";
import type { PendingApproval } from "../../types";

const TYPE_CONFIG: Record<
  PendingApproval["type"],
  { icon: React.ComponentType<{ className?: string }>; label: string; href: string }
> = {
  purchase_order: { icon: ShoppingCart, label: "Purchase Order", href: "/purchase-orders" },
  stock_release: { icon: ArrowUpFromLine, label: "Stock Release", href: "/stock-release" },
  grn: { icon: ClipboardList, label: "GRN", href: "/procurement/grns" },
};

interface ApprovalRowProps {
  item: PendingApproval;
}

function ApprovalRow({ item }: ApprovalRowProps) {
  const config = TYPE_CONFIG[item.type];
  const Icon = config?.icon ?? ShoppingCart;
  const href = config?.href ? `${config.href}/${item.id}` : "#";

  return (
    <li className="flex items-start gap-3 py-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center bg-warning/10 text-warning">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground font-mono">
            {item.reference}
          </span>
          <span className="text-xs text-muted-foreground">
            {config?.label ?? item.type}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground truncate">{item.description}</p>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span>By {item.requested_by}</span>
          <span>{formatDateTime(item.requested_at)}</span>
          {item.amount != null && (
            <span className="font-medium text-foreground">{formatCurrency(item.amount)}</span>
          )}
        </div>
      </div>
      <Link
        href={href}
        className="shrink-0"
        aria-label={`Review ${item.reference}`}
      >
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
          Review
        </Button>
      </Link>
    </li>
  );
}

function PendingApprovalSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 py-3">
          <div className="mt-0.5 h-7 w-7 shrink-0 animate-pulse bg-muted" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-24 animate-pulse bg-muted" />
            <div className="h-3 w-40 animate-pulse bg-muted" />
            <div className="h-3 w-32 animate-pulse bg-muted" />
          </div>
          <div className="h-7 w-16 animate-pulse bg-muted" />
        </div>
      ))}
    </div>
  );
}

interface PendingApprovalsWidgetProps {
  approvals?: PendingApproval[];
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  allowedTypes?: PendingApproval["type"][];
}

// Height matching ~5 rows (~72px per row)
const VISIBLE_HEIGHT = "360px";

export function PendingApprovalsWidget({
  approvals,
  loading,
  error,
  onRetry,
  allowedTypes,
}: PendingApprovalsWidgetProps) {
  const filteredApprovals = React.useMemo(() => {
    if (!approvals) return undefined;
    if (!allowedTypes || allowedTypes.length === 0) return approvals;
    return approvals.filter((a) => allowedTypes.includes(a.type));
  }, [approvals, allowedTypes]);

  return (
    <div className="border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            Pending Approvals
            {filteredApprovals && filteredApprovals.length > 0 && (
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center bg-warning px-1.5 text-xs font-bold text-warning-foreground">
                {filteredApprovals.length}
              </span>
            )}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Items awaiting your review</p>
        </div>
      </div>
      <div className="px-6">
        {loading ? (
          <PendingApprovalSkeleton />
        ) : error ? (
          <div className="py-8">
            <ErrorState error={error} onRetry={onRetry} title="Failed to load approvals" />
          </div>
        ) : !filteredApprovals || filteredApprovals.length === 0 ? (
          <EmptyState
            title="No pending approvals"
            description="All items have been reviewed."
            className="py-10"
          />
        ) : (
          <div
            style={{ maxHeight: VISIBLE_HEIGHT }}
            className="overflow-y-auto"
            aria-label="Pending approvals"
          >
            <ul className="divide-y divide-border" aria-label="Pending approvals list">
              {filteredApprovals.map((item) => (
                <ApprovalRow key={item.id} item={item} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

