import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { ReleaseTable } from "../components/release-table/ReleaseTable";
import type { StockReleaseSummary } from "../types/stock-release-types";

const mockReleases: StockReleaseSummary[] = [
  {
    id: "rel-101",
    release_number: "REL-2026-0001",
    purpose: "INTERNAL_USE",
    release_date: "2026-07-28T00:00:00Z",
    status: "SUBMITTED",
    total_quantity: 45,
    total_cost: 0,
    item_count: 2,
    created_by: {
      id: "u-1",
      first_name: "John",
      last_name: "Storekeeper",
      email: "john@store.com",
    },
    created_at: "2026-07-28T00:00:00Z",
  },
  {
    id: "rel-102",
    release_number: "REL-2026-0002",
    purpose: "PRODUCTION",
    release_date: "2026-07-27T00:00:00Z",
    status: "APPROVED",
    total_quantity: 100,
    total_cost: 500,
    item_count: 1,
    created_by: {
      id: "u-2",
      first_name: "Alice",
      last_name: "Officer",
      email: "alice@store.com",
    },
    created_at: "2026-07-27T00:00:00Z",
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

  it("renders creator names correctly", () => {
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
    expect(screen.getByText("Alice Officer")).toBeInTheDocument();
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
