import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { stockReleaseApi } from "../api/stock-release-api";
import { stockReleaseKeys } from "./stock-release-keys";
import { toast } from "@/app/components/ui/use-toast";
import { QUERY_CACHE_TIMES } from "@/lib/query/query-client";
import type {
  StockReleaseFilterParams,
  CreateStockReleasePayload,
  UpdateStockReleasePayload,
} from "../types/stock-release-types";

export { stockReleaseKeys };

/**
 * Fetch paginated list of stock releases
 */
export function useStockReleaseList(params?: StockReleaseFilterParams) {
  return useQuery({
    queryKey: stockReleaseKeys.list(params),
    queryFn: () => stockReleaseApi.getStockReleases(params),
    ...QUERY_CACHE_TIMES.LIVE_DATA,
  });
}

/**
 * Fetch single stock release by ID
 */
export function useStockReleaseDetail(id: string) {
  return useQuery({
    queryKey: stockReleaseKeys.detail(id),
    queryFn: () => stockReleaseApi.getStockReleaseById(id),
    enabled: Boolean(id),
    ...QUERY_CACHE_TIMES.LIVE_DATA,
  });
}

/**
 * Create a new stock release
 */
export function useCreateStockRelease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStockReleasePayload) =>
      stockReleaseApi.createStockRelease(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: stockReleaseKeys.all });
      toast({
        title: "Stock Release Created",
        description: `Release ${data.release_number || ""} created successfully.`,
        variant: "success",
      });
    },
    onError: (error: unknown) => {
      const err = error as { message?: string };
      toast({
        title: "Creation Failed",
        description: err.message || "Failed to create stock release.",
        variant: "destructive",
      });
    },
  });
}

/**
 * Update a draft stock release
 */
export function useUpdateStockRelease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateStockReleasePayload;
    }) => stockReleaseApi.updateStockRelease(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: stockReleaseKeys.all });
      queryClient.invalidateQueries({ queryKey: stockReleaseKeys.detail(data.id) });
      toast({
        title: "Stock Release Updated",
        description: `Release ${data.release_number || ""} draft updated successfully.`,
        variant: "success",
      });
    },
    onError: (error: unknown) => {
      const err = error as { message?: string };
      toast({
        title: "Update Failed",
        description: err.message || "Failed to update draft stock release.",
        variant: "destructive",
      });
    },
  });
}

/**
 * Submit a stock release for approval
 */
export function useSubmitStockRelease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => stockReleaseApi.submitStockRelease(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: stockReleaseKeys.all });
      queryClient.invalidateQueries({ queryKey: stockReleaseKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({
        title: "Stock Release Submitted",
        description: `Release ${data.release_number || ""} has been submitted for approval.`,
        variant: "success",
      });
    },
    onError: (error: unknown) => {
      const err = error as { message?: string };
      toast({
        title: "Submission Failed",
        description: err.message || "Failed to submit stock release.",
        variant: "destructive",
      });
    },
  });
}

/**
 * Approve a stock release (updates stock levels and invalidates cache)
 */
export function useApproveStockRelease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => stockReleaseApi.approveStockRelease(id),
    onSuccess: (data) => {
      // Invalidate stock release queries
      queryClient.invalidateQueries({ queryKey: stockReleaseKeys.all });
      queryClient.invalidateQueries({ queryKey: stockReleaseKeys.detail(data.id) });

      // Invalidate inventory & ledger queries
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-ledger"] });

      // Invalidate dashboard queries (KPIs, widgets, low stock alerts)
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });

      // Invalidate notifications & reports
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });

      toast({
        title: "Stock Release Approved",
        description: `Release ${data.release_number || ""} approved! Stock quantities updated.`,
        variant: "success",
      });
    },
    onError: (error: unknown) => {
      const err = error as { message?: string };
      toast({
        title: "Approval Failed",
        description: err.message || "Failed to approve stock release.",
        variant: "destructive",
      });
    },
  });
}

/**
 * Cancel a stock release
 */
export function useCancelStockRelease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      stockReleaseApi.cancelStockRelease(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: stockReleaseKeys.all });
      queryClient.invalidateQueries({ queryKey: stockReleaseKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast({
        title: "Stock Release Cancelled",
        description: `Release ${data.release_number || ""} has been cancelled.`,
        variant: "success",
      });
    },
    onError: (error: unknown) => {
      const err = error as { message?: string };
      toast({
        title: "Cancellation Failed",
        description: err.message || "Failed to cancel stock release.",
        variant: "destructive",
      });
    },
  });
}
