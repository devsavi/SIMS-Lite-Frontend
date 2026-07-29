"use client";

import * as React from "react";
import {
  Activity,
  Shield,
  User,
  Archive,
  Filter,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle2,
  XCircle,
  Info,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { useActivityLogs } from "../hooks/use-profile";
import type {
  ActivityPeriod,
  ActivityAction,
  ActivityStatus,
  ActivityLogFilters,
  UserActivityLog,
} from "../types";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Convert action strings like "auth.token_refresh" → readable label */
function formatAction(action: string): string {
  const map: Record<string, string> = {
    "auth.login": "Login",
    "auth.logout": "Logout",
    "auth.token_refresh": "Token Refresh",
    "auth.change_password": "Password Changed",
    "user.profile_update": "Profile Updated",
    "inventory.stock_release": "Stock Release",
    "inventory.stock_request": "Stock Request",
  };
  return map[action] ?? action.replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Derive a category icon from the action prefix */
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

/** Badge variant/color for the action prefix */
function getCategoryBadge(action: string) {
  const prefix = action.split(".")[0];
  const styles: Record<string, string> = {
    auth: "border-blue-500/40 text-blue-400 bg-blue-500/10",
    user: "border-purple-500/40 text-purple-400 bg-purple-500/10",
    inventory: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
  };
  return styles[prefix] ?? "border-amber-500/40 text-amber-400 bg-amber-500/10";
}

/** Human-friendly detail lines from the detail object */
function DetailLines({ detail }: { detail: Record<string, string> | null }) {
  if (!detail) return null;
  const entries = Object.entries(detail).filter(([, v]) => v !== "");
  if (entries.length === 0) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
      {entries.map(([k, v]) => (
        <span key={k} className="text-[11px] text-muted-foreground font-mono">
          <span className="text-foreground/50">{k}:</span>{" "}
          <span className="text-foreground/80">{v}</span>
        </span>
      ))}
    </div>
  );
}

// ── Filter bar constants ──────────────────────────────────────────────────────

const PERIOD_LABELS: { value: ActivityPeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "custom", label: "Custom" },
];

const ACTION_LABELS: { value: ActivityAction; label: string }[] = [
  { value: "all", label: "All Actions" },
  { value: "auth", label: "Auth" },
  { value: "user", label: "User" },
  { value: "inventory", label: "Inventory" },
];

const STATUS_LABELS: { value: ActivityStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "success", label: "Success" },
  { value: "failure", label: "Failure" },
];

const PAGE_SIZE = 20;

// ── Component ─────────────────────────────────────────────────────────────────

export function ActivityLogTab() {
  const [period, setPeriod] = React.useState<ActivityPeriod>("today");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [action, setAction] = React.useState<ActivityAction>("all");
  const [status, setStatus] = React.useState<ActivityStatus>("all");
  const [page, setPage] = React.useState(1);

  const filters: ActivityLogFilters = React.useMemo(
    () => ({
      period,
      date_from: period === "custom" ? dateFrom || undefined : undefined,
      date_to: period === "custom" ? dateTo || undefined : undefined,
      action,
      status,
      page,
      size: PAGE_SIZE,
    }),
    [period, dateFrom, dateTo, action, status, page]
  );

  const { data, isLoading, isError, refetch } = useActivityLogs(filters);

  const activities = data?.data ?? [];
  const pagination = data?.pagination ?? { page: 1, size: PAGE_SIZE, total: 0, pages: 1 };

  // Reset to page 1 whenever filters change (except page itself)
  const prevFiltersRef = React.useRef({ period, dateFrom, dateTo, action, status });
  React.useEffect(() => {
    const prev = prevFiltersRef.current;
    if (
      prev.period !== period ||
      prev.dateFrom !== dateFrom ||
      prev.dateTo !== dateTo ||
      prev.action !== action ||
      prev.status !== status
    ) {
      setPage(1);
      prevFiltersRef.current = { period, dateFrom, dateTo, action, status };
    }
  }, [period, dateFrom, dateTo, action, status]);

  return (
    <div className="space-y-6">
      <Card className="rounded-none border border-border bg-card">
        {/* ── Header ── */}
        <CardHeader className="border-b border-border pb-4">
          <div className="flex flex-col gap-4">
            {/* Title row */}
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Account Activity &amp; Audit History
                </CardTitle>
                <CardDescription className="text-xs">
                  Audit trail of key security events, authentication, profile updates, and
                  system transactions.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-none h-7 w-7 p-0 text-muted-foreground hover:text-foreground shrink-0"
                onClick={() => refetch()}
                title="Refresh"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* ── Filter row 1: Period ── */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                <Calendar className="h-3.5 w-3.5" />
                Period:
              </span>
              {PERIOD_LABELS.map(({ value, label }) => (
                <Button
                  key={value}
                  type="button"
                  variant={period === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPeriod(value)}
                  className="rounded-none text-xs h-7 px-2.5"
                >
                  {label}
                </Button>
              ))}
            </div>

            {/* Custom date range */}
            {period === "custom" && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground shrink-0 w-[52px]">From:</span>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="rounded-none h-7 text-xs w-36 px-2"
                  max={dateTo || undefined}
                />
                <span className="text-xs text-muted-foreground shrink-0">To:</span>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="rounded-none h-7 text-xs w-36 px-2"
                  min={dateFrom || undefined}
                />
              </div>
            )}

            {/* ── Filter row 2: Action + Status ── */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Action filter */}
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <Filter className="h-3.5 w-3.5" />
                  Action:
                </span>
                {ACTION_LABELS.map(({ value, label }) => (
                  <Button
                    key={value}
                    type="button"
                    variant={action === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAction(value)}
                    className="rounded-none text-xs h-7 px-2.5"
                  >
                    {label}
                  </Button>
                ))}
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground shrink-0">Status:</span>
                {STATUS_LABELS.map(({ value, label }) => (
                  <Button
                    key={value}
                    type="button"
                    variant={status === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatus(value)}
                    className="rounded-none text-xs h-7 px-2.5"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        {/* ── Content ── */}
        <CardContent className="pt-0 px-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-xs text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading activity logs…
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-10 text-xs text-destructive gap-2">
              <XCircle className="h-5 w-5" />
              Failed to load activity logs. Please try again.
              <Button variant="outline" size="sm" className="rounded-none h-7 text-xs mt-1" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-xs text-muted-foreground gap-2">
              <Info className="h-5 w-5" />
              No activity logs found for the selected filters.
            </div>
          ) : (
            <>
              <div className="divide-y divide-border border-t border-border">
                {activities.map((log: UserActivityLog) => (
                  <div
                    key={log.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 gap-3 bg-card hover:bg-muted/20 transition-colors"
                  >
                    {/* Left: icon + action info */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-8 w-8 items-center justify-center bg-muted border border-border shrink-0 mt-0.5 sm:mt-0">
                        {getActionIcon(log.action)}
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0">
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
                          {/* Status badge */}
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
                        <DetailLines detail={log.detail} />
                      </div>
                    </div>

                    {/* Right: IP + timestamp */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0 self-end sm:self-center">
                      <span className="font-mono text-[11px]">
                        {log.ip_address}
                      </span>
                      <span className="flex items-center gap-1 text-foreground/80">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {new Date(log.created_at).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Pagination ── */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10 text-xs text-muted-foreground">
                  <span>
                    Showing {(pagination.page - 1) * pagination.size + 1}–
                    {Math.min(pagination.page * pagination.size, pagination.total)} of{" "}
                    {pagination.total} entries
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-none h-7 w-7 p-0"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={pagination.page <= 1}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    {/* Page numbers */}
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                      .filter(
                        (p) =>
                          p === 1 ||
                          p === pagination.pages ||
                          Math.abs(p - pagination.page) <= 1
                      )
                      .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                        if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, idx) =>
                        p === "…" ? (
                          <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground">
                            …
                          </span>
                        ) : (
                          <Button
                            key={p}
                            variant={pagination.page === p ? "default" : "outline"}
                            size="sm"
                            className="rounded-none h-7 w-7 p-0 text-xs"
                            onClick={() => setPage(p as number)}
                          >
                            {p}
                          </Button>
                        )
                      )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-none h-7 w-7 p-0"
                      onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                      disabled={pagination.page >= pagination.pages}
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
