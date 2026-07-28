"use client";

import React from "react";
import { Eye, FileCode } from "lucide-react";
import type { AuditRecord, AuditAction } from "../types";
import { formatDateTime } from "../../users/utils/user-helpers";
import { cn } from "@/utils/cn";

interface AuditTrailTableProps {
  records: AuditRecord[];
  isLoading: boolean;
  onViewDiff: (record: AuditRecord) => void;
}

export function AuditTrailTable({ records, isLoading, onViewDiff }: AuditTrailTableProps) {
  const getActionBadgeClass = (action: AuditAction) => {
    switch (action) {
      case "CREATE":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200";
      case "UPDATE":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200";
      case "DELETE":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="overflow-x-auto rounded-none border border-border bg-card shadow-sm">
      <table className="w-full text-left text-sm text-foreground">
        <thead className="bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
          <tr>
            <th scope="col" className="px-4 py-3">Timestamp</th>
            <th scope="col" className="px-4 py-3">Entity & ID</th>
            <th scope="col" className="px-4 py-3">Action</th>
            <th scope="col" className="px-4 py-3">Changed Fields</th>
            <th scope="col" className="px-4 py-3">Performed By</th>
            <th scope="col" className="px-4 py-3 text-right">Compare Diff</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                <td className="px-4 py-3"><div className="h-4 w-28 rounded-none bg-muted"></div></td>
                <td className="px-4 py-3"><div className="h-4 w-32 rounded-none bg-muted"></div></td>
                <td className="px-4 py-3"><div className="h-5 w-16 rounded-none bg-muted"></div></td>
                <td className="px-4 py-3"><div className="h-4 w-40 rounded-none bg-muted"></div></td>
                <td className="px-4 py-3"><div className="h-4 w-32 rounded-none bg-muted"></div></td>
                <td className="px-4 py-3 text-right"><div className="ml-auto h-6 w-8 rounded-none bg-muted"></div></td>
              </tr>
            ))
          ) : records.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                No immutable audit records found for the filter query.
              </td>
            </tr>
          ) : (
            records.map((rec) => (
              <tr key={rec.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatDateTime(rec.timestamp)}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{rec.entity}</div>
                  <div className="text-xs font-mono text-muted-foreground">ID: {rec.entityId}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex items-center rounded-none border px-2.5 py-0.5 text-xs font-semibold", getActionBadgeClass(rec.action))}>
                    {rec.action}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {rec.changedFields.map((field) => (
                      <span key={field} className="rounded-none bg-muted px-1.5 py-0.5 text-[11px] font-mono text-foreground border border-border">
                        {field}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{rec.userName}</div>
                  <div className="text-xs text-muted-foreground">{rec.userEmail}</div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onViewDiff(rec)}
                    title="View Field Diffs"
                    aria-label={`View audit diff for ${rec.entity} ${rec.entityId}`}
                    className="inline-flex items-center gap-1.5 rounded-none border border-input bg-background px-2.5 py-1 text-xs font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <FileCode className="h-3.5 w-3.5 text-primary" />
                    Inspect Diff
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
