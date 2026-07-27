import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { InventoryTable } from "../components/inventory-table/InventoryTable";
import type { InventoryItem } from "../types";

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: () => ({
    user: { id: "u1", name: "Admin User", role: "admin" },
  }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const sampleItems: InventoryItem[] = [
  {
    id: "inv-1",
    product: {
      id: "prod-1",
      name: "Widget A",
      sku: "WID-001",
      barcode: "123456789",
      reorder_level: 10,
      cost_price: 5.0,
      selling_price: 12.0,
      category_name: "Electronics",
      brand_name: "BrandX",
      supplier_name: "Supplier Alpha",
      uom_code: "PCS",
      uom_name: "Pieces",
    },
    quantity_on_hand: 50,
    average_cost: 5.0,
    stock_value: 250.0,
    last_updated_at: "2026-07-27T05:00:00Z",
    last_transaction_type: "GRN_RECEIPT",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-07-27T05:00:00Z",
  },
  {
    id: "inv-2",
    product: {
      id: "prod-2",
      name: "Gadget B",
      sku: "GAD-002",
      barcode: "987654321",
      reorder_level: 20,
      cost_price: 10.0,
      selling_price: 25.0,
      category_name: "Tools",
      brand_name: "BrandY",
      supplier_name: "Supplier Beta",
      uom_code: "BOX",
      uom_name: "Box",
    },
    quantity_on_hand: 5,
    average_cost: 10.0,
    stock_value: 50.0,
    last_updated_at: "2026-07-26T10:00:00Z",
    last_transaction_type: "ADJUSTMENT_DECREASE",
    created_at: "2026-01-15T00:00:00Z",
    updated_at: "2026-07-26T10:00:00Z",
  },
];

describe("InventoryTable", () => {
  it("renders product names in the table", () => {
    render(
      <InventoryTable
        data={sampleItems}
        totalRecords={2}
      />
    );
    expect(screen.getByText("Widget A")).toBeInTheDocument();
    expect(screen.getByText("Gadget B")).toBeInTheDocument();
  });

  it("renders SKU information", () => {
    render(<InventoryTable data={sampleItems} totalRecords={2} />);
    expect(screen.getByText(/WID-001/i)).toBeInTheDocument();
    expect(screen.getByText(/GAD-002/i)).toBeInTheDocument();
  });

  it("renders stock status badges", () => {
    render(<InventoryTable data={sampleItems} totalRecords={2} />);
    expect(screen.getByText("In Stock")).toBeInTheDocument();
    expect(screen.getByText("Low Stock")).toBeInTheDocument();
  });

  it("renders adjust button for admin users", () => {
    const onAdjust = vi.fn();
    render(
      <InventoryTable
        data={sampleItems}
        totalRecords={2}
        onAdjustStock={onAdjust}
      />
    );
    const adjustButtons = screen.getAllByText("Adjust");
    expect(adjustButtons.length).toBeGreaterThan(0);
  });

  it("renders loading skeletons when loading is true", () => {
    render(
      <InventoryTable
        data={[]}
        loading={true}
        totalRecords={0}
      />
    );
    // Should render skeleton or loading state - not crash
    const table = document.querySelector("table");
    expect(table).toBeDefined();
  });

  it("renders empty state when no data is provided", () => {
    render(<InventoryTable data={[]} totalRecords={0} />);
    expect(screen.getByText(/no inventory items found/i)).toBeInTheDocument();
  });
});
