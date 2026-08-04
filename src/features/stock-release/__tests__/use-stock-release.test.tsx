import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useStockReleaseList,
  useStockReleaseDetail,
  stockReleaseKeys,
} from "../hooks/use-stock-release";
import { stockReleaseApi } from "../api/stock-release-api";
import type { StockRelease, StockReleaseSummary } from "../types/stock-release-types";

vi.mock("../api/stock-release-api", () => ({
  stockReleaseApi: {
    getStockReleases: vi.fn(),
    getStockReleaseById: vi.fn(),
    createStockRelease: vi.fn(),
    updateStockRelease: vi.fn(),
    deleteStockRelease: vi.fn(),
    submitStockRelease: vi.fn(),
    approveStockRelease: vi.fn(),
    cancelStockRelease: vi.fn(),
  },
}));

vi.mock("@/app/components/ui/use-toast", () => ({
  toast: vi.fn(),
}));

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

const mockSummary: StockReleaseSummary = {
  id: "rel-1",
  release_number: "REL-001",
  purpose: "INTERNAL_USE",
  release_date: "2026-07-28",
  status: "DRAFT",
  total_quantity: 10,
  total_cost: 0,
  item_count: 1,
  created_by: {
    id: "u-1",
    first_name: "John",
    last_name: "Doe",
    email: "john@store.com",
  },
  created_at: "2026-07-28T00:00:00Z",
};

const mockRelease: StockRelease = {
  id: "rel-1",
  release_number: "REL-001",
  purpose: "INTERNAL_USE",
  release_date: "2026-07-28",
  status: "DRAFT",
  total_quantity: 10,
  total_cost: 0,
  created_by: {
    id: "u-1",
    first_name: "John",
    last_name: "Doe",
    email: "john@store.com",
  },
  items: [],
  created_at: "2026-07-28T00:00:00Z",
  updated_at: "2026-07-28T00:00:00Z",
};

describe("stockReleaseKeys factory", () => {
  it("generates structured query keys", () => {
    expect(stockReleaseKeys.all).toEqual(["stock-releases"]);
    expect(stockReleaseKeys.lists()).toEqual(["stock-releases", "list"]);
    expect(stockReleaseKeys.detail("rel-1")).toEqual([
      "stock-releases",
      "detail",
      "rel-1",
    ]);
  });
});

describe("useStockReleaseList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches and returns stock releases list", async () => {
    vi.mocked(stockReleaseApi.getStockReleases).mockResolvedValue({
      data: [mockSummary],
      pagination: { page: 1, size: 20, total: 1, pages: 1 },
    });

    const wrapper = createTestWrapper();
    const { result } = renderHook(() => useStockReleaseList({ page: 1 }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.data[0].release_number).toBe("REL-001");
  });
});

describe("useStockReleaseDetail", () => {
  it("fetches single stock release details by id", async () => {
    vi.mocked(stockReleaseApi.getStockReleaseById).mockResolvedValue(mockRelease);

    const wrapper = createTestWrapper();
    const { result } = renderHook(() => useStockReleaseDetail("rel-1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe("rel-1");
    expect(result.current.data?.purpose).toBe("INTERNAL_USE");
  });
});
