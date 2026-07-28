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
import type { StockReleaseFilterParams, StockReleaseStatus } from "../../types/stock-release-types";

export interface ReleaseFilterPanelProps {
  filters: StockReleaseFilterParams;
  onFilterChange: (filters: Partial<StockReleaseFilterParams>) => void;
  onReset: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function ReleaseFilterPanel({
  filters,
  onFilterChange,
  onReset,
  onRefresh,
  isRefreshing = false,
}: ReleaseFilterPanelProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-none border border-border shadow-xs">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search input */}
        <div className="w-full sm:w-72">
          <SearchInput
            value={filters.search ?? ""}
            onChange={(search) => onFilterChange({ search, page: 1 })}
            placeholder="Search release #, notes, user..."
          />
        </div>

        {/* Status filter select */}
        <div className="w-full sm:w-44">
          <Select
            value={filters.status ?? "ALL"}
            onValueChange={(val) =>
              onFilterChange({
                status: val as StockReleaseStatus | "ALL",
                page: 1,
              })
            }
          >
            <SelectTrigger aria-label="Filter by status">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Inputs */}
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

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="gap-1 text-xs"
        >
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
          <RefreshCw
            className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
          />
          <span>Refresh</span>
        </Button>
      </div>
    </div>
  );
}
