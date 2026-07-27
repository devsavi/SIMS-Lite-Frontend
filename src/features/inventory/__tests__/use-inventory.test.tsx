import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useInventoryList,
  useInventorySummary,
  useInventoryDetail,
  inventoryKeys,
} from "../hooks/use-inventory";
import { inventoryApi } from "../api/inventory-api";
import type { InventoryItem, InventorySummary } from "../types";

vi.mock("../api/inventory-api", () => ({
  inventoryApi: {
    getInventoryList: vi.fn(),
    getInventorySummary: vi.fn(),
    getInventoryValuation: vi.fn(),
    getInventoryByProductId: vi.fn(),
    getLedgerEntries: vi.fn(),
    getLedgerByProduct: vi.fn(),
    createStockAdjustment: vi.fn(),
    submitStockAdjustment: vi.fn(),
    approveStockAdjustment: vi.fn(),
    cancelStockAdjustment: vi.fn(),
  },
}));

const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "TestWrapper";
  return Wrapper;
};

const mockSummary: InventorySummary = {
  total_products: 100,
  total_products_in_stock: 85,
  total_out_of_stock: 5,
  total_low_stock: 10,
  total_quantity_on_hand: 5000,
  total_stock_value: 125000,
};

const mockInventoryItem: InventoryItem = {
  id: "inv-1",
  product: {
    id: "prod-1",
    name: "Widget A",
    sku: "WID-001",
    barcode: "123456789",
    reorder_level: 10,
    cost_price: 5.0,
    selling_price: 12.0,
  },
  quantity_on_hand: 50,
  average_cost: 5.0,
  stock_value: 250.0,
  last_updated_at: "2026-07-27T05:00:00Z",
  last_transaction_type: "GRN_RECEIPT",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-07-27T05:00:00Z",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("inventory query key factory", () => {
  it("generates correct query keys", () => {
    expect(inventoryKeys.all).toEqual(["inventory"]);
    expect(inventoryKeys.lists()).toEqual(["inventory", "list"]);
    expect(inventoryKeys.summary()).toEqual(["inventory", "summary"]);
    expect(inventoryKeys.detail("prod-1")).toEqual([
      "inventory",
      "detail",
      "prod-1",
    ]);
  });
});

describe("useInventorySummary", () => {
  it("fetches and returns inventory summary data", async () => {
    vi.mocked(inventoryApi.getInventorySummary).mockResolvedValue(mockSummary);
    const wrapper = createTestWrapper();
    const { result } = renderHook(() => useInventorySummary(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.total_products).toBe(100);
    expect(result.current.data?.total_out_of_stock).toBe(5);
  });

  it("returns error state when API fails", async () => {
    vi.mocked(inventoryApi.getInventorySummary).mockRejectedValue(
      new Error("Network error")
    );
    const wrapper = createTestWrapper();
    const { result } = renderHook(() => useInventorySummary(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useInventoryList", () => {
  it("fetches and returns paginated inventory list", async () => {
    vi.mocked(inventoryApi.getInventoryList).mockResolvedValue({
      data: [mockInventoryItem],
      pagination: { page: 1, size: 20, total: 1, pages: 1 },
    });
    const wrapper = createTestWrapper();
    const { result } = renderHook(
      () => useInventoryList({ page: 1, size: 20 }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.data[0].product?.name).toBe("Widget A");
    expect(result.current.data?.pagination.total).toBe(1);
  });

  it("passes filter params to API", async () => {
    vi.mocked(inventoryApi.getInventoryList).mockResolvedValue({
      data: [],
      pagination: { page: 1, size: 20, total: 0, pages: 0 },
    });
    const wrapper = createTestWrapper();
    renderHook(
      () =>
        useInventoryList({
          page: 1,
          size: 20,
          search: "widget",
          stock_status: "low_stock",
        }),
      { wrapper }
    );

    await waitFor(() =>
      expect(inventoryApi.getInventoryList).toHaveBeenCalledWith(
        expect.objectContaining({ search: "widget" })
      )
    );
  });
});

describe("useInventoryDetail", () => {
  it("fetches single inventory item by product ID", async () => {
    vi.mocked(inventoryApi.getInventoryByProductId).mockResolvedValue(
      mockInventoryItem
    );
    const wrapper = createTestWrapper();
    const { result } = renderHook(() => useInventoryDetail("prod-1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.product?.sku).toBe("WID-001");
    expect(result.current.data?.quantity_on_hand).toBe(50);
  });

  it("does not fetch when productId is empty string", () => {
    vi.mocked(inventoryApi.getInventoryByProductId).mockResolvedValue(
      mockInventoryItem
    );
    const wrapper = createTestWrapper();
    const { result } = renderHook(() => useInventoryDetail(""), { wrapper });
    // Query is disabled so it stays in pending/idle state
    expect(result.current.fetchStatus).toBe("idle");
  });
});
