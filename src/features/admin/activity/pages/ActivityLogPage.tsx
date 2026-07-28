"use client";

import React from "react";
import { Activity } from "lucide-react";
import { PermissionGuard } from "../../shared/components/PermissionGuard";
import { AdminNavTabs } from "../../shared/components/AdminNavTabs";
import { ActivityLogFilters } from "../components/ActivityLogFilters";
import { ActivityLogTable } from "../components/ActivityLogTable";
import { ActivityDetailsModal } from "../components/ActivityDetailsModal";
import { useActivityLogs } from "../hooks/use-activity-log";
import type { ActivityFilterParams, ActivityLogEntry } from "../types";

export function ActivityLogPage() {
  const [filters, setFilters] = React.useState<ActivityFilterParams>({
    search: "",
    module: "ALL",
    status: "ALL",
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useActivityLogs(filters);

  const [selectedEntry, setSelectedEntry] = React.useState<ActivityLogEntry | null>(null);

  return (
    <PermissionGuard requiredPermission="settings.view">
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <Activity className="h-6 w-6 text-primary" />
            System Activity Log
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor real-time system events, administrative operations, authentication attempts, and user transactions.
          </p>
        </div>

        {/* Subnav Tabs */}
        <AdminNavTabs />

        {/* Filters */}
        <ActivityLogFilters filters={filters} onFilterChange={setFilters} />

        {/* Table */}
        <ActivityLogTable
          logs={data?.data || []}
          isLoading={isLoading}
          onViewDetails={(entry) => setSelectedEntry(entry)}
        />

        {/* Pagination */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
          <div>
            Showing {data?.data?.length ? (filters.page! - 1) * (filters.limit || 10) + 1 : 0} to{" "}
            {Math.min((filters.page! || 1) * (filters.limit || 10), data?.total || 0)} of {data?.total || 0} log records
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={filters.page! <= 1}
              onClick={() => setFilters({ ...filters, page: filters.page! - 1 })}
              className="rounded border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {data?.page || 1} of {data?.totalPages || 1}
            </span>
            <button
              type="button"
              disabled={(data?.page || 1) >= (data?.totalPages || 1)}
              onClick={() => setFilters({ ...filters, page: filters.page! + 1 })}
              className="rounded border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {/* Modal */}
        <ActivityDetailsModal
          entry={selectedEntry}
          isOpen={!!selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      </div>
    </PermissionGuard>
  );
}
