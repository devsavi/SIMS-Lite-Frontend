import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { ReleaseTable } from "../components/release-table/ReleaseTable";
import type { StockRelease } from "../types/stock-release-types";

const mockReleases: StockRelease[] = [
  {
    id: "rel-101",
    release_number: "REL-2026-0001",
    release_date: "2026-07-28T00:00:00Z",
    status: "submitted",
    requested_by: "John Storekeeper",
    requested_by_user: {
      id: "u-1",
      full_name: "John Storekeeper",
      email: "john@store.com",
    },
    approved_by: null,
    total_items: 2,
    total_quantity: 45,
    items: [
      {
        id: "item-1",
        product_id: "prod-1",
        product_name: "Safety Helmet",
        sku: "SH-001",
        quantity: 20,
        unit_of_measure: "pcs",
      },
      {
        id: "item-2",
        product_id: "prod-2",
        product_name: "Work Gloves",
        sku: "WG-002",
        quantity: 25,
        unit_of_measure: "pairs",
      },
    ],
    notes: "Site construction release",
    created_at: "2026-07-28T00:00:00Z",
    updated_at: "2026-07-28T00:00:00Z",
  },
  {
    id: "rel-102",
    release_number: "REL-2026-0002",
    release_date: "2026-07-27T00:00:00Z",
    status: "approved",
    requested_by: "Alice Officer",
    approved_by: "Manager Smith",
    approved_by_user: {
      id: "u-2",
      full_name: "Manager Smith",
      email: "smith@store.com",
    },
    total_items: 1,
    total_quantity: 100,
    items: [],
    notes: "Monthly inventory release",
    created_at: "2026-07-27T00:00:00Z",
    updated_at: "2026-07-27T00:00:00Z",
  },
];

describe("ReleaseTable", () => {
  it("renders stock release numbers and statuses", () => {
    render(
      <ReleaseTable
        data={mockReleases}
        page={1}
        pageSize={20}
        totalRecords={2}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />
    );

    expect(screen.getByText("REL-2026-0001")).toBeInTheDocument();
    expect(screen.getByText("REL-2026-0002")).toBeInTheDocument();
    expect(screen.getByText("Submitted")).toBeInTheDocument();
    expect(screen.getByText("Approved")).toBeInTheDocument();
  }, 15000);

  it("renders requester and approver names correctly", () => {
    render(
      <ReleaseTable
        data={mockReleases}
        page={1}
        pageSize={20}
        totalRecords={2}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />
    );

    expect(screen.getByText("John Storekeeper")).toBeInTheDocument();
    expect(screen.getByText("Manager Smith")).toBeInTheDocument();
  });

  it("renders empty state when no data is provided", () => {
    render(
      <ReleaseTable
        data={[]}
        page={1}
        pageSize={20}
        totalRecords={0}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />
    );

    expect(screen.getByText("No stock releases found")).toBeInTheDocument();
  });
});
