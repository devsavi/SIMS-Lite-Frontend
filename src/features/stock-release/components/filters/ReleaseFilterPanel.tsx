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
import { PURPOSE_LABELS, STATUS_LABELS } from "../../constants/stock-release-constants";
import type {
  StockReleaseFilterParams,
  StockReleaseStatus,
  StockReleasePurpose,
  StockReleasePeriod,
} from "../../types/stock-release-types";

export interface ReleaseFilterPanelProps {
  filters: StockReleaseFilterParams;
  onFilterChange: (filters: Partial<StockReleaseFilterParams>) => void;
  onReset: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

const PERIOD_LABELS: Record<StockReleasePeriod, string> = {
  day: "Today",
  week: "This Week",
  month: "This Month",
  custom: "Custom Range",
};

export function ReleaseFilterPanel({
  filters,
  onFilterChange,
  onReset,
  onRefresh,
  isRefreshing = false,
}: ReleaseFilterPanelProps) {
  const showDateRange = filters.period === "custom";

  return (
    <div className="flex flex-col gap-4 bg-card p-4 rounded-none border border-border shadow-xs">
      {/* Row 1: search + status + purpose + period */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {/* Search */}
        <div className="w-full sm:w-72">
          <SearchInput
            value={filters.search ?? ""}
            onChange={(search) => onFilterChange({ search, page: 1 })}
            placeholder="Search release , batch or notes..."
          />
        </div>

        {/* Status filter */}
        <div className="w-full sm:w-44">
          <Select
            value={filters.status ?? "ALL"}
            onValueChange={(val) =>
              onFilterChange({ status: val as StockReleaseStatus | "ALL", page: 1 })
            }
          >
            <SelectTrigger aria-label="Filter by status">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {(Object.keys(STATUS_LABELS) as StockReleaseStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Purpose filter */}
        <div className="w-full sm:w-44">
          <Select
            value={filters.purpose ?? "ALL"}
            onValueChange={(val) =>
              onFilterChange({ purpose: val as StockReleasePurpose | "ALL", page: 1 })
            }
          >
            <SelectTrigger aria-label="Filter by purpose">
              <SelectValue placeholder="All Purposes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Purposes</SelectItem>
              {(Object.keys(PURPOSE_LABELS) as StockReleasePurpose[]).map((p) => (
                <SelectItem key={p} value={p}>
                  {PURPOSE_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Period filter */}
        <div className="w-full sm:w-44">
          <Select
            value={filters.period ?? "ALL"}
            onValueChange={(val) => {
              const period = val as StockReleasePeriod | "ALL";
              onFilterChange({
                period,
                // clear custom dates when switching away from custom
                from_date: period !== "custom" ? undefined : filters.from_date,
                to_date: period !== "custom" ? undefined : filters.to_date,
                page: 1,
              });
            }}
          >
            <SelectTrigger aria-label="Filter by period">
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Time</SelectItem>
              {(Object.keys(PERIOD_LABELS) as StockReleasePeriod[]).map((p) => (
                <SelectItem key={p} value={p}>
                  {PERIOD_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:ml-auto">
          <Button variant="outline" size="sm" onClick={onReset} className="gap-1 text-xs">
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="gap-1 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Row 2: custom date range (only when period === custom) */}
      {showDateRange && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground">Date Range:</span>
          <div className="flex items-center gap-2">
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
          </div>
        </div>
      )}
    </div>
  );
}
