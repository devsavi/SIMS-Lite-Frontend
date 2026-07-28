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
import type { StockRelease } from "../types/stock-release-types";

vi.mock("../api/stock-release-api", () => ({
  stockReleaseApi: {
    getStockReleases: vi.fn(),
    getStockReleaseById: vi.fn(),
    createStockRelease: vi.fn(),
    updateStockRelease: vi.fn(),
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

const mockRelease: StockRelease = {
  id: "rel-1",
  release_number: "REL-001",
  release_date: "2026-07-28",
  status: "draft",
  total_items: 1,
  total_quantity: 10,
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
      data: [mockRelease],
      total: 1,
      page: 1,
      pageSize: 20,
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
  });
});
