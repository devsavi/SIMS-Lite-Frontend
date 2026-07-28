"use client";

import React from "react";
import { Search } from "lucide-react";
import type { AuditFilterParams, AuditAction } from "../types";

interface AuditTrailFiltersProps {
  filters: AuditFilterParams;
  onFilterChange: (newFilters: AuditFilterParams) => void;
}

export function AuditTrailFilters({ filters, onFilterChange }: AuditTrailFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search audit records by entity, ID, or user..."
          value={filters.search || ""}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value, page: 1 })}
          className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={filters.entity || "ALL"}
          onChange={(e) => onFilterChange({ ...filters, entity: e.target.value, page: 1 })}
          aria-label="Filter by entity"
          className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="ALL">All Entities</option>
          <option value="User">User</option>
          <option value="Product">Product</option>
          <option value="PurchaseOrder">Purchase Order</option>
          <option value="Supplier">Supplier</option>
          <option value="CompanyProfile">Company Profile</option>
          <option value="SystemSettings">System Settings</option>
        </select>

        <select
          value={filters.action || "ALL"}
          onChange={(e) => onFilterChange({ ...filters, action: e.target.value as AuditAction | "ALL", page: 1 })}
          aria-label="Filter by action"
          className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="ALL">All Actions</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>
    </div>
  );
}
