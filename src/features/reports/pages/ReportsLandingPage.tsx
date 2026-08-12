"use client";

import * as React from "react";
import { BarChart2, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { PageContainer } from "@/components/common/page-container";
import { useAuthStore } from "@/stores/auth.store";
import { useReportsMetadata, useAnalyticsOverview, useExportReport } from "../hooks/use-reports";
import { ReportsFilterBar } from "../components/dashboard/ReportsFilterBar";
import { ReportsKpiCards } from "../components/dashboard/ReportsKpiCards";
import { ReportsAnalyticsVisuals } from "../components/dashboard/ReportsAnalyticsVisuals";
import { ReportsCategoryHub } from "../components/dashboard/ReportsCategoryHub";
import { ExportDialog } from "../components/export-dialog/ExportDialog";
import type { ReportMeta, ReportPeriod, ReportType } from "../types";
import type { UserRole } from "@/lib/auth";

export function ReportsLandingPage() {
  const { role } = useAuthStore();
  const { data: reports, isLoading: isMetaLoading, isError: isMetaError, refetch: refetchMeta } = useReportsMetadata();

  // Date Filter State - DEFAULT IS TODAY ("day")
  const [period, setPeriod] = React.useState<ReportPeriod>("day");
  const [startDate, setStartDate] = React.useState<string>("");
  const [endDate, setEndDate] = React.useState<string>("");

  const filterParams = React.useMemo(
    () => ({
      period,
      startDate: period === "custom" ? startDate : undefined,
      endDate: period === "custom" ? endDate : undefined,
    }),
    [period, startDate, endDate]
  );

  const {
    data: analytics,
    isLoading: isAnalyticsLoading,
    refetch: refetchAnalytics,
  } = useAnalyticsOverview(filterParams);

  const exportMutation = useExportReport();

  const [exportModalReport, setExportModalReport] = React.useState<ReportMeta | null>(null);

  // Filter reports based on role permissions
  const visibleReports = React.useMemo(() => {
    if (!reports || !role) return [];
    const userRole = role as UserRole;
    return reports.filter((report) => report.allowedRoles.includes(userRole));
  }, [reports, role]);

  const handleRefreshAll = () => {
    refetchMeta();
    refetchAnalytics();
  };

  const handleQuickExport = (report: ReportMeta, format: "excel" | "pdf") => {
    exportMutation.mutate({
      reportType: report.id as ReportType,
      format,
      filters: filterParams,
    });
  };

  const handleExportGlobal = (format: "excel" | "pdf") => {
    exportMutation.mutate({
      reportType: "inventory",
      format,
      filters: filterParams,
    });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Reports & Visual Analytics Command Center"
        description="Real-time reporting hub featuring period analytics, comparative growth/fall metrics, multi-format exports, and interactive visual charts."
      />

      {/* Global Period & Date Filter Control Bar */}
      <div className="mt-4">
        <ReportsFilterBar
          period={period}
          onPeriodChange={setPeriod}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onRefresh={handleRefreshAll}
          onExportAll={handleExportGlobal}
          isExporting={exportMutation.isPending}
        />
      </div>

      {/* Executive KPI Cards with Growth / Fall Badges */}
      <div className="mt-6">
        <ReportsKpiCards analytics={analytics} isLoading={isAnalyticsLoading} />
      </div>

      {/* Interactive Visual Analytics Charts (Inflow/Outflow area, Category Donut, Top Suppliers) */}
      <div className="mt-6">
        <ReportsAnalyticsVisuals analytics={analytics} isLoading={isAnalyticsLoading} period={period} />
      </div>

      {/* Error state */}
      {isMetaError && (
        <div className="my-8 p-6 bg-destructive/10 border border-destructive/30 rounded-none text-center space-y-3">
          <ShieldAlert className="h-8 w-8 text-destructive mx-auto" />
          <h3 className="text-base font-semibold text-destructive">Failed to Load Reports System</h3>
          <p className="text-xs text-muted-foreground">
            An error occurred while communicating with the backend analytics service.
          </p>
          <button
            type="button"
            onClick={handleRefreshAll}
            className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-none hover:bg-primary/90"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Access Restriction */}
      {!isMetaLoading && !isMetaError && visibleReports.length === 0 && (
        <div className="my-8 p-8 bg-card border border-border rounded-none text-center space-y-2">
          <BarChart2 className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-semibold text-foreground">No Permitted Reports Available</h3>
          <p className="text-xs text-muted-foreground">
            Your user role standard permission level does not grant access to report views.
          </p>
        </div>
      )}

      {/* Structured Reports Modules Hub (8 Categorized Report Cards with 1-Click Excel/PDF) */}
      {!isMetaLoading && !isMetaError && visibleReports.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-base font-bold text-foreground tracking-tight">
            Report Modules & Data Export Hub (8 Core Types)
          </h2>
          <ReportsCategoryHub
            reports={visibleReports}
            onQuickExport={handleQuickExport}
          />
        </div>
      )}

      {/* Modal Dialog for custom column selection exports */}
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
