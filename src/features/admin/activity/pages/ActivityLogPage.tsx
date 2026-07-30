"use client";

import * as React from "react";
import { Activity, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { PermissionGuard } from "../../shared/components/PermissionGuard";
import { AdminNavTabs } from "../../shared/components/AdminNavTabs";
import { AuditLogFilters } from "../components/ActivityLogFilters";
import { AuditLogTable } from "../components/ActivityLogTable";
import { AuditLogDetailsModal } from "../components/ActivityDetailsModal";
import { useAdminAuditLogs } from "../hooks/use-activity-log";
import type { AuditLogFilterParams, AuditLogEntry } from "../types";

const DEFAULT_FILTERS: AuditLogFilterParams = {
  period: "today",
  action: "all",
  resource_type: "all",
  page: 1,
  size: 20,
};

export function ActivityLogPage() {
  const [filters, setFilters] = React.useState<AuditLogFilterParams>(DEFAULT_FILTERS);
  const [selectedEntry, setSelectedEntry] = React.useState<AuditLogEntry | null>(null);

  const { data, isLoading, isFetching, refetch } = useAdminAuditLogs(filters);

  const pagination = data?.pagination ?? {
    page: 1,
    size: filters.size,
    total: 0,
    pages: 1,
  };
  const logs = data?.data ?? [];

  const setPage = (p: number) => setFilters((f) => ({ ...f, page: p }));

  return (
    <PermissionGuard requiredPermission="settings.view">
      <div className="space-y-5 p-6">
        {/* Page Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
              <Activity className="h-6 w-6 text-primary" />
              Activity Log
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor all system events, authentication attempts, user actions, and resource changes across the platform.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-none h-8 w-8 p-0 text-muted-foreground hover:text-foreground shrink-0 mt-1"
            onClick={() => refetch()}
            title="Refresh logs"
          >
            <RefreshCw className={["h-4 w-4", isFetching ? "animate-spin" : ""].join(" ")} />
          </Button>
        </div>

        {/* Subnav Tabs */}
        <AdminNavTabs />

        {/* Filters */}
        <AuditLogFilters
          filters={filters}
          onFilterChange={setFilters}
          onRefresh={() => refetch()}
        />

        {/* Table / Feed */}
        <AuditLogTable
          logs={logs}
          isLoading={isLoading || isFetching}
          onViewDetails={(entry) => setSelectedEntry(entry)}
        />

        {/* ── Pagination (profile-style) ── */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-1 py-2 border-t border-border text-xs text-muted-foreground">
            <span>
              Showing {(pagination.page - 1) * pagination.size + 1}–
              {Math.min(pagination.page * pagination.size, pagination.total)} of{" "}
              <strong className="text-foreground">{pagination.total}</strong> entries
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="rounded-none h-7 w-7 p-0"
                onClick={() => setPage(Math.max(1, pagination.page - 1))}
                disabled={pagination.page <= 1}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>

              {/* Page number buttons with ellipsis */}
              {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === pagination.pages ||
                    Math.abs(p - pagination.page) <= 1
                )
                .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === "…" ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground">
                      …
                    </span>
                  ) : (
                    <Button
                      key={p}
                      variant={pagination.page === p ? "default" : "outline"}
                      size="sm"
                      className="rounded-none h-7 w-7 p-0 text-xs"
                      onClick={() => setPage(p as number)}
                    >
                      {p}
                    </Button>
                  )
                )}

              <Button
                variant="outline"
                size="sm"
                className="rounded-none h-7 w-7 p-0"
                onClick={() => setPage(Math.min(pagination.pages, pagination.page + 1))}
                disabled={pagination.page >= pagination.pages}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Details Modal */}
        <AuditLogDetailsModal
          entry={selectedEntry}
          isOpen={!!selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      </div>
    </PermissionGuard>
  );
}
