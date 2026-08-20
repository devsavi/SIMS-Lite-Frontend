"use client";

import * as React from "react";
import { Search, RotateCcw, Calendar, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
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
    <div className="bg-card border border-border rounded-none p-4 mb-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Filter className="h-4 w-4 text-primary" />
          <span>Report Filters</span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Period Preset Filter */}
        <div>
          <Select
            value={filters.period || "day"}
            onValueChange={(val) => handleInputChange("period", val)}
          >
            <SelectTrigger aria-label="Filter by Period" className="w-full h-9 rounded-none border-input text-xs font-medium bg-background">
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today (Default)</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="custom">Custom Date Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search report..."
            value={filters.search || ""}
            onChange={(e) => handleInputChange("search", e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 h-9 text-xs bg-background border border-input rounded-none focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
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
            className="w-full pl-9 pr-3 py-1.5 h-9 text-xs bg-background border border-input rounded-none focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
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
            className="w-full pl-9 pr-3 py-1.5 h-9 text-xs bg-background border border-input rounded-none focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        {/* Status Filter */}
        {showStatusFilter && (
          <div>
            <Select
              value={filters.status || "ALL"}
              onValueChange={(val) => handleInputChange("status", val)}
            >
              <SelectTrigger aria-label="Filter by Status" className="w-full h-9 rounded-none border-input text-xs font-medium bg-background">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                {reportType === "po" && (
                  <>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="PARTIALLY_RECEIVED">Partially Received</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </>
                )}
                {["grn", "stock-release"].includes(reportType) && (
                  <>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="SUBMITTED">Submitted</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </>
                )}
                {["inventory", "low-stock"].includes(reportType) && (
                  <>
                    <SelectItem value="IN_STOCK">In Stock</SelectItem>
                    <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                    <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                  </>
                )}
                {["supplier", "product"].includes(reportType) && (
                  <>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Movement Type Filter */}
        {showMovementTypeFilter && (
          <div>
            <Select
              value={filters.actionType || "ALL"}
              onValueChange={(val) => handleInputChange("actionType", val)}
            >
              <SelectTrigger aria-label="Filter by Movement Type" className="w-full h-9 rounded-none border-input text-xs font-medium bg-background">
                <SelectValue placeholder="All Movement Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Movement Types</SelectItem>
                <SelectItem value="INFLOW">Inflow (GRN / Receipt)</SelectItem>
                <SelectItem value="OUTFLOW">Outflow (Stock Release)</SelectItem>
                <SelectItem value="ADJUSTMENT_ADD">Adjustment (+)</SelectItem>
                <SelectItem value="ADJUSTMENT_SUBTRACT">Adjustment (-)</SelectItem>
                <SelectItem value="TRANSFER">Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Category Filter */}
        {showCategoryFilter && (
          <div>
            <Select
              value={filters.categoryId || "ALL"}
              onValueChange={(val) => handleInputChange("categoryId", val)}
            >
              <SelectTrigger aria-label="Filter by Category" className="w-full h-9 rounded-none border-input text-xs font-medium bg-background">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                <SelectItem value="industrial">Industrial Components</SelectItem>
                <SelectItem value="lubricants">Lubricants</SelectItem>
                <SelectItem value="fasteners">Fasteners</SelectItem>
                <SelectItem value="raw">Raw Materials</SelectItem>
                <SelectItem value="packaging">Packaging</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}
