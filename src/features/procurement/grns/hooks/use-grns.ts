import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/app/components/ui/use-toast";
import { QUERY_CACHE_TIMES } from "@/lib/query/query-client";
import { inventoryKeys } from "@/features/inventory/hooks/use-inventory";
import { productKeys } from "@/features/master-data/hooks/query-keys";
import { PO_QUERY_KEYS } from "@/features/procurement/purchase-orders/hooks/use-purchase-orders";
import {
  fetchGRNs,
  fetchGRNById,
  fetchGRNDocument,
  createGRN,
  updateGRN,
  submitGRN,
  approveGRN,
  cancelGRN,
  uploadGRNDocument,
  deleteGRNDocument,
} from "../api/grn-api";
import type {
  GRNFilters,
  CreateGRNRequest,
  UpdateGRNRequest,
} from "../types";

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const GRN_QUERY_KEYS = {
  all: ["grns"] as const,
  lists: () => [...GRN_QUERY_KEYS.all, "list"] as const,
  list: (filters: GRNFilters) => [...GRN_QUERY_KEYS.lists(), filters] as const,
  details: () => [...GRN_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...GRN_QUERY_KEYS.details(), id] as const,
  document: (id: string) => [...GRN_QUERY_KEYS.all, "document", id] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useGRNs(filters: GRNFilters = {}) {
  return useQuery({
    queryKey: GRN_QUERY_KEYS.list(filters),
    queryFn: () => fetchGRNs(filters),
    placeholderData: (previousData) => previousData,
    ...QUERY_CACHE_TIMES.LIVE_DATA,
  });
}

export function useGRN(id: string) {
  return useQuery({
    queryKey: GRN_QUERY_KEYS.detail(id),
    queryFn: () => fetchGRNById(id),
    enabled: Boolean(id),
    ...QUERY_CACHE_TIMES.LIVE_DATA,
  });
}

export function useGRNDocument(id: string, enabled = false) {
  return useQuery({
    queryKey: GRN_QUERY_KEYS.document(id),
    queryFn: () => fetchGRNDocument(id),
    enabled: Boolean(id) && enabled,
    // Don't retry on 404 — means no document attached
    retry: (failureCount, error: any) => {
      if (error?.status === 404) return false;
      return failureCount < 2;
    },
    ...QUERY_CACHE_TIMES.LIVE_DATA,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateGRN() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGRNRequest) => createGRN(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GRN_QUERY_KEYS.lists() });
      toast({
        title: "GRN Created",
        description: "Goods Received Note created successfully.",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create GRN.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateGRN() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGRNRequest }) =>
      updateGRN(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: GRN_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: GRN_QUERY_KEYS.detail(data.id),
      });
      toast({
        title: "GRN Updated",
        description: "Draft GRN updated successfully.",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update GRN.",
        variant: "destructive",
      });
    },
  });
}

export function useSubmitGRN() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => submitGRN(id),
    onSuccess: (data) => {
      // refetchQueries forces an immediate re-fetch, bypassing staleTime
      queryClient.refetchQueries({ queryKey: GRN_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: GRN_QUERY_KEYS.detail(data.id),
      });
      toast({
        title: "GRN Submitted",
        description: "GRN submitted for approval.",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to submit GRN.",
        variant: "destructive",
      });
    },
  });
}

export function useApproveGRN() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveGRN(id),
    onSuccess: (data) => {
      // refetchQueries forces an immediate re-fetch regardless of staleTime —
      // critical here because approving a GRN mutates inventory stock levels
      queryClient.refetchQueries({ queryKey: GRN_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: GRN_QUERY_KEYS.detail(data.id),
      });
      // Force-refresh all inventory caches (list, summary, valuation, ledger)
      queryClient.refetchQueries({ queryKey: inventoryKeys.all });
      // Force-refresh product list/details (stock quantities shown there)
      queryClient.refetchQueries({ queryKey: productKeys.all });
      // Invalidate PO lists so receive status updates show
      queryClient.refetchQueries({ queryKey: PO_QUERY_KEYS.lists() });
      // Refresh dashboard widgets
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast({
        title: "GRN Approved",
        description: "GRN approved. Inventory levels updated.",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to approve GRN.",
        variant: "destructive",
      });
    },
  });
}

export function useCancelGRN() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelGRN(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: GRN_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: GRN_QUERY_KEYS.detail(data.id),
      });
      toast({
        title: "GRN Cancelled",
        description: "GRN has been cancelled.",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to cancel GRN.",
        variant: "destructive",
      });
    },
  });
}

export function useUploadGRNDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      uploadGRNDocument(id, file),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: GRN_QUERY_KEYS.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: GRN_QUERY_KEYS.document(id),
      });
      toast({
        title: "Document Uploaded",
        description: "GRN document uploaded successfully.",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to upload document.",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteGRNDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteGRNDocument(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: GRN_QUERY_KEYS.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: GRN_QUERY_KEYS.document(id),
      });
      toast({
        title: "Document Deleted",
        description: "GRN document removed.",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete document.",
        variant: "destructive",
      });
    },
  });
}
