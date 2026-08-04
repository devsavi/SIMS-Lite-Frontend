"use client";

import * as React from "react";
import { cn } from "@/utils/cn";
import type { GRNStatus } from "../types";

export interface GRNStatusBadgeProps {
  status: GRNStatus;
  className?: string;
}

const grnStatusConfig: Record<
  GRNStatus,
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
    bg: "bg-[#D3F3F1] dark:bg-[rgba(45,212,191,0.15)]",
    text: "text-[#12796F] dark:text-[#2DD4BF]",
    border: "border-[#A7E5E0] dark:border-[rgba(45,212,191,0.4)]",
    label: "Approved",
  },
  CANCELLED: {
    bg: "bg-[#FEE2E2] dark:bg-[rgba(248,113,113,0.15)]",
    text: "text-[#B91C1C] dark:text-[#F87171]",
    border: "border-[#FECACA] dark:border-[rgba(248,113,113,0.4)]",
    label: "Cancelled",
  },
};

export function GRNStatusBadge({ status, className }: GRNStatusBadgeProps) {
  const config = grnStatusConfig[status];

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
