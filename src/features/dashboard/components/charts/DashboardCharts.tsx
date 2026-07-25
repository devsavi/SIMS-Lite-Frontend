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
// InventoryValueTrendChart
// ---------------------------------------------------------------------------

interface InventoryValueTrendChartProps {
  data?: MonthlyDataPoint[];
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
}

export function InventoryValueTrendChart({
  data,
  loading,
  error,
  onRetry,
}: InventoryValueTrendChartProps) {
  if (loading) {
    return <CardSkeleton className="h-[340px]" />;
  }

  const chartData: ChartDataPoint[] =
    data?.map((d) => ({ month: d.month, value: d.value })) ?? [];

  return (
    <ChartCard
      title="Inventory Value Trend"
      description="Monthly stock value over time"
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
          valueFormatter={(v) => formatCurrency(v, "USD", "en-US")}
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
}

export function MonthlyPurchaseOrdersChart({
  data,
  loading,
  error,
  onRetry,
}: MonthlyPurchaseOrdersChartProps) {
  if (loading) {
    return <CardSkeleton className="h-[340px]" />;
  }

  const chartData: ChartDataPoint[] =
    data?.map((d) => ({ month: d.month, orders: d.value })) ?? [];

  return (
    <ChartCard
      title="Monthly Purchase Orders"
      description="Number of POs raised per month"
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
}

export function MonthlyStockReleasesChart({
  data,
  loading,
  error,
  onRetry,
}: MonthlyStockReleasesChartProps) {
  if (loading) {
    return <CardSkeleton className="h-[340px]" />;
  }

  const chartData: ChartDataPoint[] =
    data?.map((d) => ({ month: d.month, releases: d.value })) ?? [];

  return (
    <ChartCard
      title="Monthly Stock Releases"
      description="Stock release volume per month"
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
// TopReleasedProductsChart
// ---------------------------------------------------------------------------

interface TopReleasedProductsChartProps {
  data?: TopReleasedProduct[];
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
}

export function TopReleasedProductsChart({
  data,
  loading,
  error,
  onRetry,
}: TopReleasedProductsChartProps) {
  if (loading) {
    return <CardSkeleton className="h-[340px]" />;
  }

  const chartData: ChartDataPoint[] =
    data?.map((d) => ({ name: d.product_name, quantity: d.quantity })) ?? [];

  return (
    <ChartCard
      title="Top Released Products"
      description="Highest volume stock releases"
    >
      {error ? (
        <ErrorState error={error} onRetry={onRetry} />
      ) : chartData.length === 0 ? (
        <EmptyState title="No data available" description="Top released products will appear here." />
      ) : (
        <BarChart
          data={chartData}
          dataKeys={["quantity"]}
          xKey="name"
          height={260}
          valueFormatter={(v) => formatNumber(v)}
          hideLegend
          labels={{ quantity: "Quantity Released" }}
        />
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
}

export function LowStockDistributionChart({
  data,
  loading,
  error,
  onRetry,
}: LowStockDistributionChartProps) {
  if (loading) {
    return <CardSkeleton className="h-[340px]" />;
  }

  const chartData: PieChartDataPoint[] =
    data?.map((d) => ({ name: d.name, value: d.count })) ?? [];

  return (
    <ChartCard
      title="Low Stock Distribution"
      description="Low stock items by category"
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
