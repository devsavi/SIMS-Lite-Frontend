import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
    grn_number: "GRN-2026-0001",
    purchase_order_id: "po-1",
    po_number: "PO-2026-0001",
    supplier: {
      id: "sup-1",
      supplier_code: "001",
      name: "Supplier A",
      email: "supplier@example.com",
      contact_person: "John Doe",
    },
    status: "SUBMITTED",
    received_date: "2026-07-27T00:00:00Z",
    delivery_note_number: "DN-001",
    notes: "All items in good condition",
    created_by: {
      id: "u1",
      first_name: "Test",
      last_name: "Storekeeper",
      email: "storekeeper@example.com",
    },
    submitted_by: {
      id: "u1",
      first_name: "Test",
      last_name: "Storekeeper",
      email: "storekeeper@example.com",
    },
    submitted_at: "2026-07-27T01:00:00Z",
    approved_by: null,
    approved_at: null,
    cancelled_by: null,
    cancelled_at: null,
    cancellation_reason: null,
    document_path: null,
    document_original_name: null,
    items: [
      {
        id: "gi-1",
        grn_id: "grn-1",
        po_item_id: "poi-1",
        product: {
          id: "prod-1",
          sku: "PA-001",
          name: "Product Alpha",
          barcode: "123456789",
        },
        quantity_received: 10,
        unit_cost: 5.0,
        notes: null,
        created_at: "2026-07-27T00:00:00Z",
        updated_at: "2026-07-27T00:00:00Z",
      },
    ],
    created_at: "2026-07-27T00:00:00Z",
    updated_at: "2026-07-27T00:00:00Z",
  };

  describe("GRNTable", () => {
    it("renders GRN table rows and headers correctly", () => {
      const filters: GRNFilters = { page: 1, size: 20, status: "ALL" };
      render(
        <GRNTable
          data={[sampleGRN]}
          total={1}
          pages={1}
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
    it("renders GRN detail fields and item list", () => {
      render(<GRNDetail grn={sampleGRN} />);

      expect(screen.getByText("GRN-2026-0001")).toBeInTheDocument();
      expect(screen.getByText("PO-2026-0001")).toBeInTheDocument();
      expect(screen.getByText("All items in good condition")).toBeInTheDocument();
      expect(screen.getByText("Product Alpha")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
    });

    it("shows cancellation details when GRN is cancelled", () => {
      const cancelledGRN: GoodsReceivedNote = {
        ...sampleGRN,
        status: "CANCELLED",
        cancelled_by: {
          id: "u2",
          first_name: "Admin",
          last_name: "User",
          email: "admin@example.com",
        },
        cancelled_at: "2026-07-28T10:00:00Z",
        cancellation_reason: "Wrong delivery",
      };
      render(<GRNDetail grn={cancelledGRN} />);

      expect(screen.getByText("Cancellation Details")).toBeInTheDocument();
      expect(screen.getByText("Wrong delivery")).toBeInTheDocument();
    });
  });
});
