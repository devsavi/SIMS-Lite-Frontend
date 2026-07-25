"use client";

/**
 * Chart component wrappers — built on Recharts v3.
 *
 * All charts accept a standardised `dataset` format so dashboards stay
 * declarative. Every wrapper is responsive by default (ResponsiveContainer).
 */

import * as React from "react";
import {
  ResponsiveContainer,
  LineChart as ReLineChart,
  BarChart as ReBarChart,
  PieChart as RePieChart,
  AreaChart as ReAreaChart,
  Line,
  Bar,
  Pie,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { cn } from "@/utils/cn";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// ---------------------------------------------------------------------------
// CSS variable colours
// ---------------------------------------------------------------------------

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

// ---------------------------------------------------------------------------
// Shared props
// ---------------------------------------------------------------------------

export interface ChartDataPoint {
  [key: string]: string | number;
}

export interface BaseChartProps {
  data: ChartDataPoint[];
  /** Height in px. Defaults to 300 */
  height?: number;
  /** Keys to render as series. The first key in data is assumed to be the X axis label */
  dataKeys: string[];
  /** Key used as the X axis category label */
  xKey?: string;
  /** Custom colour array (uses CSS chart vars if not provided) */
  colors?: string[];
  /** Legend labels mapped from dataKey → display label */
  labels?: Record<string, string>;
  /** Value formatter for tooltips / Y axis ticks */
  valueFormatter?: (value: number) => string;
  /** Hide the legend */
  hideLegend?: boolean;
  /** Hide the grid */
  hideGrid?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// LineChart
// ---------------------------------------------------------------------------

export function LineChart({
  data,
  height = 300,
  dataKeys,
  xKey = "name",
  colors = CHART_COLORS,
  labels,
  valueFormatter,
  hideLegend = false,
  hideGrid = false,
  className,
}: BaseChartProps) {
  return (
    <div className={cn("w-full", className)} role="img" aria-label="Line chart">
      <ResponsiveContainer width="100%" height={height}>
        <ReLineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          {!hideGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />}
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={valueFormatter}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-popover)",
              border: "1px solid var(--color-border)",
              borderRadius: 0,
              fontSize: 12,
            }}
            formatter={(value: unknown, name: unknown) => [
              valueFormatter ? valueFormatter(value as number) : (value as number),
              labels?.[name as string] ?? (name as string),
            ]}
          />
          {!hideLegend && (
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              formatter={(name: string) => labels?.[name] ?? name}
            />
          )}
          {dataKeys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[i % colors.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BarChart
// ---------------------------------------------------------------------------

export function BarChart({
  data,
  height = 300,
  dataKeys,
  xKey = "name",
  colors = CHART_COLORS,
  labels,
  valueFormatter,
  hideLegend = false,
  hideGrid = false,
  className,
}: BaseChartProps) {
  return (
    <div className={cn("w-full", className)} role="img" aria-label="Bar chart">
      <ResponsiveContainer width="100%" height={height}>
        <ReBarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          {!hideGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />}
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={valueFormatter}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-popover)",
              border: "1px solid var(--color-border)",
              borderRadius: 0,
              fontSize: 12,
            }}
            formatter={(value: unknown, name: unknown) => [
              valueFormatter ? valueFormatter(value as number) : (value as number),
              labels?.[name as string] ?? (name as string),
            ]}
          />
          {!hideLegend && (
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              formatter={(name: string) => labels?.[name] ?? name}
            />
          )}
          {dataKeys.map((key, i) => (
            <Bar key={key} dataKey={key} fill={colors[i % colors.length]} radius={[2, 2, 0, 0]} />
          ))}
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AreaChart
// ---------------------------------------------------------------------------

export function AreaChart({
  data,
  height = 300,
  dataKeys,
  xKey = "name",
  colors = CHART_COLORS,
  labels,
  valueFormatter,
  hideLegend = false,
  hideGrid = false,
  className,
}: BaseChartProps) {
  return (
    <div className={cn("w-full", className)} role="img" aria-label="Area chart">
      <ResponsiveContainer width="100%" height={height}>
        <ReAreaChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <defs>
            {dataKeys.map((key, i) => (
              <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          {!hideGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />}
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={valueFormatter}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-popover)",
              border: "1px solid var(--color-border)",
              borderRadius: 0,
              fontSize: 12,
            }}
            formatter={(value: unknown, name: unknown) => [
              valueFormatter ? valueFormatter(value as number) : (value as number),
              labels?.[name as string] ?? (name as string),
            ]}
          />
          {!hideLegend && (
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              formatter={(name: string) => labels?.[name] ?? name}
            />
          )}
          {dataKeys.map((key, i) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[i % colors.length]}
              strokeWidth={2}
              fill={`url(#gradient-${key})`}
            />
          ))}
        </ReAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PieChart
// ---------------------------------------------------------------------------

export interface PieChartDataPoint {
  name: string;
  value: number;
}

export interface PieChartProps {
  data: PieChartDataPoint[];
  height?: number;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  hideLegend?: boolean;
  innerRadius?: number;
  className?: string;
}

export function PieChart({
  data,
  height = 300,
  colors = CHART_COLORS,
  valueFormatter,
  hideLegend = false,
  innerRadius = 0,
  className,
}: PieChartProps) {
  return (
    <div className={cn("w-full", className)} role="img" aria-label="Pie chart">
      <ResponsiveContainer width="100%" height={height}>
        <RePieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius="70%"
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--color-popover)",
              border: "1px solid var(--color-border)",
              borderRadius: 0,
              fontSize: 12,
            }}
            formatter={(value: unknown) => [
              valueFormatter ? valueFormatter(value as number) : (value as number),
            ]}
          />
          {!hideLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
        </RePieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DonutChart (PieChart with inner radius)
// ---------------------------------------------------------------------------

export function DonutChart(props: Omit<PieChartProps, "innerRadius">) {
  return <PieChart {...props} innerRadius={60} />;
}

// ---------------------------------------------------------------------------
// KpiCard
// ---------------------------------------------------------------------------

export interface KpiCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    label?: string;
  };
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * KpiCard — compact metric display card.
 *
 * @example
 * <KpiCard label="Monthly Revenue" value="$48,250" trend={{ value: 8.4, label: "vs last month" }} />
 */
export function KpiCard({
  label,
  value,
  trend,
  description,
  icon,
  className,
}: KpiCardProps) {
  const isPositive = (trend?.value ?? 0) > 0;
  const isNeutral = (trend?.value ?? 0) === 0;
  const TrendIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
  const trendColor = isNeutral
    ? "text-muted-foreground"
    : isPositive
    ? "text-green-600 dark:text-green-400"
    : "text-destructive";

  return (
    <div className={cn("border border-border bg-card p-6 shadow-sm", className)}>
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
          {trend !== undefined && (
            <div className={cn("mt-2 flex items-center gap-1 text-xs font-medium", trendColor)}>
              <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {trend.value > 0 ? "+" : ""}{trend.value}%
                {trend.label && (
                  <span className="ml-1 font-normal text-muted-foreground">{trend.label}</span>
                )}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="ml-4 flex h-12 w-12 shrink-0 items-center justify-center bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
