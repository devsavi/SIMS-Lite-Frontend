/**
 * AdminKpiCards — unit tests
 */

import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminKpiCards } from "../components/kpi-cards/AdminKpiCards";
import type { DashboardStats } from "../types";

const mockStats: DashboardStats = {
  total_products: 1284,
  total_suppliers: 47,
  out_of_stock_count: 5,
  inventory_value: 245680.50,
  low_stock_count: 12,
  pending_purchase_orders: 8,
  pending_grns: 3,
  pending_stock_releases: 9,
  today_stock_releases: 2,
};

describe("AdminKpiCards", () => {
  it("renders all 8 KPI cards", () => {
    render(<AdminKpiCards stats={mockStats} />);
    expect(screen.getByText("Inventory Value")).toBeInTheDocument();
    expect(screen.getByText("Total Products")).toBeInTheDocument();
    expect(screen.getByText("Low Stock Items")).toBeInTheDocument();
    expect(screen.getByText("Out of Stock Items")).toBeInTheDocument();
    expect(screen.getByText("Total Suppliers")).toBeInTheDocument();
    expect(screen.getByText("Pending POs")).toBeInTheDocument();
    expect(screen.getByText("Pending GRNs")).toBeInTheDocument();
    expect(screen.getByText("Pending Releases")).toBeInTheDocument();
  });

  it("renders formatted values from stats", () => {
    render(<AdminKpiCards stats={mockStats} />);
    expect(screen.getByText("1,284")).toBeInTheDocument();
    expect(screen.getByText("47")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
  });

  it("renders skeleton state when loading", () => {
    const { container } = render(<AdminKpiCards loading />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders dashes when stats are undefined (not loading)", () => {
    render(<AdminKpiCards />);
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThan(0);
  });

  it("has an accessible label for the grid", () => {
    render(<AdminKpiCards stats={mockStats} />);
    const el = document.querySelector('[aria-label="Key performance indicators"]');
    expect(el).toBeTruthy();
  });
});
