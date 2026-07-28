"use client";

import React from "react";
import { Eye } from "lucide-react";
import type { ActivityLogEntry } from "../types";
import { formatDateTime } from "../../users/utils/user-helpers";
import { cn } from "@/utils/cn";

interface ActivityLogTableProps {
  logs: ActivityLogEntry[];
  isLoading: boolean;
  onViewDetails: (entry: ActivityLogEntry) => void;
}

export function ActivityLogTable({ logs, isLoading, onViewDetails }: ActivityLogTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200";
      case "FAILED":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200";
      case "WARNING":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200";
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
            <th scope="col" className="px-4 py-3">User</th>
            <th scope="col" className="px-4 py-3">Action Performed</th>
            <th scope="col" className="px-4 py-3">Module</th>
            <th scope="col" className="px-4 py-3">Status</th>
            <th scope="col" className="px-4 py-3 text-right">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                <td className="px-4 py-3"><div className="h-4 w-28 rounded-none bg-muted"></div></td>
                <td className="px-4 py-3"><div className="h-4 w-32 rounded-none bg-muted"></div></td>
                <td className="px-4 py-3"><div className="h-4 w-48 rounded-none bg-muted"></div></td>
                <td className="px-4 py-3"><div className="h-4 w-16 rounded-none bg-muted"></div></td>
                <td className="px-4 py-3"><div className="h-5 w-16 rounded-none bg-muted"></div></td>
                <td className="px-4 py-3 text-right"><div className="ml-auto h-6 w-8 rounded-none bg-muted"></div></td>
              </tr>
            ))
          ) : logs.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                No activity logs match the selected filter criteria.
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatDateTime(log.timestamp)}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{log.userName}</div>
                  <div className="text-xs text-muted-foreground">{log.userEmail}</div>
                </td>
                <td className="px-4 py-3 font-medium text-foreground">
                  {log.action}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-none bg-muted px-2 py-0.5 font-mono text-xs font-semibold">
                    {log.module}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex items-center rounded-none border px-2.5 py-0.5 text-xs font-semibold", getStatusBadge(log.status))}>
                    {log.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onViewDetails(log)}
                    title="View Raw Details"
                    aria-label={`View details for action ${log.action}`}
                    className="rounded-none p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <Eye className="h-4 w-4" />
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
