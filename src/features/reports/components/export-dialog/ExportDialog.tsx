"use client";

import * as React from "react";
import { Download, FileSpreadsheet, FileText, Loader2, X } from "lucide-react";
import { useExportReport } from "../../hooks/use-reports";
import type { CommonReportFilterParams, ReportType } from "../../types";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: ReportType;
  filters?: CommonReportFilterParams;
}

export function ExportDialog({
  isOpen,
  onClose,
  reportType,
  filters,
}: ExportDialogProps) {
  const [format, setFormat] = React.useState<"excel" | "csv" | "pdf">("excel");
  const [includeSummary, setIncludeSummary] = React.useState<boolean>(true);

  const exportMutation = useExportReport();

  if (!isOpen) return null;

  const handleExport = () => {
    exportMutation.mutate(
      {
        reportType,
        format,
        filters,
        includeSummary,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div
      aria-modal="true"
      role="dialog"
      aria-labelledby="export-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150"
    >
      <div className="bg-card text-card-foreground border border-border rounded-none shadow-xl w-full max-w-md p-6 relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground rounded-none p-1 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-none bg-primary/10 text-primary">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <h3 id="export-dialog-title" className="text-lg font-semibold text-foreground">
              Export Report
            </h3>
            <p className="text-xs text-muted-foreground capitalize">
              {reportType.replace("-", " ")} Report
            </p>
          </div>
        </div>

        <div className="space-y-4 my-5">
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground block mb-2">
              Select Export Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormat("excel")}
                className={`flex flex-col items-center justify-center p-3 rounded-none border text-xs font-medium transition-all ${
                  format === "excel"
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-input bg-background hover:bg-accent text-foreground"
                }`}
              >
                <FileSpreadsheet className="h-5 w-5 mb-1 text-green-600" />
                Excel (.xlsx)
              </button>

              <button
                type="button"
                onClick={() => setFormat("csv")}
                className={`flex flex-col items-center justify-center p-3 rounded-none border text-xs font-medium transition-all ${
                  format === "csv"
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-input bg-background hover:bg-accent text-foreground"
                }`}
              >
                <FileText className="h-5 w-5 mb-1 text-blue-600" />
                CSV (.csv)
              </button>

              <button
                type="button"
                onClick={() => setFormat("pdf")}
                className={`flex flex-col items-center justify-center p-3 rounded-none border text-xs font-medium transition-all ${
                  format === "pdf"
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-input bg-background hover:bg-accent text-foreground"
                }`}
              >
                <FileText className="h-5 w-5 mb-1 text-red-600" />
                PDF (.pdf)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="include-summary"
              checked={includeSummary}
              onChange={(e) => setIncludeSummary(e.target.checked)}
              className="h-4 w-4 rounded-none border-input text-primary focus:ring-ring"
            />
            <label htmlFor="include-summary" className="text-sm text-foreground">
              Include KPI Summary Header & Filter Info
            </label>
          </div>
        </div>

        {exportMutation.isError && (
          <p className="text-xs text-destructive mb-3">
            Failed to export report. Please try again.
          </p>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={exportMutation.isPending}
            className="px-4 py-2 text-xs font-medium border border-input rounded-none hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-none hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {exportMutation.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                Download Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
