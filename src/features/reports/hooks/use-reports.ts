import { useMutation, useQuery } from "@tanstack/react-query";
import { reportsApi } from "../api/reports-api";
import type {
  CommonReportFilterParams,
  ExportReportParams,
  ReportType,
} from "../types";
import { downloadBlob } from "../utils/export";

export const reportsKeys = {
  all: ["reports"] as const,
  metadata: () => [...reportsKeys.all, "metadata"] as const,
  data: (type: ReportType, filters?: CommonReportFilterParams) =>
    [...reportsKeys.all, "data", type, filters] as const,
  summary: (type: ReportType, filters?: CommonReportFilterParams) =>
    [...reportsKeys.all, "summary", type, filters] as const,
  charts: (type: ReportType) =>
    [...reportsKeys.all, "charts", type] as const,
};

export function useReportsMetadata() {
  return useQuery({
    queryKey: reportsKeys.metadata(),
    queryFn: () => reportsApi.getReportsMetadata(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useReportData<T>(
  reportType: ReportType,
  filters?: CommonReportFilterParams
) {
  return useQuery({
    queryKey: reportsKeys.data(reportType, filters),
    queryFn: () => reportsApi.getReportData<T>(reportType, filters),
    staleTime: 60 * 1000,
  });
}

export function useReportSummary(
  reportType: ReportType,
  filters?: CommonReportFilterParams
) {
  return useQuery({
    queryKey: reportsKeys.summary(reportType, filters),
    queryFn: () => reportsApi.getReportSummary(reportType, filters),
    staleTime: 60 * 1000,
  });
}

export function useReportCharts(reportType: ReportType) {
  return useQuery({
    queryKey: reportsKeys.charts(reportType),
    queryFn: () => reportsApi.getReportCharts(reportType),
    staleTime: 5 * 60 * 1000,
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: async (params: ExportReportParams) => {
      const result = await reportsApi.exportReport(params);
      downloadBlob(result.blob, result.filename);
      return result;
    },
  });
}
