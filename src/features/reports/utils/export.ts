import type { ReportType } from "../types";

export const MIME_TYPES: Record<string, string> = {
  excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv",
  pdf: "application/pdf",
};

export const FILE_EXTENSIONS: Record<string, string> = {
  excel: "xlsx",
  csv: "csv",
  pdf: "pdf",
};

export function generateReportFilename(reportType: ReportType, format: "excel" | "csv" | "pdf"): string {
  const dateStr = new Date().toISOString().split("T")[0];
  const ext = FILE_EXTENSIONS[format] || "csv";
  return `${reportType}-report-${dateStr}.${ext}`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
}
