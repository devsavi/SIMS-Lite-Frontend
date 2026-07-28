import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StockReleaseForm } from "../components/release-form/StockReleaseForm";
import { useInventoryList } from "@/features/inventory/hooks/use-inventory";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock inventory list hook
vi.mock("@/features/inventory/hooks/use-inventory", () => ({
  useInventoryList: vi.fn(),
}));

const mockProducts = [
  {
    id: "inv-1",
    quantity_on_hand: 50,
    average_cost: 10,
    stock_value: 500,
    last_updated_at: "2026-07-28T00:00:00Z",
    last_transaction_type: "INITIAL",
    created_at: "2026-07-28T00:00:00Z",
    updated_at: "2026-07-28T00:00:00Z",
    product: {
      id: "prod-1",
      name: "Safety Helmet",
      sku: "SH-001",
      barcode: "123",
      reorder_level: 5,
      cost_price: 10,
      selling_price: 20,
      uom_code: "pcs",
    },
  },
  {
    id: "inv-2",
    quantity_on_hand: 10,
    average_cost: 5,
    stock_value: 50,
    last_updated_at: "2026-07-28T00:00:00Z",
    last_transaction_type: "INITIAL",
    created_at: "2026-07-28T00:00:00Z",
    updated_at: "2026-07-28T00:00:00Z",
    product: {
      id: "prod-2",
      name: "Work Gloves",
      sku: "WG-002",
      barcode: "456",
      reorder_level: 2,
      cost_price: 5,
      selling_price: 10,
      uom_code: "pairs",
    },
  },
];

const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "TestWrapper";
  return Wrapper;
};

describe("StockReleaseForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useInventoryList).mockReturnValue({
      data: { data: mockProducts },
      isLoading: false,
    } as any);
  });

  it("renders form fields and submit buttons", () => {
    render(<StockReleaseForm onSubmit={vi.fn()} mode="create" />, {
      wrapper: createTestWrapper(),
    });

    expect(screen.getByText("Create Stock Release")).toBeInTheDocument();
    expect(screen.getByLabelText("Release Date")).toBeInTheDocument();
    expect(screen.getByText("Save Draft")).toBeInTheDocument();
    expect(screen.getByText("Submit for Approval")).toBeInTheDocument();
  });

  it("allows adding and removing dynamic item rows", async () => {
    render(<StockReleaseForm onSubmit={vi.fn()} mode="create" />, {
      wrapper: createTestWrapper(),
    });

    const addButtons = screen.getAllByText("Add Item");
    fireEvent.click(addButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("(2 items)")).toBeInTheDocument();
    });
  });

  it("calculates live total quantity preview", () => {
    render(<StockReleaseForm onSubmit={vi.fn()} mode="create" />, {
      wrapper: createTestWrapper(),
    });

    expect(screen.getByText("Total Released Qty: 1")).toBeInTheDocument();
  });
});
