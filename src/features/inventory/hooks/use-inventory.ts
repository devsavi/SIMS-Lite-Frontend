import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "../api/inventory-api";
import { QUERY_CACHE_TIMES } from "@/lib/query/query-client";
import { toast } from "@/app/components/ui/use-toast";
import type {
  InventoryFilterParams,
  LedgerFilterParams,
  StockAdjustmentCreatePayload,
  StockAdjustmentUpdatePayload,
  StockAdjustmentFilterParams,
} from "../types";

export const inventoryKeys = {
  all: ["inventory"] as const,
  lists: () => [...inventoryKeys.all, "list"] as const,
  list: (params?: InventoryFilterParams) => [...inventoryKeys.lists(), params] as const,
  summary: () => [...inventoryKeys.all, "summary"] as const,
  valuation: () => [...inventoryKeys.all, "valuation"] as const,
  detail: (productId: string) => [...inventoryKeys.all, "detail", productId] as const,
  ledger: (params?: LedgerFilterParams) => [...inventoryKeys.all, "ledger", params] as const,
  ledgerEntry: (entryId: string) => [...inventoryKeys.all, "ledger-entry", entryId] as const,
  productLedger: (productId: string, params?: Pick<LedgerFilterParams, "page" | "size" | "period" | "from_date" | "to_date">) =>
    [...inventoryKeys.all, "product-ledger", productId, params] as const,
  referenceLedger: (referenceType: string, referenceId: string) =>
    [...inventoryKeys.all, "reference-ledger", referenceType, referenceId] as const,
};

export const stockAdjustmentKeys = {
  all: ["stock-adjustments"] as const,
  lists: () => [...stockAdjustmentKeys.all, "list"] as const,
  list: (params?: StockAdjustmentFilterParams) => [...stockAdjustmentKeys.lists(), params] as const,
  details: () => [...stockAdjustmentKeys.all, "detail"] as const,
  detail: (id: string) => [...stockAdjustmentKeys.details(), id] as const,
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

export function useInventoryLedgerEntry(entryId: string) {
  return useQuery({
    queryKey: inventoryKeys.ledgerEntry(entryId),
    queryFn: () => inventoryApi.getLedgerEntryById(entryId),
    enabled: Boolean(entryId),
    ...QUERY_CACHE_TIMES.LIVE_DATA,
  });
}

export function useProductLedger(
  productId: string,
  params?: Pick<LedgerFilterParams, "page" | "size" | "period" | "from_date" | "to_date">
) {
  return useQuery({
    queryKey: inventoryKeys.productLedger(productId, params),
    queryFn: () => inventoryApi.getLedgerByProduct(productId, params),
    enabled: Boolean(productId),
    ...QUERY_CACHE_TIMES.LIVE_DATA,
  });
}

export function useReferenceLedger(referenceType: string, referenceId: string) {
  return useQuery({
    queryKey: inventoryKeys.referenceLedger(referenceType, referenceId),
    queryFn: () => inventoryApi.getLedgerByReference(referenceType, referenceId),
    enabled: Boolean(referenceType) && Boolean(referenceId),
    ...QUERY_CACHE_TIMES.LIVE_DATA,
  });
}

export function useCreateStockAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StockAdjustmentCreatePayload) =>
      inventoryApi.createStockAdjustment(payload),
    onSuccess: (data) => {
      // refetchQueries so the list updates immediately without waiting for stale time
      queryClient.refetchQueries({ queryKey: stockAdjustmentKeys.lists() });
      toast({
        title: "Adjustment Created",
        description: `Draft adjustment ${data.adjustment_number} created.`,
        variant: "success",
      });
    },
    onError: (error: unknown) => {
      const err = error as { message?: string };
      toast({
        title: "Creation Failed",
        description: err.message || "Failed to create stock adjustment.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateStockAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: StockAdjustmentUpdatePayload }) =>
      inventoryApi.updateStockAdjustment(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: stockAdjustmentKeys.all });
      queryClient.invalidateQueries({ queryKey: stockAdjustmentKeys.detail(data.id) });
      toast({
        title: "Adjustment Updated",
        description: `Draft adjustment ${data.adjustment_number} updated.`,
        variant: "success",
      });
    },
    onError: (error: unknown) => {
      const err = error as { message?: string };
      toast({
        title: "Update Failed",
        description: err.message || "Failed to update draft adjustment.",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteStockAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inventoryApi.deleteStockAdjustment(id),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: stockAdjustmentKeys.lists() });
      toast({
        title: "Adjustment Deleted",
        description: "The draft adjustment has been deleted.",
        variant: "success",
      });
    },
    onError: (error: unknown) => {
      const err = error as { message?: string };
      toast({
        title: "Delete Failed",
        description: err.message || "Failed to delete draft adjustment.",
        variant: "destructive",
      });
    },
  });
}

export function useSubmitStockAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inventoryApi.submitStockAdjustment(id),
    onSuccess: (data) => {
      queryClient.refetchQueries({ queryKey: stockAdjustmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: stockAdjustmentKeys.detail(data.id) });
      toast({
        title: "Adjustment Submitted",
        description: `Adjustment ${data.adjustment_number} submitted for approval.`,
        variant: "success",
      });
    },
    onError: (error: unknown) => {
      const err = error as { message?: string };
      toast({
        title: "Submission Failed",
        description: err.message || "Failed to submit adjustment.",
        variant: "destructive",
      });
    },
  });
}

export function useApproveStockAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inventoryApi.approveStockAdjustment(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: stockAdjustmentKeys.all });
      queryClient.invalidateQueries({ queryKey: stockAdjustmentKeys.detail(data.id) });
      // Use refetchQueries (not just invalidate) so inventory data is immediately
      // re-fetched regardless of stale time — approved adjustments mutate stock levels
      queryClient.refetchQueries({ queryKey: inventoryKeys.all });
      queryClient.refetchQueries({ queryKey: stockAdjustmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast({
        title: "Adjustment Approved",
        description: `Adjustment ${data.adjustment_number} approved. Inventory updated.`,
        variant: "success",
      });
    },
    onError: (error: unknown) => {
      const err = error as { message?: string };
      toast({
        title: "Approval Failed",
        description: err.message || "Failed to approve adjustment.",
        variant: "destructive",
      });
    },
  });
}

export function useCancelStockAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      inventoryApi.cancelStockAdjustment(id, reason),
    onSuccess: (data) => {
      queryClient.refetchQueries({ queryKey: stockAdjustmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: stockAdjustmentKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast({
        title: "Adjustment Cancelled",
        description: `Adjustment ${data.adjustment_number} has been cancelled.`,
        variant: "success",
      });
    },
    onError: (error: unknown) => {
      const err = error as { message?: string };
      toast({
        title: "Cancellation Failed",
        description: err.message || "Failed to cancel adjustment.",
        variant: "destructive",
      });
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

// ---------------------------------------------------------------------------
// Stock Adjustment hooks
// ---------------------------------------------------------------------------

export function useStockAdjustmentList(params?: StockAdjustmentFilterParams) {
  return useQuery({
    queryKey: stockAdjustmentKeys.list(params),
    queryFn: () => inventoryApi.getStockAdjustments(params),
    ...QUERY_CACHE_TIMES.LIVE_DATA,
  });
}

export function useStockAdjustmentDetail(id: string) {
  return useQuery({
    queryKey: stockAdjustmentKeys.detail(id),
    queryFn: () => inventoryApi.getStockAdjustmentById(id),
    enabled: Boolean(id),
    ...QUERY_CACHE_TIMES.LIVE_DATA,
  });
}
