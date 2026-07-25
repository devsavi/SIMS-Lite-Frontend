/**
 * DashboardCharts — unit tests
 * Covers empty states, loading skeletons, and chart rendering.
 */

import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  InventoryValueTrendChart,
  MonthlyPurchaseOrdersChart,
  MonthlyStockReleasesChart,
  LowStockDistributionChart,
} from "../components/charts/DashboardCharts";
import type { MonthlyDataPoint, LowStockCategory } from "../types";

// Recharts uses ResizeObserver as a constructor — must be a real function/class
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

const monthlyData: MonthlyDataPoint[] = [
  { month: "Jan", value: 12000 },
  { month: "Feb", value: 18000 },
  { month: "Mar", value: 15000 },
];

const lowStockCategories: LowStockCategory[] = [
  { name: "Medicines", count: 8 },
  { name: "Equipment", count: 3 },
];

// ---------------------------------------------------------------------------
// InventoryValueTrendChart
// ---------------------------------------------------------------------------

describe("InventoryValueTrendChart", () => {
  it("shows empty state when data is empty", () => {
    render(<InventoryValueTrendChart data={[]} />);
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("shows loading skeleton when loading", () => {
    const { container } = render(<InventoryValueTrendChart loading />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("renders chart title", () => {
    render(<InventoryValueTrendChart data={monthlyData} />);
    expect(screen.getByText("Inventory Value Trend")).toBeInTheDocument();
  });

  it("shows error state on error", () => {
    const onRetry = vi.fn();
    render(<InventoryValueTrendChart error={new Error("fail")} onRetry={onRetry} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// MonthlyPurchaseOrdersChart
// ---------------------------------------------------------------------------

describe("MonthlyPurchaseOrdersChart", () => {
  it("shows empty state when data is empty", () => {
    render(<MonthlyPurchaseOrdersChart data={[]} />);
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("renders chart title", () => {
    render(<MonthlyPurchaseOrdersChart data={monthlyData} />);
    expect(screen.getByText("Monthly Purchase Orders")).toBeInTheDocument();
  });

  it("shows loading skeleton", () => {
    const { container } = render(<MonthlyPurchaseOrdersChart loading />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// MonthlyStockReleasesChart
// ---------------------------------------------------------------------------

describe("MonthlyStockReleasesChart", () => {
  it("shows empty state when data is empty", () => {
    render(<MonthlyStockReleasesChart data={[]} />);
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("renders chart title", () => {
    render(<MonthlyStockReleasesChart data={monthlyData} />);
    expect(screen.getByText("Monthly Stock Releases")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// LowStockDistributionChart
// ---------------------------------------------------------------------------

describe("LowStockDistributionChart", () => {
  it("shows empty state when no data", () => {
    render(<LowStockDistributionChart data={[]} />);
    expect(screen.getByText("No low stock items")).toBeInTheDocument();
  });

  it("renders chart title", () => {
    render(<LowStockDistributionChart data={lowStockCategories} />);
    expect(screen.getByText("Low Stock Distribution")).toBeInTheDocument();
  });
});
