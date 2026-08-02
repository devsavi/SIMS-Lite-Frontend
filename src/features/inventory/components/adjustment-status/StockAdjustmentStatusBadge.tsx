"use client";

import * as React from "react";
import { FileEdit, Send, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/utils/cn";
import type { StockAdjustmentStatus } from "../../types";

export interface StockAdjustmentStatusBadgeProps {
  status: StockAdjustmentStatus | string;
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<
  StockAdjustmentStatus,
  {
    bg: string;
    text: string;
    border: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  // inactive / grey
  DRAFT: {
    bg: "bg-[#F1F1F1] dark:bg-[rgba(255,255,255,0.08)]",
    text: "text-[#6B6B6B] dark:text-[#9CA3AF]",
    border: "border-[#DADADA] dark:border-[rgba(156,163,175,0.35)]",
    label: "Draft",
    icon: FileEdit,
  },
  // submitted / indigo
  SUBMITTED: {
    bg: "bg-[#E0E3FC] dark:bg-[rgba(129,140,248,0.15)]",
    text: "text-[#4338CA] dark:text-[#818CF8]",
    border: "border-[#C1C7F8] dark:border-[rgba(129,140,248,0.4)]",
    label: "Submitted",
    icon: Send,
  },
  // approved / green
  APPROVED: {
    bg: "bg-[#D6F5DE] dark:bg-[rgba(52,211,153,0.15)]",
    text: "text-[#1B8A4C] dark:text-[#34D399]",
    border: "border-[#AEE8C0] dark:border-[rgba(52,211,153,0.4)]",
    label: "Approved",
    icon: CheckCircle2,
  },
  // cancelled / red
  CANCELLED: {
    bg: "bg-[#FDE2E2] dark:bg-[rgba(248,113,113,0.15)]",
    text: "text-[#C0362C] dark:text-[#F87171]",
    border: "border-[#F8C1BC] dark:border-[rgba(248,113,113,0.4)]",
    label: "Cancelled",
    icon: XCircle,
  },
};

function normalizeStatus(status: string): StockAdjustmentStatus {
  const upper = status.toUpperCase();
  if (upper === "SUBMITTED") return "SUBMITTED";
  if (upper === "APPROVED") return "APPROVED";
  if (upper === "CANCELLED" || upper === "CANCELED") return "CANCELLED";
  return "DRAFT";
}

export function StockAdjustmentStatusBadge({
  status,
  showIcon = true,
  className,
}: StockAdjustmentStatusBadgeProps) {
  const normalized = normalizeStatus(status);
  const config = statusConfig[normalized];
  const IconComponent = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-none border transition-colors",
        config.bg,
        config.text,
        config.border,
        className
      )}
      aria-label={`Status: ${config.label}`}
    >
      {showIcon && <IconComponent className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
      <span>{config.label}</span>
    </span>
  );
}
