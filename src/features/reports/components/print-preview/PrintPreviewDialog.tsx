"use client";

import * as React from "react";
import { Printer, X } from "lucide-react";
import type { ReportKpiSummary, ReportType } from "../../types";
import { triggerPrint } from "../../utils/print";

interface PrintPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
  reportType: ReportType;
  summary?: ReportKpiSummary;
  children: React.ReactNode;
}

export function PrintPreviewDialog({
  isOpen,
  onClose,
  reportTitle,
  summary,
  children,
}: PrintPreviewDialogProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    triggerPrint();
  };

  const currentDate = new Date().toLocaleString();

  return (
    <div
      aria-modal="true"
      role="dialog"
      aria-labelledby="print-preview-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto"
    >
      <div className="bg-card text-card-foreground border border-border rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-border print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-primary" />
            <h3 id="print-preview-title" className="font-semibold text-lg">
              Print Preview - {reportTitle}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 printable-area bg-white text-black dark:bg-card dark:text-card-foreground">
          {/* Printable Header */}
          <div className="border-b border-gray-200 pb-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-foreground">
                  SIMS Lite Inventory Management
                </h1>
                <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">
                  Official Data Report — {reportTitle}
                </p>
              </div>
              <div className="text-right text-xs text-gray-500 dark:text-muted-foreground">
                <p><span className="font-semibold">Generated:</span> {currentDate}</p>
                <p><span className="font-semibold">System:</span> SIMS Lite Frontend v1.0</p>
              </div>
            </div>
          </div>

          {/* Printable Summary block */}
          {summary && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-muted/30 border border-gray-200 dark:border-border rounded-md text-xs">
              <div>
                <span className="text-gray-500 uppercase text-[10px] block font-bold">Total Records</span>
                <span className="text-sm font-bold text-gray-900 dark:text-foreground">{summary.totalRecords}</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase text-[10px] block font-bold">{summary.primaryMetricLabel}</span>
                <span className="text-sm font-bold text-gray-900 dark:text-foreground">{summary.primaryMetricValue}</span>
              </div>
              {summary.secondaryMetricLabel && (
                <div>
                  <span className="text-gray-500 uppercase text-[10px] block font-bold">{summary.secondaryMetricLabel}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-foreground">{summary.secondaryMetricValue}</span>
                </div>
              )}
            </div>
          )}

          {/* Report Data Table */}
          <div className="overflow-x-auto">
            {children}
          </div>

          {/* Printable Footer */}
          <div className="pt-4 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
            <p>Confidential & Internal Business Record — SIMS Lite</p>
            <p>Page 1 of 1</p>
          </div>
        </div>
      </div>
    </div>
  );
}
