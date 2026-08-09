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
  TopReleasedProductsChart,
} from "../components/charts/DashboardCharts";
import type { MonthlyDataPoint, LowStockCategory, TopReleasedProduct } from "../types";

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

const topReleasedProducts: TopReleasedProduct[] = [
  { product_id: "p1", product_name: "Amoxicillin", product_code: "MED-001", quantity: 500 },
  { product_id: "p2", product_name: "Syringes", product_code: "EQUIP-002", quantity: 350 },
];

// ---------------------------------------------------------------------------
// InventoryValueTrendChart
// ---------------------------------------------------------------------------

describe("InventoryValueTrendChart", () => {
  it("shows empty state when data is empty", () => {
    render(<InventoryValueTrendChart year={2026} onYearChange={() => {}} data={[]} />);
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("shows loading skeleton when loading", () => {
    const { container } = render(<InventoryValueTrendChart year={2026} onYearChange={() => {}} loading />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("renders chart title", () => {
    render(<InventoryValueTrendChart year={2026} onYearChange={() => {}} data={monthlyData} />);
    expect(screen.getByText("Inventory Value Trend")).toBeInTheDocument();
  });

  it("shows error state on error", () => {
    const onRetry = vi.fn();
    render(<InventoryValueTrendChart year={2026} onYearChange={() => {}} error={new Error("fail")} onRetry={onRetry} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// MonthlyPurchaseOrdersChart
// ---------------------------------------------------------------------------

describe("MonthlyPurchaseOrdersChart", () => {
  it("shows empty state when data is empty", () => {
    render(<MonthlyPurchaseOrdersChart year={2026} onYearChange={() => {}} data={[]} />);
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("renders chart title", () => {
    render(<MonthlyPurchaseOrdersChart year={2026} onYearChange={() => {}} data={monthlyData} />);
    expect(screen.getByText("Monthly Purchase Orders")).toBeInTheDocument();
  });

  it("shows loading skeleton", () => {
    const { container } = render(<MonthlyPurchaseOrdersChart year={2026} onYearChange={() => {}} loading />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// MonthlyStockReleasesChart
// ---------------------------------------------------------------------------

describe("MonthlyStockReleasesChart", () => {
  it("shows empty state when data is empty", () => {
    render(<MonthlyStockReleasesChart year={2026} onYearChange={() => {}} data={[]} />);
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("renders chart title", () => {
    render(<MonthlyStockReleasesChart year={2026} onYearChange={() => {}} data={monthlyData} />);
    expect(screen.getByText("Monthly Stock Releases")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// TopReleasedProductsChart
// ---------------------------------------------------------------------------

describe("TopReleasedProductsChart", () => {
  it("shows empty state when data is empty", () => {
    render(<TopReleasedProductsChart year={2026} onYearChange={() => {}} data={[]} />);
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("renders chart title and pyramid items", () => {
    render(<TopReleasedProductsChart year={2026} onYearChange={() => {}} data={topReleasedProducts} />);
    expect(screen.getByText("Top Released Products")).toBeInTheDocument();
    expect(screen.getByText(/amoxicillin/i)).toBeInTheDocument();
    expect(screen.getByText(/syringes/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// LowStockDistributionChart
// ---------------------------------------------------------------------------

describe("LowStockDistributionChart", () => {
  it("shows empty state when no data", () => {
    render(<LowStockDistributionChart year={2026} onYearChange={() => {}} data={[]} />);
    expect(screen.getByText("No low stock items")).toBeInTheDocument();
  });

  it("renders chart title", () => {
    render(<LowStockDistributionChart year={2026} onYearChange={() => {}} data={lowStockCategories} />);
    expect(screen.getByText("Low Stock Distribution")).toBeInTheDocument();
  });
});

