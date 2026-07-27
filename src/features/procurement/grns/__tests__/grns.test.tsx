import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { GRNTable } from "../components/GRNTable";
import { GRNDetail } from "../components/GRNDetail";
import type { GoodsReceivedNote, GRNFilters } from "../types";

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: () => ({
    user: { id: "u1", name: "Test Storekeeper", role: "stock_clerk" },
  }),
}));

describe("GRN Components", () => {
  const sampleGRN: GoodsReceivedNote = {
    id: "grn-1",
    grnNumber: "GRN-2026-0001",
    purchaseOrderId: "po-1",
    poNumber: "PO-2026-0001",
    supplierId: "sup-1",
    supplierName: "Supplier A",
    receivedBy: { id: "u1", name: "Test Storekeeper" },
    receivedDate: "2026-07-27T00:00:00Z",
    status: "SUBMITTED",
    notes: "All items in good condition",
    items: [
      {
        id: "gi-1",
        productId: "prod-1",
        productName: "Product Alpha",
        productSku: "PA-001",
        orderedQuantity: 10,
        receivedQuantity: 10,
        remainingQuantity: 0,
      },
    ],
    inventoryImpact: [
      {
        productId: "prod-1",
        productName: "Product Alpha",
        productSku: "PA-001",
        previousQuantity: 50,
        addedQuantity: 10,
        newQuantity: 60,
      },
    ],
    createdAt: "2026-07-27T00:00:00Z",
    updatedAt: "2026-07-27T00:00:00Z",
  };

  describe("GRNTable", () => {
    it("renders GRN table rows and headers correctly", () => {
      const filters: GRNFilters = { page: 1, limit: 10, status: "ALL" };
      render(
        <GRNTable
          data={[sampleGRN]}
          total={1}
          isLoading={false}
          filters={filters}
          onFilterChange={vi.fn()}
        />
      );

      expect(screen.getByText("GRN-2026-0001")).toBeInTheDocument();
      expect(screen.getByText("PO-2026-0001")).toBeInTheDocument();
      expect(screen.getByText("Supplier A")).toBeInTheDocument();
      expect(screen.getByText("Test Storekeeper")).toBeInTheDocument();
    });
  });

  describe("GRNDetail", () => {
    it("renders GRN detail fields and inventory impact summary", () => {
      render(<GRNDetail grn={sampleGRN} />);

      expect(screen.getByText("GRN-2026-0001")).toBeInTheDocument();
      expect(screen.getByText("PO-2026-0001")).toBeInTheDocument();
      expect(screen.getByText("All items in good condition")).toBeInTheDocument();
      expect(screen.getByText("Inventory Impact Summary")).toBeInTheDocument();
      expect(screen.getByText("+10")).toBeInTheDocument();
      expect(screen.getByText("60")).toBeInTheDocument();
    });
  });
});
