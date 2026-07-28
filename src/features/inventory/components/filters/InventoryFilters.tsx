"use client";

import * as React from "react";
import { SearchInput } from "@/components/common/search-input";
import { Button } from "@/app/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { RotateCw, FilterX } from "lucide-react";
import type { InventoryFilterParams, StockStatus } from "../../types";

export interface InventoryFiltersProps {
  filters: InventoryFilterParams;
  onFilterChange: (updated: Partial<InventoryFilterParams>) => void;
  onReset: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  categories?: Array<{ id: string; name: string }>;
  suppliers?: Array<{ id: string; name: string }>;
}

export function InventoryFilters({
  filters,
  onFilterChange,
  onReset,
  onRefresh,
  isRefreshing = false,
  categories = [],
  suppliers = [],
}: InventoryFiltersProps) {
  const hasActiveFilters = Boolean(
    filters.search ||
      (filters.category_id && filters.category_id !== "ALL") ||
      (filters.supplier_id && filters.supplier_id !== "ALL") ||
      (filters.stock_status && filters.stock_status !== "ALL")
  );

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-card p-4 border border-border rounded-none shadow-sm">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        <div className="w-full sm:w-72">
          <SearchInput
            value={filters.search ?? ""}
            onChange={(val) => onFilterChange({ search: val, page: 1 })}
            placeholder="Search by product, SKU, or barcode..."
          />
        </div>

        {/* Category Filter */}
        <Select
          value={filters.category_id ?? "ALL"}
          onValueChange={(val) => onFilterChange({ category_id: val, page: 1 })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Supplier Filter */}
        <Select
          value={filters.supplier_id ?? "ALL"}
          onValueChange={(val) => onFilterChange({ supplier_id: val, page: 1 })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Suppliers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Suppliers</SelectItem>
            {suppliers.map((sup) => (
              <SelectItem key={sup.id} value={sup.id}>
                {sup.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Stock Status Filter */}
        <Select
          value={filters.stock_status ?? "ALL"}
          onValueChange={(val) =>
            onFilterChange({
              stock_status: val as StockStatus | "ALL",
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="All Stock Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Stock Status</SelectItem>
            <SelectItem value="in_stock">In Stock</SelectItem>
            <SelectItem value="low_stock">Low Stock</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-muted-foreground hover:text-foreground gap-1.5"
          >
            <FilterX className="h-4 w-4" />
            Reset Filters
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 self-end md:self-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RotateCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
}
