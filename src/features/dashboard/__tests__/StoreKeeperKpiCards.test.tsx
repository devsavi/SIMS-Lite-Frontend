/**
 * StoreKeeperKpiCards — unit tests
 */

import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StoreKeeperKpiCards } from "../components/kpi-cards/StoreKeeperKpiCards";

const mockStats = {
  total_inventory_items: 5320,
  low_stock_count: 12,
  today_stock_releases: 4,
};

describe("StoreKeeperKpiCards", () => {
  it("renders all 3 KPI cards", () => {
    render(<StoreKeeperKpiCards stats={mockStats} />);
    expect(screen.getByText("Current Inventory")).toBeInTheDocument();
    expect(screen.getByText("Low Stock Products")).toBeInTheDocument();
    expect(screen.getByText("Today's Releases")).toBeInTheDocument();
  });

  it("displays formatted numbers", () => {
    render(<StoreKeeperKpiCards stats={mockStats} />);
    expect(screen.getByText("5,320")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("renders skeleton when loading", () => {
    const { container } = render(<StoreKeeperKpiCards loading />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
