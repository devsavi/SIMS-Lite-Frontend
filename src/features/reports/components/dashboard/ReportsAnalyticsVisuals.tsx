"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TrendingUp, PieChart, Truck, Layers } from "lucide-react";
import { useSystemSettingsStore } from "@/stores/settings.store";
import { formatCurrency } from "@/utils/format";
import type { AnalyticsOverviewResponse, ReportPeriod } from "../../types";

/**
 * Returns just the currency symbol for a given ISO currency code.
 * Falls back to the code itself if Intl doesn't resolve a symbol.
 */
function getCurrencySymbol(currency: string): string {
  try {
    const parts = new Intl.NumberFormat("en-US", { style: "currency", currency })
      .formatToParts(0);
    return parts.find((p) => p.type === "currency")?.value ?? currency;
  } catch {
    return currency;
  }
}

interface ReportsAnalyticsVisualsProps {
  analytics?: AnalyticsOverviewResponse;
  isLoading?: boolean;
  period?: ReportPeriod;
}

// ---------------------------------------------------------------------------
// Period-aware axis helpers
// ---------------------------------------------------------------------------

/**
 * Returns a human-readable axis title and tick formatter for the movement
 * trend X-axis depending on the selected period.
 *
 * The backend sends period-appropriate `date` strings in each data point:
 *  - day   → "08:00", "10:00", …  (hourly)
 *  - week  → "Mon", "Tue", …      (short day names)
 *  - month → "Aug 1", "Aug 15", … (date labels)
 *  - custom→ varies (ISO date prefix)
 */
function getXAxisConfig(period: ReportPeriod = "day"): {
  label: string;
  tickFormatter: (value: string) => string;
  interval: number | "preserveStartEnd";
} {
  switch (period) {
    case "day":
      return {
        label: "Time of Day (Hourly)",
        tickFormatter: (v) => v, // already "08:00" format from backend
        interval: 0,
      };
    case "week":
      return {
        label: "Day of Week",
        tickFormatter: (v) => v.slice(0, 3), // "Monday" → "Mon"
        interval: 0,
      };
    case "month":
      return {
        label: "Date",
        // e.g. "Aug 01" → "Aug 1", or plain "1","15"
        tickFormatter: (v) => {
          if (/^\d+$/.test(v)) return v;            // already a plain day number
          const parts = v.split(" ");
          return parts.length >= 2
            ? `${parts[0]} ${parseInt(parts[1], 10)}`
            : v;
        },
        interval: "preserveStartEnd",
      };
    case "custom":
      return {
        label: "Date",
        tickFormatter: (v) => {
          // try to parse ISO date string "2026-08-01" → "Aug 1"
          if (/^\d{4}-\d{2}-\d{2}/.test(v)) {
            const d = new Date(v);
            return isNaN(d.getTime())
              ? v
              : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          }
          return v;
        },
        interval: "preserveStartEnd",
      };
    default:
      return { label: "Date", tickFormatter: (v) => v, interval: "preserveStartEnd" };
  }
}

/**
 * Returns a short period label for the chart subtitle / badge.
 */
function getPeriodLabel(period: ReportPeriod = "day"): string {
  switch (period) {
    case "day":   return "Today (Hourly)";
    case "week":  return "This Week (Daily)";
    case "month": return "This Month (Daily)";
    case "custom":return "Custom Range";
    default:      return "";
  }
}

export function ReportsAnalyticsVisuals({
  analytics,
  isLoading,
  period = "day",
}: ReportsAnalyticsVisualsProps) {
  const baseCurrency = useSystemSettingsStore((s) => s.baseCurrency);
  const currencySymbol = getCurrencySymbol(baseCurrency);
  if (isLoading || !analytics) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-card border border-border rounded-none p-5 animate-pulse" />
        <div className="h-64 bg-card border border-border rounded-none p-5 animate-pulse" />
      </div>
    );
  }

  const { charts } = analytics;
  const xAxisCfg = getXAxisConfig(period);
  const periodLabel = getPeriodLabel(period);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Visual 1: Stock Movement Flow (Inflows vs Outflows) */}
      <div className="bg-card border border-border p-5 rounded-none shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Stock Inflows vs Outflows
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">{periodLabel} · Volume Units</span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={charts.movement_trends}
              margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
            >
              <defs>
                <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
                tickFormatter={xAxisCfg.tickFormatter}
                interval={xAxisCfg.interval}
                label={{
                  value: xAxisCfg.label,
                  position: "insideBottom",
                  offset: -14,
                  style: { fontSize: 9, fill: "#94a3b8" },
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
                width={40}
              />
              <Tooltip
                labelFormatter={(label) => `${xAxisCfg.label}: ${xAxisCfg.tickFormatter(String(label))}`}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderRadius: "0px",
                  color: "#fff",
                  fontSize: "12px",
                  border: "1px solid #1e293b",
                }}
              />
              <Area
                type="monotone"
                dataKey="inflows"
                name="Inflows (+)"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#inflowGrad)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="outflows"
                name="Outflows (−)"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#outflowGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Visual 2: Category Stock Value Distribution */}
      <div className="bg-card border border-border p-5 rounded-none shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <PieChart className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Stock Valuation by Category
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">Distribution ($)</span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={charts.category_distribution}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#cbd5e1" opacity={0.3} />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => `${currencySymbol}${(v / 1000).toFixed(0)}k`}
              />
              <YAxis
                dataKey="category_name"
                type="category"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
                width={100}
              />
              <Tooltip
                formatter={(val: any) => [formatCurrency(Number(val), baseCurrency), "Valuation"]}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderRadius: "0px",
                  color: "#fff",
                  fontSize: "12px",
                  border: "1px solid #1e293b",
                }}
              />
              <Bar dataKey="stock_value" name="Valuation ($)" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Visual 3: Top Suppliers Spend */}
      <div className="bg-card border border-border p-5 rounded-none shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Top Suppliers by Period Spend
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">{periodLabel} · Spend ($)</span>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={charts.top_suppliers_by_spend}
              margin={{ top: 10, right: 10, left: -10, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
              <XAxis
                dataKey="supplier_name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 9 }}
                interval={0}
                // Truncate long supplier names on X-axis
                tickFormatter={(v: string) => (v.length > 12 ? `${v.slice(0, 11)}…` : v)}
                angle={-20}
                textAnchor="end"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => `${currencySymbol}${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(val: any) => [formatCurrency(Number(val), baseCurrency), "Total Spent"]}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderRadius: "0px",
                  color: "#fff",
                  fontSize: "12px",
                  border: "1px solid #1e293b",
                }}
              />
              <Bar dataKey="total_spent" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Visual 4: PO Status Breakdown */}
      <div className="bg-card border border-border p-5 rounded-none shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Purchase Order Status Distribution
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">{periodLabel} · PO Count</span>
        </div>

        <div className="space-y-3 pt-2">
          {charts.po_status_counts.map((item) => {
            const maxCount = Math.max(1, ...charts.po_status_counts.map((c) => c.count));
            const pct = Math.min(100, (item.count / maxCount) * 100);
            const statusColor: Record<string, string> = {
              APPROVED: "#10b981",
              PENDING_APPROVAL: "#f59e0b",
              DRAFT: "#64748b",
              COMPLETED: "#3b82f6",
              CANCELLED: "#ef4444",
              PARTIALLY_RECEIVED: "#8b5cf6",
            };
            return (
              <div key={item.status} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">
                    {item.status.replace(/_/g, " ")}
                  </span>
                  <span className="text-muted-foreground font-mono">
                    {item.count} orders · {formatCurrency(item.amount, baseCurrency)}
                  </span>
                </div>
                <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
                  <div
                    className="h-full transition-all duration-500 rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: statusColor[item.status] ?? "#3b82f6",
                    }}
                  />
                </div>
              </div>
            );
          })}
          {charts.po_status_counts.length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-6">
              No purchase order activity recorded for this period.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
