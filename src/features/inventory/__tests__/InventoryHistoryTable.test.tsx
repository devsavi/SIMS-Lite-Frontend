import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { InventoryHistoryTable } from "../components/inventory-history/InventoryHistoryTable";
import type { InventoryLedgerEntry } from "../types";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const sampleLedgerEntries: InventoryLedgerEntry[] = [
  {
    id: "ledger-1",
    product: {
      id: "prod-1",
      name: "Widget A",
      sku: "WID-001",
      barcode: "123456789",
      reorder_level: 10,
      cost_price: 5.0,
      selling_price: 12.0,
    },
    entry_type: "GRN_RECEIPT",
    quantity_before: 40,
    quantity_change: 10,
    quantity_after: 50,
    unit_cost: 5.0,
    reference_type: "GRN",
    reference_id: "grn-1",
    reference_number: "GRN-2026-0001",
    notes: "Regular weekly replenishment",
    created_by: {
      id: "u1",
      first_name: "John",
      last_name: "Smith",
      email: "john@example.com",
    },
    created_at: "2026-07-27T09:00:00Z",
  },
  {
    id: "ledger-2",
    product: {
      id: "prod-1",
      name: "Widget A",
      sku: "WID-001",
      barcode: "123456789",
      reorder_level: 10,
      cost_price: 5.0,
      selling_price: 12.0,
    },
    entry_type: "ADJUSTMENT_DECREASE",
    quantity_before: 50,
    quantity_change: -3,
    quantity_after: 47,
    unit_cost: 5.0,
    reference_type: null,
    reference_id: null,
    reference_number: null,
    notes: "Damaged items removed",
    created_by: null,
    created_at: "2026-07-26T15:30:00Z",
  },
];

describe("InventoryHistoryTable", () => {
  it("renders ledger entries", () => {
    render(
      <InventoryHistoryTable
        data={sampleLedgerEntries}
        totalRecords={2}
      />
    );
    expect(screen.getByText("GRN Receipt")).toBeInTheDocument();
    expect(screen.getByText("Adjustment (-)")).toBeInTheDocument();
  });

  it("renders quantity changes with correct sign formatting", () => {
    render(
      <InventoryHistoryTable
        data={sampleLedgerEntries}
        totalRecords={2}
      />
    );
    expect(screen.getByText("+10")).toBeInTheDocument();
    expect(screen.getByText("-3")).toBeInTheDocument();
  });

  it("renders reference document link for GRN entries", () => {
    render(
      <InventoryHistoryTable
        data={sampleLedgerEntries}
        totalRecords={2}
      />
    );
    const grnLink = screen.getByText("GRN-2026-0001");
    expect(grnLink).toBeInTheDocument();
  });

  it("renders 'System' when created_by is null", () => {
    render(
      <InventoryHistoryTable
        data={[sampleLedgerEntries[1]]}
        totalRecords={1}
      />
    );
    expect(screen.getByText("System")).toBeInTheDocument();
  });

  it("renders balance after column correctly", () => {
    render(
      <InventoryHistoryTable
        data={sampleLedgerEntries}
        totalRecords={2}
      />
    );
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("47")).toBeInTheDocument();
  });

  it("renders empty state when no data is provided", () => {
    render(<InventoryHistoryTable data={[]} totalRecords={0} />);
    expect(screen.getByText(/no ledger movements recorded/i)).toBeInTheDocument();
  });

  it("hides product column when hideProductColumn is true", () => {
    render(
      <InventoryHistoryTable
        data={sampleLedgerEntries}
        totalRecords={2}
        hideProductColumn
      />
    );
    expect(screen.queryByText("Widget A")).not.toBeInTheDocument();
  });
});
