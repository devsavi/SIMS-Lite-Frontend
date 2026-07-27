import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchGRNs,
  fetchGRNById,
  createGRN,
  submitGRN,
  approveGRN,
} from "../api/grn-api";
import type { GRNFilters, CreateGRNRequest } from "../types";

export const GRN_QUERY_KEYS = {
  all: ["grns"] as const,
  lists: () => [...GRN_QUERY_KEYS.all, "list"] as const,
  list: (filters: GRNFilters) => [...GRN_QUERY_KEYS.lists(), filters] as const,
  details: () => [...GRN_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...GRN_QUERY_KEYS.details(), id] as const,
};

export function useGRNs(filters: GRNFilters = {}) {
  return useQuery({
    queryKey: GRN_QUERY_KEYS.list(filters),
    queryFn: () => fetchGRNs(filters),
    keepPreviousData: true,
  });
}

export function useGRN(id: string) {
  return useQuery({
    queryKey: GRN_QUERY_KEYS.detail(id),
    queryFn: () => fetchGRNById(id),
    enabled: Boolean(id),
  });
}

export function useCreateGRN() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGRNRequest) => createGRN(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: GRN_QUERY_KEYS.lists() });
      toast.success(
        variables.isDraft
          ? "GRN draft saved"
          : "Goods Received Note created successfully"
      );
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create GRN");
    },
  });
}

export function useSubmitGRN() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => submitGRN(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: GRN_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: GRN_QUERY_KEYS.detail(data.id) });
      toast.success("GRN submitted for approval");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to submit GRN");
    },
  });
}

export function useApproveGRN() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveGRN(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: GRN_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: GRN_QUERY_KEYS.detail(data.id) });
      // Invalidate inventory & purchase orders when GRN is approved
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast.success("GRN approved! Inventory levels updated.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to approve GRN");
    },
  });
}
