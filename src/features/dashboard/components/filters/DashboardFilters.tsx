"use client";

import * as React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { cn } from "@/utils/cn";
import type { DashboardQueryParams } from "../../types";

type Period = NonNullable<DashboardQueryParams["period"]>;

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "custom", label: "Custom Range" },
];

interface DashboardFiltersProps {
  period: Period;
  onPeriodChange: (period: Period) => void;
  fromDate?: string;
  onFromDateChange?: (date: string) => void;
  toDate?: string;
  onToDateChange?: (date: string) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export function DashboardFilters({
  period,
  onPeriodChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  onRefresh,
  isRefreshing = false,
  className,
}: DashboardFiltersProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)} role="toolbar" aria-label="Dashboard filters">
      <Select value={period} onValueChange={(v) => onPeriodChange(v as Period)}>
        <SelectTrigger
          className="h-8 w-[140px] text-sm"
          aria-label="Select time period"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PERIOD_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {period === "custom" && (
        <div className="flex items-center gap-1.5 animate-in fade-in duration-200">
          <input
            type="date"
            value={fromDate || ""}
            onChange={(e) => onFromDateChange?.(e.target.value)}
            className="h-8 rounded-none border border-border bg-card px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
            aria-label="From Date"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="date"
            value={toDate || ""}
            onChange={(e) => onToDateChange?.(e.target.value)}
            className="h-8 rounded-none border border-border bg-card px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
            aria-label="To Date"
          />
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
        aria-label="Refresh dashboard data"
        className="h-8 w-8 p-0"
      >
        <RefreshCw
          className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")}
          aria-hidden="true"
        />
      </Button>
    </div>
  );
}
