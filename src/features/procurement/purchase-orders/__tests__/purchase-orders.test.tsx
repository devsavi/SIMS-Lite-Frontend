import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { PurchaseOrderForm } from "../components/PurchaseOrderForm";
import { PurchaseOrderTable } from "../components/PurchaseOrderTable";
import { PurchaseOrderDetail } from "../components/PurchaseOrderDetail";
import type { PurchaseOrder, PurchaseOrderListItem, POFilters } from "../types";

// Mock zustand auth store
vi.mock("@/stores/auth.store", () => ({
  useAuthStore: () => ({
    user: { id: "u1", name: "Test User", role: "admin" },
  }),
}));

// Mock settings store
vi.mock("@/stores/settings.store", () => ({
  useSystemSettingsStore: () => "USD",
}));

describe("Purchase Orders Components", () => {
  const mockSuppliers = [
    { id: "sup-1", name: "Supplier A" },
    { id: "sup-2", name: "Supplier B" },
  ];

  const mockProducts = [
    { id: "prod-1", name: "Product Alpha", sku: "PA-001", cost_price: 25.5 },
    { id: "prod-2", name: "Product Beta", sku: "PB-002", cost_price: 50.0 },
  ];

  const sampleSupplier = {
    id: "sup-1",
    supplier_code: "001",
    name: "Supplier A",
    email: "supplier@example.com",
    contact_person: "John Doe",
  };

  const sampleListItem: PurchaseOrderListItem = {
    id: "po-1",
    po_number: "PO-2026-0001",
    supplier: sampleSupplier,
    status: "DRAFT",
    order_date: "2026-07-27T00:00:00Z",
    expected_delivery_date: "2026-08-01T00:00:00Z",
    total_amount: 101.0,
    item_count: 2,
    created_at: "2026-07-27T00:00:00Z",
  };

  const samplePO: PurchaseOrder = {
    id: "po-1",
    po_number: "PO-2026-0001",
    supplier: sampleSupplier,
    status: "DRAFT",
    order_date: "2026-07-27T00:00:00Z",
    expected_delivery_date: "2026-08-01T00:00:00Z",
    subtotal: 101.0,
    tax_amount: 0,
    discount_amount: 0,
    total_amount: 101.0,
    notes: "Handle with care",
    terms_conditions: null,
    shipping_address: null,
    created_by: {
      id: "u1",
      first_name: "Admin",
      last_name: "User",
      email: "admin@example.com",
    },
    submitted_by: null,
    submitted_at: null,
    approved_by: null,
    approved_at: null,
    rejected_by: null,
    rejected_at: null,
    rejection_reason: null,
    cancelled_by: null,
    cancelled_at: null,
    cancellation_reason: null,
    email_sent_at: null,
    email_sent_to: null,
    items: [
      {
        id: "item-1",
        purchase_order_id: "po-1",
        product: {
          id: "prod-1",
          sku: "PA-001",
          name: "Product Alpha",
          barcode: "",
        },
        quantity_ordered: 2,
        unit_price: 25.5,
        discount_percent: 0,
        tax_percent: 0,
        line_total: 51.0,
        quantity_received: 0,
        notes: null,
        created_at: "2026-07-27T00:00:00Z",
        updated_at: "2026-07-27T00:00:00Z",
      },
      {
        id: "item-2",
        purchase_order_id: "po-1",
        product: {
          id: "prod-2",
          sku: "PB-002",
          name: "Product Beta",
          barcode: "",
        },
        quantity_ordered: 1,
        unit_price: 50.0,
        discount_percent: 0,
        tax_percent: 0,
        line_total: 50.0,
        quantity_received: 0,
        notes: null,
        created_at: "2026-07-27T00:00:00Z",
        updated_at: "2026-07-27T00:00:00Z",
      },
    ],
    created_at: "2026-07-27T00:00:00Z",
    updated_at: "2026-07-27T00:00:00Z",
  };

  describe("PurchaseOrderTable", () => {
    it("renders purchase order list items correctly", () => {
      const filters: POFilters = { page: 1, size: 20, status: "ALL" };
      render(
        <PurchaseOrderTable
          data={[sampleListItem]}
          total={1}
          isLoading={false}
          filters={filters}
          onFilterChange={vi.fn()}
          suppliers={mockSuppliers}
        />
      );

      expect(screen.getByText("PO-2026-0001")).toBeInTheDocument();
      expect(screen.getByText("Supplier A")).toBeInTheDocument();
      expect(screen.getByText("Draft")).toBeInTheDocument();
    });

    it("triggers filter callback on search change", () => {
      const onFilterChange = vi.fn();
      const filters: POFilters = { page: 1, size: 20 };
      render(
        <PurchaseOrderTable
          data={[]}
          total={0}
          isLoading={false}
          filters={filters}
          onFilterChange={onFilterChange}
        />
      );

      const searchInput = screen.getByPlaceholderText("Search PO number...");
      fireEvent.change(searchInput, { target: { value: "PO-999" } });

      expect(onFilterChange).toHaveBeenCalledWith({
        search: "PO-999",
        page: 1,
      });
    });
  });

  describe("PurchaseOrderForm", () => {
    it("renders the form without crashing", () => {
      const onSubmit = vi.fn();
      render(
        <PurchaseOrderForm
          suppliers={mockSuppliers}
          products={mockProducts}
          onSubmit={onSubmit}
        />
      );

      expect(
        screen.getByPlaceholderText("Select supplier")
      ).toBeInTheDocument();
    });
  });

  describe("PurchaseOrderDetail", () => {
    it("displays PO details and submit action", () => {
      const onSubmit = vi.fn();
      render(<PurchaseOrderDetail po={samplePO} onSubmit={onSubmit} />);

      expect(screen.getByText("PO-2026-0001")).toBeInTheDocument();
      expect(screen.getByText("Handle with care")).toBeInTheDocument();
      expect(screen.getByText("Submit PO")).toBeInTheDocument();
    });
  });
});
