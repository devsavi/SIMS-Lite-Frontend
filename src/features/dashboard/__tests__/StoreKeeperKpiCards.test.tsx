/**
 * StoreKeeperKpiCards — unit tests
 */

import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StoreKeeperKpiCards } from "../components/kpi-cards/StoreKeeperKpiCards";

const mockStats = {
  total_products: 150,
  total_suppliers: 25,
  pending_grns: 3,
  pending_stock_releases: 7,
  low_stock_count: 12,
};

describe("StoreKeeperKpiCards", () => {
  it("renders all 5 KPI cards", () => {
    render(<StoreKeeperKpiCards stats={mockStats} />);
    expect(screen.getByText("Total Products")).toBeInTheDocument();
    expect(screen.getByText("Total Suppliers")).toBeInTheDocument();
    expect(screen.getByText("Pending GRNs")).toBeInTheDocument();
    expect(screen.getByText("Pending Releases")).toBeInTheDocument();
    expect(screen.getByText("Low Stock Items")).toBeInTheDocument();
  });

  it("displays formatted numbers", () => {
    render(<StoreKeeperKpiCards stats={mockStats} />);
    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("renders skeleton when loading", () => {
    const { container } = render(<StoreKeeperKpiCards loading />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
