"use client";

import * as React from "react";
import { RefreshCw, RotateCcw } from "lucide-react";
import { SearchInput } from "@/components/common/search-input";
import { Button } from "@/app/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import type {
  StockAdjustmentFilterParams,
  StockAdjustmentStatus,
  StockAdjustmentType,
  StockAdjustmentPeriod,
} from "../../types";

export interface AdjustmentFilterPanelProps {
  filters: StockAdjustmentFilterParams;
  onFilterChange: (filters: Partial<StockAdjustmentFilterParams>) => void;
  onReset: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function AdjustmentFilterPanel({
  filters,
  onFilterChange,
  onReset,
  onRefresh,
  isRefreshing = false,
}: AdjustmentFilterPanelProps) {
  const showDateRange = filters.period === "custom";

  return (
    <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-none border border-border shadow-xs">
      {/* Search */}
      <div className="w-full sm:w-64">
        <SearchInput
          value={filters.search ?? ""}
          onChange={(search) => onFilterChange({ search, page: 1 })}
          placeholder="Search adjustment #, reason..."
        />
      </div>

      {/* Status filter */}
      <Select
        value={filters.status ?? "ALL"}
        onValueChange={(val) =>
          onFilterChange({ status: val as StockAdjustmentStatus | "ALL", page: 1 })
        }
      >
        <SelectTrigger className="w-[150px]" aria-label="Filter by status">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Statuses</SelectItem>
          <SelectItem value="DRAFT">Draft</SelectItem>
          <SelectItem value="SUBMITTED">Submitted</SelectItem>
          <SelectItem value="APPROVED">Approved</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      {/* Adjustment type filter */}
      <Select
        value={filters.adjustment_type ?? "ALL"}
        onValueChange={(val) =>
          onFilterChange({
            adjustment_type: val as StockAdjustmentType | "ALL",
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-[150px]" aria-label="Filter by adjustment type">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Types</SelectItem>
          <SelectItem value="INCREASE">Increase</SelectItem>
          <SelectItem value="DECREASE">Decrease</SelectItem>
          <SelectItem value="RECOUNT">Recount</SelectItem>
        </SelectContent>
      </Select>

      {/* Period filter */}
      <Select
        value={filters.period ?? "ALL"}
        onValueChange={(val) => {
          const period = val as StockAdjustmentPeriod | "ALL";
          onFilterChange({
            period,
            from_date: period !== "custom" ? undefined : filters.from_date,
            to_date: period !== "custom" ? undefined : filters.to_date,
            page: 1,
          });
        }}
      >
        <SelectTrigger className="w-[140px]" aria-label="Filter by period">
          <SelectValue placeholder="All Periods" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Periods</SelectItem>
          <SelectItem value="day">Today</SelectItem>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      {/* Custom date range — shown inline when period=custom */}
      {showDateRange && (
        <>
          <input
            type="date"
            aria-label="From date"
            className="flex h-9 rounded-none border border-input bg-transparent px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
            value={filters.from_date ?? ""}
            onChange={(e) =>
              onFilterChange({ from_date: e.target.value || undefined, page: 1 })
            }
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="date"
            aria-label="To date"
            className="flex h-9 rounded-none border border-input bg-transparent px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
            value={filters.to_date ?? ""}
            onChange={(e) =>
              onFilterChange({ to_date: e.target.value || undefined, page: 1 })
            }
          />
        </>
      )}

      {/* Action buttons — right-aligned */}
      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        className="gap-1.5 text-xs ml-auto"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        <span>Reset</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="gap-1.5 text-xs"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
        <span>Refresh</span>
      </Button>
    </div>
  );
}
