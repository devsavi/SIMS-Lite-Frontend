import * as React from "react";
import { FileEdit, Send, CheckCircle2, XCircle } from "lucide-react";
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
  DRAFT: {
    bg: "bg-[#F1F1F1] dark:bg-[rgba(255,255,255,0.08)]",
    text: "text-[#6B6B6B] dark:text-[#9CA3AF]",
    border: "border-[#DADADA] dark:border-[rgba(156,163,175,0.35)]",
    icon: FileEdit,
  },
  SUBMITTED: {
    bg: "bg-[#E0E3FC] dark:bg-[rgba(129,140,248,0.15)]",
    text: "text-[#4338CA] dark:text-[#818CF8]",
    border: "border-[#C1C7F8] dark:border-[rgba(129,140,248,0.4)]",
    icon: Send,
  },
  APPROVED: {
    bg: "bg-[#D6F5DE] dark:bg-[rgba(52,211,153,0.15)]",
    text: "text-[#1B8A4C] dark:text-[#34D399]",
    border: "border-[#AEE8C0] dark:border-[rgba(52,211,153,0.4)]",
    icon: CheckCircle2,
  },
  CANCELLED: {
    bg: "bg-[#FDE2E2] dark:bg-[rgba(248,113,113,0.15)]",
    text: "text-[#C0362C] dark:text-[#F87171]",
    border: "border-[#F8C1BC] dark:border-[rgba(248,113,113,0.4)]",
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
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-none border transition-colors",
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
