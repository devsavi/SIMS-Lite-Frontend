"use client";

import * as React from "react";
import { Download, Printer, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { PageContainer } from "@/components/common/page-container";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { useAuthStore } from "@/stores/auth.store";
import { usePageTitle } from "@/hooks/use-page-title";
import {
  useReportCharts,
  useReportData,
  useReportsMetadata,
  useReportSummary,
} from "../hooks/use-reports";
import { ReportSummaryCards } from "../components/report-summary/ReportSummaryCards";
import { ReportCharts } from "../components/charts/ReportCharts";
import { ReportFilters } from "../components/report-filters/ReportFilters";
import { ReportTable } from "../components/report-table/ReportTable";
import { ExportDialog } from "../components/export-dialog/ExportDialog";
import { PrintPreviewDialog } from "../components/print-preview/PrintPreviewDialog";
import type { CommonReportFilterParams, ReportType } from "../types";
import type { UserRole } from "@/lib/auth";

interface ReportDetailPageProps {
  reportType: ReportType;
}

export function ReportDetailPage({ reportType }: ReportDetailPageProps) {
  const { role } = useAuthStore();
  const { data: metadataList } = useReportsMetadata();

  const reportMeta = React.useMemo(() => {
    return metadataList?.find((m) => m.id === reportType);
  }, [metadataList, reportType]);

  // Role authorization check
  const isAuthorized = React.useMemo(() => {
    if (!role) return false;
    if (!reportMeta) return true; // Default allow if meta loading or custom
    return reportMeta.allowedRoles.includes(role as UserRole);
  }, [role, reportMeta]);

  // Filters state
  const [filters, setFilters] = React.useState<CommonReportFilterParams>({
    page: 1,
    size: 20,
  });

  // Queries
  const {
    data: reportResponse,
    isLoading: isDataLoading,
    isError,
    refetch,
  } = useReportData(reportType, filters);

  const { data: summary, isLoading: isSummaryLoading } = useReportSummary(
    reportType,
    filters
  );

  const { data: chartsData, isLoading: isChartsLoading } = useReportCharts(reportType, filters);

  // Dialog states
  const [isExportOpen, setIsExportOpen] = React.useState(false);
  const [isPrintOpen, setIsPrintOpen] = React.useState(false);

  if (!isAuthorized) {
    return (
      <PageContainer>
        <div className="my-12 p-8 bg-destructive/10 border border-destructive/30 rounded-none text-center space-y-4 max-w-lg mx-auto">
          <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold text-destructive">Access Denied</h2>
          <p className="text-sm text-muted-foreground">
            Your user role ({role}) does not have permission to access the{" "}
            <span className="font-semibold">{reportMeta?.title || reportType}</span>.
          </p>
        </div>
      </PageContainer>
    );
  }

  const title = reportMeta?.title || `${reportType.toUpperCase()} Report`;
  const description = reportMeta?.description || "Detailed data report view and analysis.";

  usePageTitle(title);

  return (
    <PageContainer>
      <PageHeader
        title={title}
        description={description}
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "Reports", href: "/reports" },
              { label: title },
            ]}
          />
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPrintOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-input bg-background hover:bg-accent text-foreground rounded-none transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </button>

            <button
              type="button"
              onClick={() => setIsExportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-none hover:bg-primary/90 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          </div>
        }
      />

      {/* KPI Summary Header Cards */}
      <ReportSummaryCards summary={summary} loading={isSummaryLoading} />

      {/* Visual Analytics Charts */}
      <ReportCharts reportType={reportType} data={chartsData} loading={isChartsLoading} period={filters.period} />

      {/* Filter Controls */}
      <ReportFilters
        reportType={reportType}
        filters={filters}
        onFilterChange={(newFilters) => setFilters(newFilters)}
        onReset={() => setFilters({ page: 1, size: 20 })}
      />

      {/* Error state */}
      {isError && (
        <div className="my-6 p-6 bg-destructive/10 border border-destructive/30 rounded-none text-center space-y-3">
          <ShieldAlert className="h-6 w-6 text-destructive mx-auto" />
          <h4 className="text-sm font-semibold text-destructive">Failed to load report data</h4>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-none"
          >
            Retry
          </button>
        </div>
      )}

      {/* Data Table */}
      <ReportTable
        reportType={reportType}
        data={reportResponse?.data || []}
        loading={isDataLoading}
        page={reportResponse?.pagination.page}
        totalPages={reportResponse?.pagination.pages}
        onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
      />

      {/* Export Dialog Modal */}
      <ExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        reportType={reportType}
        filters={filters}
      />

      {/* Print Preview Modal */}
      <PrintPreviewDialog
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        reportTitle={title}
        reportType={reportType}
        summary={summary}
      >
        <ReportTable
          reportType={reportType}
          data={reportResponse?.data || []}
          loading={false}
        />
      </PrintPreviewDialog>
    </PageContainer>
  );
}
