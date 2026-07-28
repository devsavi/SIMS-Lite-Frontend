"use client";

import React from "react";
import { X, FileCheck, ArrowRight } from "lucide-react";
import type { AuditRecord } from "../types";
import { formatDateTime } from "../../users/utils/user-helpers";

interface AuditDiffModalProps {
  record: AuditRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AuditDiffModal({ record, isOpen, onClose }: AuditDiffModalProps) {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg border border-border bg-card shadow-lg text-foreground animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <FileCheck className="h-5 w-5 text-primary" />
            Audit History Diff — {record.entity} ({record.entityId})
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded p-1 text-muted-foreground hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Metadata Header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-lg border border-border bg-muted/30 p-3 text-xs">
            <div>
              <span className="text-muted-foreground block">Action Type</span>
              <span className="font-semibold text-foreground">{record.action}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Performed By</span>
              <span className="font-semibold text-foreground">{record.userName}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Timestamp</span>
              <span className="font-medium">{formatDateTime(record.timestamp)}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Record ID</span>
              <span className="font-mono">{record.id}</span>
            </div>
          </div>

          {/* Diffs Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Field Mutations ({record.diffs.length} changed)
            </h4>

            <div className="space-y-3">
              {record.diffs.map((diff) => (
                <div key={diff.field} className="rounded-md border border-border bg-card p-3 text-xs space-y-2">
                  <div className="font-mono font-bold text-primary">{diff.field}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Previous Value */}
                    <div className="rounded bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-2.5">
                      <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block mb-1">
                        Previous Value
                      </span>
                      <pre className="font-mono whitespace-pre-wrap text-foreground">
                        {diff.previousValue === null || diff.previousValue === undefined
                          ? "<Null / Empty>"
                          : typeof diff.previousValue === "object"
                          ? JSON.stringify(diff.previousValue, null, 2)
                          : String(diff.previousValue)}
                      </pre>
                    </div>

                    {/* New Value */}
                    <div className="rounded bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 p-2.5">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                        New Value
                      </span>
                      <pre className="font-mono whitespace-pre-wrap text-foreground">
                        {diff.newValue === null || diff.newValue === undefined
                          ? "<Null / Empty>"
                          : typeof diff.newValue === "object"
                          ? JSON.stringify(diff.newValue, null, 2)
                          : String(diff.newValue)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-border px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-secondary px-4 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/80"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
