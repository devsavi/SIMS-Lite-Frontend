"use client";

import React from "react";
import { FileCheck } from "lucide-react";
import { PermissionGuard } from "../../shared/components/PermissionGuard";
import { AdminNavTabs } from "../../shared/components/AdminNavTabs";
import { AuditTrailFilters } from "../components/AuditTrailFilters";
import { AuditTrailTable } from "../components/AuditTrailTable";
import { AuditDiffModal } from "../components/AuditDiffModal";
import { useAuditTrail } from "../hooks/use-audit-trail";
import type { AuditFilterParams, AuditRecord } from "../types";

export function AuditTrailPage() {
  const [filters, setFilters] = React.useState<AuditFilterParams>({
    search: "",
    entity: "ALL",
    action: "ALL",
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useAuditTrail(filters);

  const [selectedRecord, setSelectedRecord] = React.useState<AuditRecord | null>(null);

  return (
    <PermissionGuard requiredPermission="settings.view">
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <FileCheck className="h-6 w-6 text-primary" />
            System Audit Trail
          </h1>
          <p className="text-sm text-muted-foreground">
            Immutable security and data change audit logs. Inspect precise before & after diffs for any entity modification.
          </p>
        </div>

        {/* Subnav Tabs */}
        <AdminNavTabs />

        {/* Filters */}
        <AuditTrailFilters filters={filters} onFilterChange={setFilters} />

        {/* Table */}
        <AuditTrailTable
          records={data?.data || []}
          isLoading={isLoading}
          onViewDiff={(rec) => setSelectedRecord(rec)}
        />

        {/* Pagination */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
          <div>
            Showing {data?.data?.length ? (filters.page! - 1) * (filters.limit || 10) + 1 : 0} to{" "}
            {Math.min((filters.page! || 1) * (filters.limit || 10), data?.total || 0)} of {data?.total || 0} audit records
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={filters.page! <= 1}
              onClick={() => setFilters({ ...filters, page: filters.page! - 1 })}
              className="rounded-none border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent disabled:opacity-50"
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
              className="rounded-none border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {/* Modal */}
        <AuditDiffModal
          record={selectedRecord}
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      </div>
    </PermissionGuard>
  );
}
