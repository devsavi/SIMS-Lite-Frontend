"use client";

import React from "react";
import {
  X,
  User,
  Activity,
  Shield,
  Calendar,
  Mail,
  Phone,
  Building,
  Filter,
  Loader2,
  CheckCircle2,
  XCircle,
  Archive,
} from "lucide-react";
import type { UserItem } from "../types";
import { useUserDetail, useUserAuditLogs } from "../hooks/use-admin-users";
import { getRoleBadgeClass, formatDateTime } from "../utils/user-helpers";
import { ROLE_LABELS } from "@/lib/auth";
import { cn } from "@/utils/cn";
import { StatusBadge } from "@/components/common/status-badge";
import type {
  ActivityPeriod,
  ActivityAction,
  ActivityStatus,
  ActivityLogFilters,
  UserActivityLog,
} from "@/features/profile/types";

interface UserDetailsModalProps {
  user: UserItem | null;
  isOpen: boolean;
  onClose: () => void;
}

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

function getActionIcon(action: string) {
  const prefix = action.split(".")[0];
  switch (prefix) {
    case "auth":
      return <Shield className="h-3 w-3 text-blue-500" />;
    case "user":
      return <User className="h-3 w-3 text-purple-500" />;
    case "inventory":
      return <Archive className="h-3 w-3 text-emerald-500" />;
    default:
      return <Activity className="h-3 w-3 text-amber-500" />;
  }
}

function formatDetailValue(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function DetailLines({ detail }: { detail: Record<string, unknown> | null }) {
  if (!detail) return null;
  const entries = Object.entries(detail).filter(([, v]) => formatDetailValue(v) !== "");
  if (entries.length === 0) return null;
  return (
    <div className="mt-0.5 flex flex-wrap gap-x-2.5 gap-y-0.5">
      {entries.map(([k, v]) => (
        <span key={k} className="text-[10px] text-muted-foreground font-mono">
          <span className="text-foreground/50">{k}:</span>{" "}
          <span className="text-foreground/80">{formatDetailValue(v)}</span>
        </span>
      ))}
    </div>
  );
}

const PERIOD_LABELS: { value: ActivityPeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "custom", label: "Custom" },
];

const ACTION_LABELS: { value: ActivityAction; label: string }[] = [
  { value: "all", label: "All" },
  { value: "auth", label: "Auth" },
  { value: "user", label: "User" },
  { value: "inventory", label: "Inventory" },
];

const STATUS_LABELS: { value: ActivityStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "success", label: "Success" },
  { value: "failure", label: "Failure" },
];

export function UserDetailsModal({ user, isOpen, onClose }: UserDetailsModalProps) {
  const [activeTab, setActiveTab] = React.useState<"general" | "activity">("general");

  const [period, setPeriod] = React.useState<ActivityPeriod>("today");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [action, setAction] = React.useState<ActivityAction>("all");
  const [status, setStatus] = React.useState<ActivityStatus>("all");
  const [page, setPage] = React.useState(1);

  const filters = React.useMemo<ActivityLogFilters>(
    () => ({
      period,
      date_from: period === "custom" ? dateFrom || undefined : undefined,
      date_to: period === "custom" ? dateTo || undefined : undefined,
      action,
      status,
      page,
      size: 10,
    }),
    [period, dateFrom, dateTo, action, status, page]
  );

  const { data: userDetail, isLoading: isLoadingDetail } = useUserDetail(isOpen && user ? user.id : null);
  const { data: auditLogsData, isLoading: isLoadingLogs } = useUserAuditLogs(
    isOpen && user && activeTab === "activity" ? user.id : null,
    filters
  );

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab("general");
      setPeriod("today");
      setDateFrom("");
      setDateTo("");
      setAction("all");
      setStatus("all");
      setPage(1);
    }
  }, [isOpen]);

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

  if (!isOpen || !user) return null;

  const displayData = userDetail || user;
  const activities = auditLogsData?.data || [];
  const pagination = auditLogsData?.pagination || { page: 1, size: 10, total: 0, pages: 1 };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-none border border-border bg-card shadow-lg text-foreground animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-none bg-primary/10 text-primary font-bold text-lg">
              {user.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-semibold">{user.name}</h3>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close user details modal"
            className="rounded-none p-1 text-muted-foreground hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border bg-muted/30 px-6">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={cn(
              "flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-semibold transition-colors",
              activeTab === "general"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <User className="h-4 w-4" />
            General Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("activity")}
            className={cn(
              "flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-semibold transition-colors",
              activeTab === "activity"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Activity className="h-4 w-4" />
            Activity Log
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === "general" ? (
            isLoadingDetail ? (
              <div className="py-12 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading details...
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5" /> Assigned Role
                    </span>
                    <div>
                      <span className={cn("inline-flex items-center rounded-none border px-2.5 py-0.5 text-xs font-semibold", getRoleBadgeClass(displayData.role))}>
                        {ROLE_LABELS[displayData.role] || displayData.role}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">Account Status</span>
                    <div>
                      <StatusBadge
                        variant={
                          displayData.status === "ACTIVE" ? "active"
                          : displayData.status === "INACTIVE" ? "inactive"
                          : "pending"
                        }
                        label={
                          displayData.status === "ACTIVE" ? "Active"
                          : displayData.status === "INACTIVE" ? "Inactive"
                          : "Pending"
                        }
                        dot
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5" /> Department
                    </span>
                    <p className="text-sm font-medium">{displayData.department || "N/A"}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" /> Phone Number
                    </span>
                    <p className="text-sm font-medium">{displayData.phone || "N/A"}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> Created Date
                    </span>
                    <p className="text-sm font-medium">{formatDateTime(displayData.createdAt)}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> Last Login
                    </span>
                    <p className="text-sm font-medium">{formatDateTime(displayData.lastLogin)}</p>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Filter bar */}
              <div className="flex flex-col gap-3 border border-border p-3 bg-muted/20 text-xs">
                {/* Period filter */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-muted-foreground font-medium flex items-center gap-1 w-14">
                    <Calendar className="h-3 w-3 text-muted-foreground" /> Period:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {PERIOD_LABELS.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setPeriod(value)}
                        className={cn(
                          "px-2 py-0.5 border text-[10px] font-medium transition-colors rounded-none",
                          period === value
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-foreground border-input hover:bg-accent"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom date range if custom is selected */}
                {period === "custom" && (
                  <div className="flex flex-wrap items-center gap-2 pl-14">
                    <span className="text-[10px] text-muted-foreground">From:</span>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="border border-input bg-background px-1.5 py-0.5 text-[10px] w-28 focus-visible:outline-none rounded-none"
                    />
                    <span className="text-[10px] text-muted-foreground">To:</span>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="border border-input bg-background px-1.5 py-0.5 text-[10px] w-28 focus-visible:outline-none rounded-none"
                    />
                  </div>
                )}

                {/* Action filter */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-muted-foreground font-medium flex items-center gap-1 w-14">
                    <Filter className="h-3 w-3 text-muted-foreground" /> Action:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {ACTION_LABELS.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setAction(value)}
                        className={cn(
                          "px-2 py-0.5 border text-[10px] font-medium transition-colors rounded-none",
                          action === value
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-foreground border-input hover:bg-accent"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status filter */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-muted-foreground font-medium flex items-center gap-1 w-14">
                    Status:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {STATUS_LABELS.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setStatus(value)}
                        className={cn(
                          "px-2 py-0.5 border text-[10px] font-medium transition-colors rounded-none",
                          status === value
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-foreground border-input hover:bg-accent"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Logs list */}
              {isLoadingLogs ? (
                <div className="flex items-center justify-center py-10 text-xs text-muted-foreground gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading activity logs...
                </div>
              ) : activities.length === 0 ? (
                <div className="py-10 text-center text-xs text-muted-foreground">
                  No activity logs found for the selected filters.
                </div>
              ) : (
                <div className="space-y-2 max-h-[30vh] overflow-y-auto">
                  {activities.map((log: UserActivityLog) => (
                    <div
                      key={log.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between border border-border p-2.5 text-xs bg-card hover:bg-muted/10 transition-colors rounded-none"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="flex h-7 w-7 items-center justify-center bg-muted border border-border shrink-0 mt-0.5 rounded-none">
                          {getActionIcon(log.action)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-foreground">
                              {formatAction(log.action)}
                            </span>
                            <span className="text-[9px] px-1.5 py-0 border bg-muted text-muted-foreground border-border uppercase font-mono rounded-none">
                              {log.action.split(".")[0]}
                            </span>
                            {log.status === "success" ? (
                              <span className="flex items-center text-[9px] text-emerald-500 font-medium">
                                <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                                success
                              </span>
                            ) : (
                              <span className="flex items-center text-[9px] text-red-500 font-medium">
                                <XCircle className="h-2.5 w-2.5 mr-0.5" />
                                failure
                              </span>
                            )}
                          </div>
                          <DetailLines detail={log.detail} />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground shrink-0 mt-1 sm:mt-0 font-mono">
                        <span>{log.ip_address}</span>
                        <span>
                          {new Date(log.created_at).toLocaleDateString(undefined, {
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
              )}

              {/* Pagination controls for modal */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border bg-muted/5 p-2 rounded-none">
                  <span>
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={pagination.page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="px-2 py-1 border border-input bg-background hover:bg-accent disabled:opacity-50 text-[10px] font-medium rounded-none transition-colors"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      disabled={pagination.page >= pagination.pages}
                      onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                      className="px-2 py-1 border border-input bg-background hover:bg-accent disabled:opacity-50 text-[10px] font-medium rounded-none transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-border px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-none bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

