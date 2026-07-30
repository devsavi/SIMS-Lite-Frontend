"use client";

import * as React from "react";
import {
  Shield,
  User,
  Archive,
  Activity,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  Info,
  Loader2,
} from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import type { AuditLogEntry } from "../types";

interface AuditLogTableProps {
  logs: AuditLogEntry[];
  isLoading: boolean;
  onViewDetails: (entry: AuditLogEntry) => void;
}

/** Convert action strings like "auth.token_refresh" → readable label */
function formatAction(action: string): string {
  const map: Record<string, string> = {
    "auth.login": "Login",
    "auth.logout": "Logout",
    "auth.token_refresh": "Token Refresh",
    "auth.change_password": "Password Changed",
    "auth.admin_password_reset": "Admin Password Reset",
    "user.profile_update": "Profile Updated",
    "user.activate": "User Activated",
    "user.deactivate": "User Deactivated",
    "user.roles_assign": "Roles Assigned",
    "user.admin_password_reset": "Password Reset",
    "inventory.stock_release": "Stock Release",
    "inventory.stock_request": "Stock Request",
  };
  return (
    map[action] ??
    action
      .replace(/[._]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

/** Derive icon from action prefix */
function getActionIcon(action: string) {
  const prefix = action.split(".")[0];
  switch (prefix) {
    case "auth":
      return <Shield className="h-3.5 w-3.5 text-blue-500" />;
    case "user":
      return <User className="h-3.5 w-3.5 text-purple-500" />;
    case "inventory":
      return <Archive className="h-3.5 w-3.5 text-emerald-500" />;
    default:
      return <Activity className="h-3.5 w-3.5 text-amber-500" />;
  }
}

/** Badge color per action prefix */
function getCategoryBadge(action: string): string {
  const prefix = action.split(".")[0];
  const styles: Record<string, string> = {
    auth: "border-blue-500/40 text-blue-400 bg-blue-500/10",
    user: "border-purple-500/40 text-purple-400 bg-purple-500/10",
    inventory: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
  };
  return styles[prefix] ?? "border-amber-500/40 text-amber-400 bg-amber-500/10";
}

/** Human-friendly detail lines */
function DetailLines({ detail }: { detail: Record<string, any> | null }) {
  if (!detail) return null;
  const entries = Object.entries(detail).filter(([, v]) => v !== "");
  if (entries.length === 0) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
      {entries.map(([k, v]) => (
        <span key={k} className="text-[11px] text-muted-foreground font-mono">
          <span className="text-foreground/50">{k}:</span>{" "}
          <span className="text-foreground/80">
            {typeof v === "object" ? JSON.stringify(v) : String(v)}
          </span>
        </span>
      ))}
    </div>
  );
}

export function AuditLogTable({ logs, isLoading, onViewDetails }: AuditLogTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-xs text-muted-foreground gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading activity logs…
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-xs text-muted-foreground gap-2">
        <Info className="h-5 w-5" />
        No activity logs found for the selected filters.
      </div>
    );
  }

  return (
    <div className="divide-y divide-border border border-border rounded-none bg-card">
      {logs.map((log) => {
        const actorName = log.actor?.full_name ?? log.actor_id ?? "Unknown";
        const actorEmail = log.actor?.email ?? "";

        return (
          <div
            key={log.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 gap-3 hover:bg-muted/20 transition-colors"
          >
            {/* Left: icon + action info */}
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="flex h-8 w-8 items-center justify-center bg-muted border border-border shrink-0 mt-0.5 sm:mt-0">
                {getActionIcon(log.action)}
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                {/* Action row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-foreground">
                    {formatAction(log.action)}
                  </span>
                  <Badge
                    variant="outline"
                    className={`rounded-none text-[10px] px-1.5 py-0 border ${getCategoryBadge(log.action)}`}
                  >
                    {log.action.split(".")[0]}
                  </Badge>
                  {/* Status */}
                  {log.status === "success" ? (
                    <span className="flex items-center gap-0.5 text-[10px] text-emerald-500">
                      <CheckCircle2 className="h-3 w-3" />
                      success
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-[10px] text-red-500">
                      <XCircle className="h-3 w-3" />
                      failure
                    </span>
                  )}
                </div>

                {/* Actor */}
                <div className="text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground/70">{actorName}</span>
                  {actorEmail && (
                    <span className="ml-1 font-mono">&lt;{actorEmail}&gt;</span>
                  )}
                </div>

                {/* Detail payload lines */}
                <DetailLines detail={log.detail} />
              </div>
            </div>

            {/* Right: IP + timestamp + view button */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0 self-end sm:self-center">
              <span className="font-mono text-[11px]">{log.ip_address}</span>
              <span className="flex items-center gap-1 text-foreground/80">
                <Clock className="h-3 w-3 text-muted-foreground" />
                {new Date(log.created_at).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              {/* View detail button — enabled for all logs */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(log)}
                title="View log details"
                aria-label={`View details for ${log.action}`}
                className="rounded-none h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
