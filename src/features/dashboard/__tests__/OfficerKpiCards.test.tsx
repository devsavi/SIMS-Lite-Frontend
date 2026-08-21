/**
 * OfficerKpiCards — unit tests
 */

import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OfficerKpiCards } from "../components/kpi-cards/OfficerKpiCards";

const mockStats = {
  total_products: 150,
  total_suppliers: 25,
  pending_purchase_orders: 8,
  pending_grns: 3,
  low_stock_count: 12,
  out_of_stock_count: 4,
};

describe("OfficerKpiCards", () => {
  it("renders all 6 KPI cards", () => {
    render(<OfficerKpiCards stats={mockStats} />);
    expect(screen.getByText("Total Products")).toBeInTheDocument();
    expect(screen.getByText("Total Suppliers")).toBeInTheDocument();
    expect(screen.getByText("Pending POs")).toBeInTheDocument();
    expect(screen.getByText("Pending GRNs")).toBeInTheDocument();
    expect(screen.getByText("Low Stock Items")).toBeInTheDocument();
    expect(screen.getByText("Out of Stock Items")).toBeInTheDocument();
  });

  it("renders skeleton when loading", () => {
    const { container } = render(<OfficerKpiCards loading />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
