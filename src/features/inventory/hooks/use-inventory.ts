import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "../api/inventory-api";
import { QUERY_CACHE_TIMES } from "@/lib/query/query-client";
import type {
  InventoryFilterParams,
  LedgerFilterParams,
  StockAdjustmentCreatePayload,
} from "../types";

export const inventoryKeys = {
  all: ["inventory"] as const,
  lists: () => [...inventoryKeys.all, "list"] as const,
  list: (params?: InventoryFilterParams) => [...inventoryKeys.lists(), params] as const,
  summary: () => [...inventoryKeys.all, "summary"] as const,
  valuation: () => [...inventoryKeys.all, "valuation"] as const,
  detail: (productId: string) => [...inventoryKeys.all, "detail", productId] as const,
  ledger: (params?: LedgerFilterParams) => [...inventoryKeys.all, "ledger", params] as const,
  productLedger: (productId: string, page: number, size: number) =>
    [...inventoryKeys.all, "product-ledger", productId, page, size] as const,
};

export function useInventoryList(params?: InventoryFilterParams) {
  return useQuery({
    queryKey: inventoryKeys.list(params),
    queryFn: () => inventoryApi.getInventoryList(params),
    ...QUERY_CACHE_TIMES.LIVE_DATA,
  });
}

export function useInventorySummary() {
  return useQuery({
    queryKey: inventoryKeys.summary(),
    queryFn: () => inventoryApi.getInventorySummary(),
    ...QUERY_CACHE_TIMES.LIVE_DATA,
  });
}

export function useInventoryValuation() {
  return useQuery({
    queryKey: inventoryKeys.valuation(),
    queryFn: () => inventoryApi.getInventoryValuation(),
    ...QUERY_CACHE_TIMES.LIVE_DATA,
  });
}

export function useInventoryDetail(productId: string) {
  return useQuery({
    queryKey: inventoryKeys.detail(productId),
    queryFn: () => inventoryApi.getInventoryByProductId(productId),
    enabled: Boolean(productId),
    ...QUERY_CACHE_TIMES.LIVE_DATA,
  });
}

export function useInventoryLedger(params?: LedgerFilterParams) {
  return useQuery({
    queryKey: inventoryKeys.ledger(params),
    queryFn: () => inventoryApi.getLedgerEntries(params),
    ...QUERY_CACHE_TIMES.LIVE_DATA,
  });
}

export function useProductLedger(productId: string, page = 1, size = 10) {
  return useQuery({
    queryKey: inventoryKeys.productLedger(productId, page, size),
    queryFn: () => inventoryApi.getLedgerByProduct(productId, page, size),
    enabled: Boolean(productId),
    ...QUERY_CACHE_TIMES.LIVE_DATA,
  });
}

export function useCreateStockAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: StockAdjustmentCreatePayload & { autoApprove?: boolean }) => {
      const { autoApprove = true, ...data } = payload;
      // 1. Create draft stock adjustment
      const adjustment = await inventoryApi.createStockAdjustment(data);

      // 2. If autoApprove is specified, submit & approve directly to complete transaction
      if (autoApprove && adjustment.id) {
        try {
          const submitted = await inventoryApi.submitStockAdjustment(adjustment.id);
          return await inventoryApi.approveStockAdjustment(submitted.id);
        } catch {
          // Return created adjustment if auto-approve step fails
          return adjustment;
        }
      }
      return adjustment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useApproveStockAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adjustmentId: string) => inventoryApi.approveStockAdjustment(adjustmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function usePrefetchInventoryDetail() {
  const queryClient = useQueryClient();

  return (productId: string) => {
    if (productId) {
      queryClient.prefetchQuery({
        queryKey: inventoryKeys.detail(productId),
        queryFn: () => inventoryApi.getInventoryByProductId(productId),
      });
    }
  };
}
