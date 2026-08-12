"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "@/utils/format";
import { useSystemSettingsStore } from "@/stores/settings.store";
import type { ReportChartData, ReportPeriod, ReportType } from "../../types";

interface ReportChartsProps {
  reportType: ReportType;
  data?: ReportChartData;
  loading?: boolean;
  period?: ReportPeriod;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

/**
 * Returns just the currency symbol for a given ISO currency code.
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

// ---------------------------------------------------------------------------
// Period-aware axis helpers (shared logic with ReportsAnalyticsVisuals)
// ---------------------------------------------------------------------------

function getXAxisLabel(period: ReportPeriod = "day"): string {
  switch (period) {
    case "day":    return "Time of Day (Hourly)";
    case "week":   return "Day of Week";
    case "month":  return "Date";
    case "custom": return "Date";
    default:       return "Date";
  }
}

function xTickFormatter(period: ReportPeriod = "day"): (v: string) => string {
  return (v: string) => {
    switch (period) {
      case "day":
        return v; // already "08:00"
      case "week":
        return v.slice(0, 3); // "Monday" → "Mon"
      case "month":
        if (/^\d+$/.test(v)) return v;
        const parts = v.split(" ");
        return parts.length >= 2 ? `${parts[0]} ${parseInt(parts[1], 10)}` : v;
      case "custom":
        if (/^\d{4}-\d{2}-\d{2}/.test(v)) {
          const d = new Date(v);
          return isNaN(d.getTime())
            ? v
            : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        }
        return v;
      default:
        return v;
    }
  };
}

function getPeriodLabel(period: ReportPeriod = "day"): string {
  switch (period) {
    case "day":    return "Today (Hourly)";
    case "week":   return "This Week (Daily)";
    case "month":  return "This Month (Daily)";
    case "custom": return "Custom Range";
    default:       return "";
  }
}

export const ReportCharts = React.memo(function ReportCharts({
  reportType,
  data,
  loading,
  period = "day",
}: ReportChartsProps) {
  const baseCurrency = useSystemSettingsStore((s) => s.baseCurrency);
  const currencySymbol = getCurrencySymbol(baseCurrency);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-none p-6 mb-6 shadow-sm flex items-center justify-center h-64">
        <span className="text-sm text-muted-foreground animate-pulse">Loading charts...</span>
      </div>
    );
  }

  if (!data) return null;

  const showCategoryPie = ["inventory", "low-stock", "product"].includes(reportType) && data.categoryDistribution;
  const showMovementLine = reportType === "movement" && data.movementTrends;
  const showSupplierBar = ["po", "grn", "supplier"].includes(reportType) && data.supplierSpending;

  if (!showCategoryPie && !showMovementLine && !showSupplierBar) {
    return null;
  }

  const tickFmt = xTickFormatter(period);
  const xLabel = getXAxisLabel(period);
  const periodLabel = getPeriodLabel(period);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {showCategoryPie && data.categoryDistribution && (
        <div className="bg-card border border-border rounded-none p-5 shadow-sm">
          <h4 className="text-sm font-semibold text-foreground mb-4">Category Distribution</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.categoryDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "0px",
                    color: "#fff",
                    fontSize: "12px",
                    border: "1px solid #1e293b",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {showMovementLine && data.movementTrends && (
        <div className="bg-card border border-border rounded-none p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-foreground">Inventory Movement Trend</h4>
            <span className="text-xs text-muted-foreground">{periodLabel}</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.movementTrends} margin={{ top: 5, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={tickFmt}
                  interval="preserveStartEnd"
                  label={{
                    value: xLabel,
                    position: "insideBottom",
                    offset: -16,
                    style: { fontSize: 9, fill: "#94a3b8" },
                  }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip
                  labelFormatter={(label) => `${xLabel}: ${tickFmt(String(label))}`}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "0px",
                    color: "#fff",
                    fontSize: "12px",
                    border: "1px solid #1e293b",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="inflows" stroke="#10b981" strokeWidth={2} name="Stock Inflows" dot={false} />
                <Line type="monotone" dataKey="outflows" stroke="#ef4444" strokeWidth={2} name="Stock Outflows" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {showSupplierBar && data.supplierSpending && (
        <div className="bg-card border border-border rounded-none p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-foreground">
              Supplier Purchase Breakdown ({baseCurrency})
            </h4>
            <span className="text-xs text-muted-foreground">{periodLabel}</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.supplierSpending} margin={{ top: 5, right: 10, left: -10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
                <XAxis
                  dataKey="supplier"
                  stroke="#94a3b8"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                  angle={-20}
                  textAnchor="end"
                  tickFormatter={(v: string) => v.length > 12 ? `${v.slice(0, 11)}…` : v}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${currencySymbol}${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value)), `Total Spent (${baseCurrency})`]}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "0px",
                    color: "#fff",
                    fontSize: "12px",
                    border: "1px solid #1e293b",
                  }}
                />
                <Legend />
                <Bar dataKey="totalSpent" fill="#3b82f6" name={`Total Spent (${baseCurrency})`} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
});
