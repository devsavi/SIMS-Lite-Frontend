"use client";

import * as React from "react";
import {
  Activity,
  Shield,
  User,
  Archive,
  Calendar,
  Filter,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { useUsersList } from "../../users/hooks/use-admin-users";
import type {
  AuditLogFilterParams,
  AuditPeriod,
  AuditActionCategory,
  AuditResourceType,
} from "../types";

interface AuditLogFiltersProps {
  filters: AuditLogFilterParams;
  onFilterChange: (newFilters: AuditLogFilterParams) => void;
  onRefresh?: () => void;
}

const PERIOD_LABELS: { value: AuditPeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "custom", label: "Custom" },
];

const ACTION_LABELS: { value: AuditActionCategory; label: string; icon?: React.ReactNode }[] = [
  { value: "all", label: "All Actions" },
  { value: "auth", label: "Auth", icon: <Shield className="h-3 w-3" /> },
  { value: "user", label: "User", icon: <User className="h-3 w-3" /> },
  { value: "inventory", label: "Inventory", icon: <Archive className="h-3 w-3" /> },
];

const RESOURCE_OPTIONS: { value: AuditResourceType | "__all__"; label: string }[] = [
  { value: "__all__", label: "All Resources" },
  { value: "User", label: "User" },
  { value: "Product", label: "Product" },
  { value: "PurchaseOrder", label: "Purchase Order" },
];

const SIZE_OPTIONS = [10, 20, 50];

export function AuditLogFilters({ filters, onFilterChange, onRefresh }: AuditLogFiltersProps) {
  // Fetch all users for the user dropdown
  const { data: usersData, isLoading: usersLoading } = useUsersList({ page: 1, limit: 100 });
  const users = usersData?.data ?? [];

  const update = (patch: Partial<AuditLogFilterParams>) =>
    onFilterChange({ ...filters, page: 1, ...patch });

  const setPeriod = (value: AuditPeriod) => update({ period: value });
  const setAction = (value: AuditActionCategory) => update({ action: value });

  return (
    <div className="space-y-3 rounded-none border border-border bg-card p-4">
      {/* ── Title row ── */}
      <div className="flex items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Activity className="h-3.5 w-3.5 text-primary" />
          Activity Log Filters
        </div>
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-none h-7 w-7 p-0 text-muted-foreground hover:text-foreground shrink-0"
            onClick={onRefresh}
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* ── Period buttons ── */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          <Calendar className="h-3.5 w-3.5" />
          Period:
        </span>
        {PERIOD_LABELS.map(({ value, label }) => (
          <Button
            key={value}
            type="button"
            variant={filters.period === value ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod(value)}
            className="rounded-none text-xs h-7 px-2.5"
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Custom date range */}
      {filters.period === "custom" && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground shrink-0 w-[52px]">From:</span>
          <Input
            type="date"
            value={filters.date_from ?? ""}
            onChange={(e) => update({ date_from: e.target.value || undefined })}
            className="rounded-none h-7 text-xs w-36 px-2"
            max={filters.date_to || undefined}
          />
          <span className="text-xs text-muted-foreground shrink-0">To:</span>
          <Input
            type="date"
            value={filters.date_to ?? ""}
            onChange={(e) => update({ date_to: e.target.value || undefined })}
            className="rounded-none h-7 text-xs w-36 px-2"
            min={filters.date_from || undefined}
          />
        </div>
      )}

      {/* ── Action buttons + dropdowns row ── */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Action category */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <Filter className="h-3.5 w-3.5" />
            Action:
          </span>
          {ACTION_LABELS.map(({ value, label, icon }) => (
            <Button
              key={value}
              type="button"
              variant={filters.action === value ? "default" : "outline"}
              size="sm"
              onClick={() => setAction(value)}
              className="rounded-none text-xs h-7 px-2.5 gap-1"
            >
              {icon}
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* ── Dropdowns row ── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Resource type — Products-style Select */}
        <Select
          value={filters.resource_type === "all" ? "__all__" : filters.resource_type}
          onValueChange={(v) =>
            update({ resource_type: v === "__all__" ? "all" : (v as AuditResourceType) })
          }
        >
          <SelectTrigger className="h-9 w-44 text-sm" aria-label="Filter by resource type">
            <SelectValue placeholder="All Resources" />
          </SelectTrigger>
          <SelectContent>
            {RESOURCE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* User dropdown — populated from users list */}
        <Select
          value={filters.user_id ?? "__all__"}
          onValueChange={(v) => update({ user_id: v === "__all__" ? undefined : v })}
          disabled={usersLoading}
        >
          <SelectTrigger className="h-9 w-52 text-sm" aria-label="Filter by user">
            <SelectValue placeholder={usersLoading ? "Loading users…" : "All Users"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Users</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Page size */}
        <Select
          value={String(filters.size)}
          onValueChange={(v) => update({ size: Number(v) })}
        >
          <SelectTrigger className="h-9 w-32 text-sm" aria-label="Entries per page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SIZE_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} per page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
