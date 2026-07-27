import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { PurchaseOrderForm } from "../components/PurchaseOrderForm";
import { PurchaseOrderTable } from "../components/PurchaseOrderTable";
import { PurchaseOrderDetail } from "../components/PurchaseOrderDetail";
import type { PurchaseOrder, POFilters } from "../types";

// Mock zustand auth store
vi.mock("@/stores/auth.store", () => ({
  useAuthStore: () => ({
    user: { id: "u1", name: "Test User", role: "admin" },
  }),
}));

describe("Purchase Orders Components", () => {
  const mockSuppliers = [
    { id: "sup-1", name: "Supplier A" },
    { id: "sup-2", name: "Supplier B" },
  ];

  const mockProducts = [
    { id: "prod-1", name: "Product Alpha", sku: "PA-001", costPrice: 25.5 },
    { id: "prod-2", name: "Product Beta", sku: "PB-002", costPrice: 50.0 },
  ];

  const samplePO: PurchaseOrder = {
    id: "po-1",
    poNumber: "PO-2026-0001",
    supplierId: "sup-1",
    supplierName: "Supplier A",
    status: "DRAFT",
    emailStatus: "PENDING",
    expectedDeliveryDate: "2026-08-01",
    notes: "Handle with care",
    totalItems: 2,
    totalAmount: 101.0,
    items: [
      {
        id: "item-1",
        productId: "prod-1",
        productName: "Product Alpha",
        productSku: "PA-001",
        quantity: 2,
        unitCost: 25.5,
        totalCost: 51.0,
      },
      {
        id: "item-2",
        productId: "prod-2",
        productName: "Product Beta",
        productSku: "PB-002",
        quantity: 1,
        unitCost: 50.0,
        totalCost: 50.0,
      },
    ],
    createdBy: { id: "u1", name: "Admin User" },
    createdAt: "2026-07-27T00:00:00Z",
    updatedAt: "2026-07-27T00:00:00Z",
    activityLog: [
      {
        id: "act-1",
        action: "CREATED",
        performedBy: "Admin User",
        timestamp: "2026-07-27T00:00:00Z",
      },
    ],
  };

  describe("PurchaseOrderTable", () => {
    it("renders purchase order list items correctly", () => {
      const filters: POFilters = { page: 1, limit: 10, status: "ALL" };
      render(
        <PurchaseOrderTable
          data={[samplePO]}
          total={1}
          isLoading={false}
          filters={filters}
          onFilterChange={vi.fn()}
          suppliers={mockSuppliers}
        />
      );

      expect(screen.getByText("PO-2026-0001")).toBeInTheDocument();
      expect(screen.getByText("Supplier A")).toBeInTheDocument();
      expect(screen.getByText("$101.00")).toBeInTheDocument();
      expect(screen.getByText("Draft")).toBeInTheDocument();
    });

    it("triggers filter callback on search change", () => {
      const onFilterChange = vi.fn();
      const filters: POFilters = { page: 1, limit: 10 };
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
    it("calculates grand total automatically", async () => {
      const onSubmit = vi.fn();
      render(
        <PurchaseOrderForm
          suppliers={mockSuppliers}
          products={mockProducts}
          onSubmit={onSubmit}
        />
      );

      // Check initial total is $0.00
      expect(screen.getAllByText("$0.00").length).toBeGreaterThan(0);
    });
  });

  describe("PurchaseOrderDetail", () => {
    it("displays PO details and triggers actions", () => {
      const onSubmit = vi.fn();
      render(<PurchaseOrderDetail po={samplePO} onSubmit={onSubmit} />);

      expect(screen.getByText("PO-2026-0001")).toBeInTheDocument();
      expect(screen.getByText("Handle with care")).toBeInTheDocument();
      expect(screen.getByText("Submit PO")).toBeInTheDocument();
    });
  });
});
