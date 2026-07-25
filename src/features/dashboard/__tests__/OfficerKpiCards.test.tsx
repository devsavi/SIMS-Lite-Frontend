/**
 * OfficerKpiCards — unit tests
 */

import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OfficerKpiCards } from "../components/kpi-cards/OfficerKpiCards";

const mockStats = {
  pending_purchase_orders: 8,
  pending_grns: 3,
  inventory_value: 245680.50,
  low_stock_count: 12,
};

describe("OfficerKpiCards", () => {
  it("renders all 4 KPI cards", () => {
    render(<OfficerKpiCards stats={mockStats} />);
    expect(screen.getByText("Pending POs")).toBeInTheDocument();
    expect(screen.getByText("Pending GRNs")).toBeInTheDocument();
    expect(screen.getByText("Inventory Value")).toBeInTheDocument();
    expect(screen.getByText("Low Stock Items")).toBeInTheDocument();
  });

  it("renders skeleton when loading", () => {
    const { container } = render(<OfficerKpiCards loading />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
