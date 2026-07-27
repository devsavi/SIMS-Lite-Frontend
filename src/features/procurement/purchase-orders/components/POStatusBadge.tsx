"use client";

import * as React from "react";
import { Badge } from "@/app/components/ui/badge";
import type { POStatus, POEmailStatus } from "../types";

export interface POStatusBadgeProps {
  status: POStatus;
}

export function POStatusBadge({ status }: POStatusBadgeProps) {
  switch (status) {
    case "DRAFT":
      return (
        <Badge variant="outline" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          Draft
        </Badge>
      );
    case "SUBMITTED":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300">
          Submitted
        </Badge>
      );
    case "APPROVED":
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
          Approved
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300">
          Rejected
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300">
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export interface POEmailStatusBadgeProps {
  status?: POEmailStatus;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function POEmailStatusBadge({
  status,
  onRetry,
  isRetrying,
}: POEmailStatusBadgeProps) {
  if (!status) return null;

  switch (status) {
    case "SENT":
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          Email Sent
        </Badge>
      );
    case "PENDING":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          Email Pending
        </Badge>
      );
    case "FAILED":
      return (
        <div className="inline-flex items-center gap-1.5">
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
            Email Failed
          </Badge>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={isRetrying}
              className="text-xs text-blue-600 hover:underline disabled:opacity-50"
            >
              {isRetrying ? "Retrying..." : "Retry"}
            </button>
          )}
        </div>
      );
    default:
      return null;
  }
}
