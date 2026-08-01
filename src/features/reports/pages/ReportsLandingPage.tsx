"use client";

import * as React from "react";
import { BarChart2, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { PageContainer } from "@/components/common/page-container";
import { useAuthStore } from "@/stores/auth.store";
import { useReportsMetadata } from "../hooks/use-reports";
import { ReportCard } from "../components/report-cards/ReportCard";
import { ExportDialog } from "../components/export-dialog/ExportDialog";
import type { ReportMeta, ReportType } from "../types";
import type { UserRole } from "@/lib/auth";

export function ReportsLandingPage() {
  const { role } = useAuthStore();
  const { data: reports, isLoading, isError, refetch } = useReportsMetadata();

  const [exportModalReport, setExportModalReport] = React.useState<ReportMeta | null>(null);

  // Filter reports based on role permissions
  const visibleReports = React.useMemo(() => {
    if (!reports || !role) return [];
    const userRole = role as UserRole;

    return reports.filter((report) => report.allowedRoles.includes(userRole));
  }, [reports, role]);

  return (
    <PageContainer>
      <PageHeader
        title="Reports & Analytics"
        description="Comprehensive real-time reporting, data exports, print views, and analytical summaries."
      />

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-56 bg-card border border-border rounded-none p-5 animate-pulse space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-muted rounded-none" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-28 bg-muted rounded-none" />
                  <div className="h-3 w-16 bg-muted rounded-none" />
                </div>
              </div>
              <div className="h-10 w-full bg-muted rounded-none" />
              <div className="h-8 w-full bg-muted rounded-none pt-4" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="my-8 p-6 bg-destructive/10 border border-destructive/30 rounded-none text-center space-y-3">
          <ShieldAlert className="h-8 w-8 text-destructive mx-auto" />
          <h3 className="text-base font-semibold text-destructive">Failed to Load Reports Metadata</h3>
          <p className="text-xs text-muted-foreground">An error occurred while fetching the available reports catalog.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-none hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && visibleReports.length === 0 && (
        <div className="my-8 p-8 bg-card border border-border rounded-none text-center space-y-2">
          <BarChart2 className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-semibold text-foreground">No Permitted Reports Available</h3>
          <p className="text-xs text-muted-foreground">Your user role standard permission level does not grant access to report views.</p>
        </div>
      )}

      {!isLoading && !isError && visibleReports.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {visibleReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onQuickExport={(r) => setExportModalReport(r)}
            />
          ))}
        </div>
      )}

      {exportModalReport && (
        <ExportDialog
          isOpen={!!exportModalReport}
          onClose={() => setExportModalReport(null)}
          reportType={exportModalReport.id as ReportType}
        />
      )}
    </PageContainer>
  );
}
