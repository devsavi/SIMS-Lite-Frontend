"use client";

import React from "react";
import { X, Activity } from "lucide-react";
import type { ActivityLogEntry } from "../types";
import { formatDateTime } from "../../users/utils/user-helpers";

interface ActivityDetailsModalProps {
  entry: ActivityLogEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ActivityDetailsModal({ entry, isOpen, onClose }: ActivityDetailsModalProps) {
  if (!isOpen || !entry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-none border border-border bg-card shadow-lg text-foreground animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <Activity className="h-5 w-5 text-primary" />
            Activity Log Details — {entry.id}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-none p-1 text-muted-foreground hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs font-mono">
          <div className="grid grid-cols-2 gap-2 text-sm font-sans border-b border-border pb-3">
            <div>
              <span className="text-xs text-muted-foreground block">User</span>
              <span className="font-semibold">{entry.userName} ({entry.userEmail})</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Timestamp</span>
              <span>{formatDateTime(entry.timestamp)}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Module</span>
              <span className="font-mono">{entry.module}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">IP Address</span>
              <span>{entry.ipAddress || "N/A"}</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-sans text-muted-foreground block mb-1">Payload & Context Details</span>
            <pre className="rounded-none bg-muted p-3 overflow-x-auto text-[11px] text-foreground border border-border leading-relaxed">
              {JSON.stringify(entry.details || { action: entry.action }, null, 2)}
            </pre>
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-border px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-none bg-secondary px-4 py-1.5 text-xs font-medium hover:bg-secondary/80"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
