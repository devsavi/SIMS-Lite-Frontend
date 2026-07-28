import * as React from "react";
import { FileEdit, Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/utils/cn";
import { normalizeStatus, getStatusLabel } from "../../utils/stock-release-utils";
import type { StockReleaseStatus } from "../../types/stock-release-types";

export interface StockReleaseStatusBadgeProps {
  status: StockReleaseStatus | string;
  showIcon?: boolean;
  className?: string;
}

const statusStyles: Record<
  StockReleaseStatus,
  {
    bg: string;
    text: string;
    border: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  draft: {
    bg: "bg-slate-100 dark:bg-slate-800/60",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-700",
    icon: FileEdit,
  },
  submitted: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    icon: Clock,
  },
  approved: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: CheckCircle2,
  },
  cancelled: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800",
    icon: XCircle,
  },
};

export function StockReleaseStatusBadge({
  status,
  showIcon = true,
  className,
}: StockReleaseStatusBadgeProps) {
  const normStatus = normalizeStatus(status);
  const config = statusStyles[normStatus];
  const IconComponent = config.icon;
  const label = getStatusLabel(normStatus);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-none border shadow-xs transition-colors",
        config.bg,
        config.text,
        config.border,
        className
      )}
      aria-label={`Status: ${label}`}
    >
      {showIcon && <IconComponent className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
      <span>{label}</span>
    </span>
  );
}
