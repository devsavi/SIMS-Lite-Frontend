"use client";

import * as React from "react";
import { Badge } from "@/app/components/ui/badge";
import type { GRNStatus } from "../types";

export interface GRNStatusBadgeProps {
  status: GRNStatus;
}

export function GRNStatusBadge({ status }: GRNStatusBadgeProps) {
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
          Approved & Stock Updated
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}
