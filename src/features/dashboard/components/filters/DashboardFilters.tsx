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
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "1y", label: "Last 12 months" },
];

interface DashboardFiltersProps {
  period: Period;
  onPeriodChange: (period: Period) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export function DashboardFilters({
  period,
  onPeriodChange,
  onRefresh,
  isRefreshing = false,
  className,
}: DashboardFiltersProps) {
  return (
    <div className={cn("flex items-center gap-2", className)} role="toolbar" aria-label="Dashboard filters">
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
