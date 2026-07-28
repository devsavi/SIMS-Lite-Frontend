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
}

export function LedgerFilters({ filters, onFilterChange, onReset }: LedgerFiltersProps) {
  const hasActiveFilters = Boolean(
    filters.search ||
      (filters.entry_type && filters.entry_type !== "ALL") ||
      filters.from_date ||
      filters.to_date
  );

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-card p-4 border border-border rounded-none shadow-sm">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        <div className="w-full sm:w-64">
          <SearchInput
            value={filters.search ?? ""}
            onChange={(val) => onFilterChange({ search: val, page: 1 })}
            placeholder="Search reference or notes..."
          />
        </div>

        {/* Entry Type Filter */}
        <Select
          value={filters.entry_type ?? "ALL"}
          onValueChange={(val) => onFilterChange({ entry_type: val, page: 1 })}
        >
          <SelectTrigger className="w-[190px]">
            <SelectValue placeholder="All Action Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Action Types</SelectItem>
            <SelectItem value="GRN_RECEIPT">GRN Receipt</SelectItem>
            <SelectItem value="STOCK_RELEASE">Stock Release</SelectItem>
            <SelectItem value="ADJUSTMENT_INCREASE">Stock Increase (+)</SelectItem>
            <SelectItem value="ADJUSTMENT_DECREASE">Stock Decrease (-)</SelectItem>
            <SelectItem value="INITIAL_STOCK">Initial Stock</SelectItem>
            <SelectItem value="RETURN">Customer Return</SelectItem>
            <SelectItem value="TRANSFER">Transfer</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range Filters */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Input
              type="date"
              value={filters.from_date ?? ""}
              onChange={(e) => onFilterChange({ from_date: e.target.value, page: 1 })}
              className="w-[150px] text-xs"
              aria-label="From Date"
            />
          </div>
          <span className="text-muted-foreground text-xs">to</span>
          <div className="relative">
            <Input
              type="date"
              value={filters.to_date ?? ""}
              onChange={(e) => onFilterChange({ to_date: e.target.value, page: 1 })}
              className="w-[150px] text-xs"
              aria-label="To Date"
            />
          </div>
        </div>

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
