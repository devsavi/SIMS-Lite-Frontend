"use client";

import * as React from "react";
import { cn } from "@/utils/cn";
import type { POStatus } from "../types";

export interface POStatusBadgeProps {
  status: POStatus;
  className?: string;
}

const poStatusConfig: Record<
  POStatus,
  { bg: string; text: string; border: string; label: string }
> = {
  DRAFT: {
    bg: "bg-[#F1F1F1] dark:bg-[rgba(255,255,255,0.08)]",
    text: "text-[#6B6B6B] dark:text-[#9CA3AF]",
    border: "border-[#DADADA] dark:border-[rgba(156,163,175,0.35)]",
    label: "Draft",
  },
  SUBMITTED: {
    bg: "bg-[#E0E3FC] dark:bg-[rgba(129,140,248,0.15)]",
    text: "text-[#4338CA] dark:text-[#818CF8]",
    border: "border-[#C1C7F8] dark:border-[rgba(129,140,248,0.4)]",
    label: "Submitted",
  },
  APPROVED: {
    bg: "bg-[#D6F5DE] dark:bg-[rgba(52,211,153,0.15)]",
    text: "text-[#1B8A4C] dark:text-[#34D399]",
    border: "border-[#AEE8C0] dark:border-[rgba(52,211,153,0.4)]",
    label: "Approved",
  },
  REJECTED: {
    bg: "bg-[#FDE2E2] dark:bg-[rgba(248,113,113,0.15)]",
    text: "text-[#C0362C] dark:text-[#F87171]",
    border: "border-[#F8C1BC] dark:border-[rgba(248,113,113,0.4)]",
    label: "Rejected",
  },
  CANCELLED: {
    bg: "bg-[#FDE2E2] dark:bg-[rgba(248,113,113,0.15)]",
    text: "text-[#C0362C] dark:text-[#F87171]",
    border: "border-[#F8C1BC] dark:border-[rgba(248,113,113,0.4)]",
    label: "Cancelled",
  },
  PARTIALLY_RECEIVED: {
    bg: "bg-[#FFF3D6] dark:bg-[rgba(251,191,36,0.15)]",
    text: "text-[#B9791A] dark:text-[#FBBF24]",
    border: "border-[#FCE3A0] dark:border-[rgba(251,191,36,0.4)]",
    label: "Partially Received",
  },
  FULLY_RECEIVED: {
    bg: "bg-[#D6F5DE] dark:bg-[rgba(52,211,153,0.15)]",
    text: "text-[#1B8A4C] dark:text-[#34D399]",
    border: "border-[#AEE8C0] dark:border-[rgba(52,211,153,0.4)]",
    label: "Fully Received",
  },
};

export function POStatusBadge({ status, className }: POStatusBadgeProps) {
  const config = poStatusConfig[status];

  if (!config) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-none border bg-[#F1F1F1] text-[#6B6B6B] border-[#DADADA]">
        {status}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-none border transition-colors",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {config.label}
    </span>
  );
}
