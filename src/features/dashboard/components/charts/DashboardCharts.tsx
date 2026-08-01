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
// PyramidChart — vertical pyramid, rank 1 (largest) at the bottom
// Bars are bottom-aligned; each rank is progressively narrower and shorter.
// Label and rank number are rendered inside each bar.
// ---------------------------------------------------------------------------

const PYRAMID_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

// Width % for each rank position (index 0 = rank 1 = widest/bottom)
const PYRAMID_WIDTHS = [100, 82, 65, 48, 32];

// Height px for each rank position (index 0 = rank 1 = tallest/bottom)
const PYRAMID_HEIGHTS = [64, 54, 46, 38, 32];

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

  // Always render exactly 5 slots. Empty slots get a dotted placeholder.
  // Slot 0 = rank 1 (bottom/widest), slot 4 = rank 5 (top/narrowest).
  const slots = Array.from({ length: 5 }, (_, i) => rows[i] ?? null);

  // Which reversed-index is the topmost filled bar (gets the taper clip-path)
  const topmostFilledReversedIdx = [...slots].reverse().findIndex((s) => s !== null);

  return (
    <div
      className="flex w-full flex-col items-center justify-end gap-0.5"
      style={{ minHeight: 260 }}
      role="img"
      aria-label="Pyramid chart"
    >
      {/* Render top-to-bottom: slot 4 (rank 5, narrowest) → slot 0 (rank 1, widest) */}
      {[...slots].reverse().map((row, reversedIdx) => {
        const rankIdx = 4 - reversedIdx; // 0 = rank 1 = bottom/widest
        const width = PYRAMID_WIDTHS[rankIdx];
        const height = PYRAMID_HEIGHTS[rankIdx];
        const rank = rankIdx + 1;

        if (row === null) {
          // Empty slot — dotted outline placeholder matching chart grid line style
          return (
            <div
              key={rankIdx}
              className="flex items-center justify-center"
              style={{
                width: `${width}%`,
                height,
                border: "1.5px dashed var(--color-border)",
              }}
            >
              <span className="select-none text-[10px] text-muted-foreground/40">
                {rank}
              </span>
            </div>
          );
        }

        const color = PYRAMID_COLORS[rankIdx % PYRAMID_COLORS.length];
        // Taper the top-left/top-right corners of the topmost filled bar
        const isTopmostFilled = reversedIdx === topmostFilledReversedIdx;

        return (
          <div
            key={rankIdx}
            className="flex items-center justify-center overflow-hidden px-2"
            style={{
              width: `${width}%`,
              height,
              backgroundColor: color,
              clipPath: isTopmostFilled
                ? "polygon(6% 0%, 94% 0%, 100% 100%, 0% 100%)"
                : "none",
            }}
            title={`#${rank} ${row.label} — ${fmt(row.value)}`}
          >
            <span className="truncate text-center text-xs font-semibold text-white drop-shadow-sm">
              {rank}&nbsp;·&nbsp;{row.label}&nbsp;({fmt(row.value)})
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
