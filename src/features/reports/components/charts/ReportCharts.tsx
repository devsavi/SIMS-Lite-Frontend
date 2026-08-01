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
} from "recharts";
import { formatCurrency } from "@/utils/format";
import { useSystemSettingsStore } from "@/stores/settings.store";
import type { ReportChartData, ReportType } from "../../types";

interface ReportChartsProps {
  reportType: ReportType;
  data?: ReportChartData;
  loading?: boolean;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export const ReportCharts = React.memo(function ReportCharts({ reportType, data, loading }: ReportChartsProps) {
  const baseCurrency = useSystemSettingsStore((s) => s.baseCurrency);
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
                  {data.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {showMovementLine && data.movementTrends && (
        <div className="bg-card border border-border rounded-none p-5 shadow-sm lg:col-span-2">
          <h4 className="text-sm font-semibold text-foreground mb-4">Inventory Movement Trend (7 Days)</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.movementTrends}>
                <XAxis dataKey="date" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="inflows" stroke="#10b981" strokeWidth={2} name="Stock Inflows" />
                <Line type="monotone" dataKey="outflows" stroke="#ef4444" strokeWidth={2} name="Stock Outflows" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {showSupplierBar && data.supplierSpending && (
        <div className="bg-card border border-border rounded-none p-5 shadow-sm">
          <h4 className="text-sm font-semibold text-foreground mb-4">Supplier Purchase Breakdown ({baseCurrency})</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.supplierSpending}>
                <XAxis dataKey="supplier" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
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
