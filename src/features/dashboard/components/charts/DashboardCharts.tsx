"use client";

/**
 * Dashboard chart components.
 * Each is a self-contained card wrapping the shared Recharts wrappers.
 */

import * as React from "react";
import {
  BarChart,
  LineChart,
  AreaChart,
  PieChart,
  type ChartDataPoint,
  type PieChartDataPoint,
} from "@/app/components/charts";
import { EmptyState } from "@/components/common/empty-state";
import { CardSkeleton } from "@/components/common/loading-state";
import { ErrorState } from "@/components/common/error-state";
import { formatCurrency, formatNumber } from "@/utils/format";
import { cn } from "@/utils/cn";
import type {
  MonthlyDataPoint,
  TopReleasedProduct,
  LowStockCategory,
} from "../../types";

// ---------------------------------------------------------------------------
// Shared chart card wrapper
// ---------------------------------------------------------------------------

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

function ChartCard({ title, description, children, className, actions }: ChartCardProps) {
  return (
    <div className={cn("border border-border bg-card shadow-sm", className)}>
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// YearSelector — shared inline year picker for chart cards
// ---------------------------------------------------------------------------

interface YearSelectorProps {
  year: number;
  onChange: (year: number) => void;
}

const CURRENT_YEAR = new Date().getFullYear();

function YearSelector({ year, onChange }: YearSelectorProps) {
  const years: number[] = [];
  for (let y = CURRENT_YEAR; y > 2000; y--) {
    years.push(y);
  }

  return (
    <select
      value={year}
      onChange={(e) => onChange(Number(e.target.value))}
      className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      aria-label="Select year"
    >
      {years.map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </select>
  );
}

// ---------------------------------------------------------------------------
// InventoryValueTrendChart
// ---------------------------------------------------------------------------

interface InventoryValueTrendChartProps {
  data?: MonthlyDataPoint[];
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  year: number;
  onYearChange: (year: number) => void;
}

export function InventoryValueTrendChart({
  data,
  loading,
  error,
  onRetry,
  year,
  onYearChange,
}: InventoryValueTrendChartProps) {
  if (loading) {
    return <CardSkeleton className="h-[340px]" />;
  }

  const chartData: ChartDataPoint[] =
    data?.map((d) => ({ month: d.month, value: d.value })) ?? [];

  return (
    <ChartCard
      title="Inventory Value Trend"
      description={`Monthly stock value — ${year}`}
      actions={<YearSelector year={year} onChange={onYearChange} />}
    >
      {error ? (
        <ErrorState error={error} onRetry={onRetry} />
      ) : chartData.length === 0 ? (
        <EmptyState title="No data available" description="Inventory value data will appear here." />
      ) : (
        <AreaChart
          data={chartData}
          dataKeys={["value"]}
          xKey="month"
          height={260}
          valueFormatter={(v) => formatCurrency(v)}
          hideLegend
          labels={{ value: "Inventory Value" }}
        />
      )}
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// MonthlyPurchaseOrdersChart
// ---------------------------------------------------------------------------

interface MonthlyPurchaseOrdersChartProps {
  data?: MonthlyDataPoint[];
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  year: number;
  onYearChange: (year: number) => void;
}

export function MonthlyPurchaseOrdersChart({
  data,
  loading,
  error,
  onRetry,
  year,
  onYearChange,
}: MonthlyPurchaseOrdersChartProps) {
  if (loading) {
    return <CardSkeleton className="h-[340px]" />;
  }

  const chartData: ChartDataPoint[] =
    data?.map((d) => ({ month: d.month, orders: d.value })) ?? [];

  return (
    <ChartCard
      title="Monthly Purchase Orders"
      description={`Number of POs raised per month — ${year}`}
      actions={<YearSelector year={year} onChange={onYearChange} />}
    >
      {error ? (
        <ErrorState error={error} onRetry={onRetry} />
      ) : chartData.length === 0 ? (
        <EmptyState title="No data available" description="Purchase order data will appear here." />
      ) : (
        <BarChart
          data={chartData}
          dataKeys={["orders"]}
          xKey="month"
          height={260}
          valueFormatter={(v) => formatNumber(v)}
          hideLegend
          labels={{ orders: "Purchase Orders" }}
        />
      )}
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// MonthlyStockReleasesChart
// ---------------------------------------------------------------------------

interface MonthlyStockReleasesChartProps {
  data?: MonthlyDataPoint[];
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  year: number;
  onYearChange: (year: number) => void;
}

export function MonthlyStockReleasesChart({
  data,
  loading,
  error,
  onRetry,
  year,
  onYearChange,
}: MonthlyStockReleasesChartProps) {
  if (loading) {
    return <CardSkeleton className="h-[340px]" />;
  }

  const chartData: ChartDataPoint[] =
    data?.map((d) => ({ month: d.month, releases: d.value })) ?? [];

  return (
    <ChartCard
      title="Monthly Stock Releases"
      description={`Stock release volume per month — ${year}`}
      actions={<YearSelector year={year} onChange={onYearChange} />}
    >
      {error ? (
        <ErrorState error={error} onRetry={onRetry} />
      ) : chartData.length === 0 ? (
        <EmptyState title="No data available" description="Stock release data will appear here." />
      ) : (
        <LineChart
          data={chartData}
          dataKeys={["releases"]}
          xKey="month"
          height={260}
          valueFormatter={(v) => formatNumber(v)}
          hideLegend
          labels={{ releases: "Stock Releases" }}
        />
      )}
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// PyramidChart — 5-tier vertical pyramid chart
// All 5 sections are trapezoids with matching side angles forming a continuous pyramid shape.
// Rank 1 (largest) is at the bottom, Rank 5 (smallest) at the top.
// ---------------------------------------------------------------------------

const PYRAMID_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

// Trapezoid clip-paths for each rank position (index 0 = Rank 1 bottom -> index 4 = Rank 5 top)
// Each level's top and bottom widths line up along the continuous sloping pyramid edge.
const PYRAMID_CLIP_PATHS = [
  "polygon(9.2% 0%, 90.8% 0%, 98.0% 100%, 2.0% 100%)",   // Rank 1 (bottom)
  "polygon(16.9% 0%, 83.1% 0%, 90.3% 100%, 9.7% 100%)",   // Rank 2
  "polygon(24.6% 0%, 75.4% 0%, 82.6% 100%, 17.4% 100%)",  // Rank 3
  "polygon(32.3% 0%, 67.7% 0%, 74.9% 100%, 25.1% 100%)",  // Rank 4
  "polygon(40.0% 0%, 60.0% 0%, 67.2% 100%, 32.8% 100%)",  // Rank 5 (top)
];

interface PyramidRow {
  label: string;
  value: number;
}

interface PyramidChartProps {
  rows: PyramidRow[];
  valueFormatter?: (v: number) => string;
}

function PyramidChart({ rows, valueFormatter }: PyramidChartProps) {
  const fmt = valueFormatter ?? String;

  // Always render exactly 5 slots.
  // Slot 0 = rank 1 (bottom), slot 4 = rank 5 (top).
  const slots = Array.from({ length: 5 }, (_, i) => rows[i] ?? null);

  return (
    <div
      className="flex w-full flex-col items-center justify-center gap-1 py-2"
      style={{ minHeight: 260 }}
      role="img"
      aria-label="Pyramid chart"
    >
      {/* Render top-to-bottom: slot 4 (rank 5, top) → slot 0 (rank 1, bottom) */}
      {[...slots].reverse().map((row, reversedIdx) => {
        const rankIdx = 4 - reversedIdx; // 0 = rank 1 = bottom
        const rank = rankIdx + 1;
        const clipPath = PYRAMID_CLIP_PATHS[rankIdx];

        if (row === null) {
          // Empty slot — subtle muted trapezoid maintaining pyramid geometry
          return (
            <div
              key={rankIdx}
              className="flex h-11 w-full items-center justify-center overflow-hidden"
              style={{
                backgroundColor: "var(--color-muted)",
                opacity: 0.3,
                clipPath,
              }}
            >
              <span className="select-none text-[11px] font-medium text-muted-foreground">
                #{rank}
              </span>
            </div>
          );
        }

        const color = PYRAMID_COLORS[rankIdx % PYRAMID_COLORS.length];

        return (
          <div
            key={rankIdx}
            className="flex h-11 w-full items-center justify-center overflow-hidden px-4 transition-opacity hover:opacity-90"
            style={{
              backgroundColor: color,
              clipPath,
            }}
            title={`#${rank} ${row.label} — ${fmt(row.value)}`}
          >
            <span className="truncate text-center text-xs font-semibold text-white drop-shadow-sm">
              #{rank}&nbsp;·&nbsp;{row.label}&nbsp;({fmt(row.value)})
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TopReleasedProductsChart — pyramid, top 5
// ---------------------------------------------------------------------------

interface TopReleasedProductsChartProps {
  data?: TopReleasedProduct[];
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  year: number;
  onYearChange: (year: number) => void;
}

export function TopReleasedProductsChart({
  data,
  loading,
  error,
  onRetry,
  year,
  onYearChange,
}: TopReleasedProductsChartProps) {
  if (loading) {
    return <CardSkeleton className="h-[340px]" />;
  }

  // Top 5 by quantity descending
  const top5 = [...(data ?? [])]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const rows: PyramidRow[] = top5.map((d) => ({
    label: d.product_name?.trim() || d.product_code || "Unknown",
    value: d.quantity,
  }));

  return (
    <ChartCard
      title="Top Released Products"
      description={`Top 5 by release quantity — ${year}`}
      actions={<YearSelector year={year} onChange={onYearChange} />}
    >
      {error ? (
        <ErrorState error={error} onRetry={onRetry} />
      ) : rows.length === 0 ? (
        <EmptyState title="No data available" description="Top released products will appear here." />
      ) : (
        <PyramidChart rows={rows} valueFormatter={(v) => formatNumber(v)} />
      )}
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// LowStockDistributionChart
// ---------------------------------------------------------------------------

interface LowStockDistributionChartProps {
  data?: LowStockCategory[];
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  year: number;
  onYearChange: (year: number) => void;
}

export function LowStockDistributionChart({
  data,
  loading,
  error,
  onRetry,
  year,
  onYearChange,
}: LowStockDistributionChartProps) {
  if (loading) {
    return <CardSkeleton className="h-[340px]" />;
  }

  const chartData: PieChartDataPoint[] =
    data?.map((d) => ({ name: d.name, value: d.count })) ?? [];

  return (
    <ChartCard
      title="Low Stock Distribution"
      description={`Low stock items by category — ${year}`}
      actions={<YearSelector year={year} onChange={onYearChange} />}
    >
      {error ? (
        <ErrorState error={error} onRetry={onRetry} />
      ) : chartData.length === 0 ? (
        <EmptyState title="No low stock items" description="Low stock distribution will appear here." />
      ) : (
        <PieChart
          data={chartData}
          height={260}
          valueFormatter={(v) => formatNumber(v)}
        />
      )}
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// GRN Trend Chart (officer)
// ---------------------------------------------------------------------------

interface GrnTrendChartProps {
  data?: MonthlyDataPoint[];
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
}

export function GrnTrendChart({ data, loading, error, onRetry }: GrnTrendChartProps) {
  if (loading) {
    return <CardSkeleton className="h-[340px]" />;
  }

  const chartData: ChartDataPoint[] =
    data?.map((d) => ({ month: d.month, grns: d.value })) ?? [];

  return (
    <ChartCard title="GRN Trend" description="Goods received notes per month">
      {error ? (
        <ErrorState error={error} onRetry={onRetry} />
      ) : chartData.length === 0 ? (
        <EmptyState title="No data available" description="GRN data will appear here." />
      ) : (
        <LineChart
          data={chartData}
          dataKeys={["grns"]}
          xKey="month"
          height={260}
          valueFormatter={(v) => formatNumber(v)}
          hideLegend
          labels={{ grns: "GRNs" }}
        />
      )}
    </ChartCard>
  );
}
