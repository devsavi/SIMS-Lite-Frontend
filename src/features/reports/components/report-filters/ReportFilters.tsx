"use client";

import * as React from "react";
import { Search, RotateCcw, Calendar, Filter } from "lucide-react";
import type { CommonReportFilterParams, ReportType } from "../../types";

interface ReportFiltersProps {
  reportType: ReportType;
  filters: CommonReportFilterParams;
  onFilterChange: (filters: CommonReportFilterParams) => void;
  onReset: () => void;
}

export function ReportFilters({
  reportType,
  filters,
  onFilterChange,
  onReset,
}: ReportFiltersProps) {
  const handleInputChange = (key: keyof CommonReportFilterParams, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
      page: 1, // reset page to 1 on filter change
    });
  };

  const showStatusFilter = [
    "inventory",
    "low-stock",
    "po",
    "grn",
    "stock-release",
    "supplier",
    "product",
  ].includes(reportType);

  const showMovementTypeFilter = reportType === "movement";
  const showCategoryFilter = ["inventory", "low-stock", "product"].includes(reportType);

  return (
    <div className="bg-card border border-border rounded-none p-4 mb-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Filter className="h-4 w-4 text-primary" />
          <span>Report Filters</span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search report..."
            value={filters.search || ""}
            onChange={(e) => handleInputChange("search", e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {/* Start Date */}
        <div className="relative">
          <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="date"
            placeholder="Start Date"
            value={filters.startDate || ""}
            onChange={(e) => handleInputChange("startDate", e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {/* End Date */}
        <div className="relative">
          <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="date"
            placeholder="End Date"
            value={filters.endDate || ""}
            onChange={(e) => handleInputChange("endDate", e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {/* Status Filter */}
        {showStatusFilter && (
          <div>
            <select
              aria-label="Filter by Status"
              value={filters.status || "ALL"}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="ALL">All Statuses</option>
              {reportType === "po" && (
                <>
                  <option value="DRAFT">Draft</option>
                  <option value="PENDING_APPROVAL">Pending Approval</option>
                  <option value="APPROVED">Approved</option>
                  <option value="PARTIALLY_RECEIVED">Partially Received</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </>
              )}
              {["grn", "stock-release"].includes(reportType) && (
                <>
                  <option value="DRAFT">Draft</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="APPROVED">Approved</option>
                  <option value="CANCELLED">Cancelled</option>
                </>
              )}
              {["inventory", "low-stock"].includes(reportType) && (
                <>
                  <option value="IN_STOCK">In Stock</option>
                  <option value="LOW_STOCK">Low Stock</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                </>
              )}
              {["supplier", "product"].includes(reportType) && (
                <>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </>
              )}
            </select>
          </div>
        )}

        {/* Movement Type Filter */}
        {showMovementTypeFilter && (
          <div>
            <select
              aria-label="Filter by Movement Type"
              value={filters.actionType || "ALL"}
              onChange={(e) => handleInputChange("actionType", e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="ALL">All Movement Types</option>
              <option value="INFLOW">Inflow (GRN / Receipt)</option>
              <option value="OUTFLOW">Outflow (Stock Release)</option>
              <option value="ADJUSTMENT_ADD">Adjustment (+)</option>
              <option value="ADJUSTMENT_SUBTRACT">Adjustment (-)</option>
              <option value="TRANSFER">Transfer</option>
            </select>
          </div>
        )}

        {/* Category Filter */}
        {showCategoryFilter && (
          <div>
            <select
              aria-label="Filter by Category"
              value={filters.categoryId || "ALL"}
              onChange={(e) => handleInputChange("categoryId", e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="ALL">All Categories</option>
              <option value="industrial">Industrial Components</option>
              <option value="lubricants">Lubricants</option>
              <option value="fasteners">Fasteners</option>
              <option value="raw">Raw Materials</option>
              <option value="packaging">Packaging</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
