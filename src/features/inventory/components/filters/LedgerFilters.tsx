"use client";

import * as React from "react";
import { SearchInput } from "@/components/common/search-input";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { FilterX } from "lucide-react";
import type { LedgerFilterParams } from "../../types";

export interface LedgerFiltersProps {
  filters: LedgerFilterParams;
  onFilterChange: (updated: Partial<LedgerFilterParams>) => void;
  onReset: () => void;
  /** Hide the product search box (e.g. when already on a product-specific page) */
  hideProductSearch?: boolean;
}

export function LedgerFilters({
  filters,
  onFilterChange,
  onReset,
  hideProductSearch = false,
}: LedgerFiltersProps) {
  const isCustomPeriod = filters.period === "custom";

  const hasActiveFilters = Boolean(
    filters.search ||
      (filters.entry_type && filters.entry_type !== "ALL") ||
      (filters.reference_type && filters.reference_type !== "ALL") ||
      (filters.period && filters.period !== "ALL") ||
      filters.from_date ||
      filters.to_date
  );

  return (
    <div className="flex flex-col gap-3 bg-card p-4 border border-border rounded-none shadow-sm">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        {!hideProductSearch && (
          <div className="w-full sm:w-64">
            <SearchInput
              value={filters.search ?? ""}
              onChange={(val) => onFilterChange({ search: val, page: 1 })}
              placeholder="Search reference or notes..."
            />
          </div>
        )}

        {/* Entry Type Filter */}
        <Select
          value={filters.entry_type ?? "ALL"}
          onValueChange={(val) => onFilterChange({ entry_type: val, page: 1 })}
        >
          <SelectTrigger className="w-[190px]">
            <SelectValue placeholder="All Entry Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Entry Types</SelectItem>
            <SelectItem value="PURCHASE_RECEIPT">Purchase Receipt</SelectItem>
            <SelectItem value="STOCK_RELEASE">Stock Release</SelectItem>
            <SelectItem value="ADJUSTMENT_IN">Adjustment (+)</SelectItem>
            <SelectItem value="ADJUSTMENT_OUT">Adjustment (-)</SelectItem>
            <SelectItem value="INITIAL_STOCK">Initial Stock</SelectItem>
          </SelectContent>
        </Select>

        {/* Reference Type Filter */}
        <Select
          value={filters.reference_type ?? "ALL"}
          onValueChange={(val) => onFilterChange({ reference_type: val, page: 1 })}
        >
          <SelectTrigger className="w-[185px]">
            <SelectValue placeholder="All Reference Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Reference Types</SelectItem>
            <SelectItem value="GRN">GRN</SelectItem>
            <SelectItem value="STOCK_ADJUSTMENT">Stock Adjustment</SelectItem>
            <SelectItem value="STOCK_RELEASE">Stock Release</SelectItem>
            <SelectItem value="INITIAL">Initial Stock</SelectItem>
          </SelectContent>
        </Select>

        {/* Period Filter */}
        <Select
          value={filters.period ?? "ALL"}
          onValueChange={(val) => {
            // Clear custom date range if switching away from custom
            const update: Partial<LedgerFilterParams> = { period: val as LedgerFilterParams["period"], page: 1 };
            if (val !== "custom") {
              update.from_date = "";
              update.to_date = "";
            }
            onFilterChange(update);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Time</SelectItem>
            <SelectItem value="day">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>

        {/* Custom Date Range — only shown when period = custom */}
        {isCustomPeriod && (
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={filters.from_date ?? ""}
              onChange={(e) => onFilterChange({ from_date: e.target.value, page: 1 })}
              className="w-[150px] text-xs"
              aria-label="From Date"
            />
            <span className="text-muted-foreground text-xs">to</span>
            <Input
              type="date"
              value={filters.to_date ?? ""}
              onChange={(e) => onFilterChange({ to_date: e.target.value, page: 1 })}
              className="w-[150px] text-xs"
              aria-label="To Date"
            />
          </div>
        )}

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-muted-foreground hover:text-foreground gap-1.5"
          >
            <FilterX className="h-4 w-4" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
