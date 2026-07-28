"use client";

import React from "react";
import { Search } from "lucide-react";
import type { ActivityFilterParams, ActivityStatus } from "../types";

interface ActivityLogFiltersProps {
  filters: ActivityFilterParams;
  onFilterChange: (newFilters: ActivityFilterParams) => void;
}

export function ActivityLogFilters({ filters, onFilterChange }: ActivityLogFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search logs by action, user name or email..."
          value={filters.search || ""}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value, page: 1 })}
          className="w-full rounded-none border border-input bg-background pl-9 pr-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={filters.module || "ALL"}
          onChange={(e) => onFilterChange({ ...filters, module: e.target.value, page: 1 })}
          aria-label="Filter by module"
          className="rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="ALL">All Modules</option>
          <option value="AUTH">Authentication</option>
          <option value="USERS">Users</option>
          <option value="SETTINGS">Settings</option>
          <option value="EMAIL">Email</option>
          <option value="PROCUREMENT">Procurement</option>
          <option value="INVENTORY">Inventory</option>
        </select>

        <select
          value={filters.status || "ALL"}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value as ActivityStatus | "ALL", page: 1 })}
          aria-label="Filter by status"
          className="rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="ALL">All Statuses</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
          <option value="WARNING">Warning</option>
        </select>
      </div>
    </div>
  );
}
