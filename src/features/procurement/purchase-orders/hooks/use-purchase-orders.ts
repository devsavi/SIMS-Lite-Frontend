import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchPurchaseOrders,
  fetchPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  submitPurchaseOrder,
  approvePurchaseOrder,
  rejectPurchaseOrder,
  cancelPurchaseOrder,
  resendPOEmail,
} from "../api/po-api";
import type { POFilters, CreatePORequest, UpdatePORequest } from "../types";

export const PO_QUERY_KEYS = {
  all: ["purchase-orders"] as const,
  lists: () => [...PO_QUERY_KEYS.all, "list"] as const,
  list: (filters: POFilters) => [...PO_QUERY_KEYS.lists(), filters] as const,
  details: () => [...PO_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...PO_QUERY_KEYS.details(), id] as const,
};

export function usePurchaseOrders(filters: POFilters = {}) {
  return useQuery({
    queryKey: PO_QUERY_KEYS.list(filters),
    queryFn: () => fetchPurchaseOrders(filters),
    keepPreviousData: true,
  });
}

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: PO_QUERY_KEYS.detail(id),
    queryFn: () => fetchPurchaseOrderById(id),
    enabled: Boolean(id),
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePORequest) => createPurchaseOrder(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.lists() });
      toast.success(
        variables.isDraft
          ? "Purchase order draft saved"
          : "Purchase order created successfully"
      );
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create purchase order");
    },
  });
}

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePORequest }) =>
      updatePurchaseOrder(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.detail(data.id) });
      toast.success("Purchase order updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update purchase order");
    },
  });
}

export function useSubmitPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => submitPurchaseOrder(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.detail(data.id) });
      toast.success("Purchase order submitted for approval");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to submit purchase order");
    },
  });
}

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approvePurchaseOrder(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.detail(data.id) });
      toast.success("Purchase order approved successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to approve purchase order");
    },
  });
}

export function useRejectPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      rejectPurchaseOrder(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.detail(data.id) });
      toast.success("Purchase order rejected");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to reject purchase order");
    },
  });
}

export function useCancelPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      cancelPurchaseOrder(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.detail(data.id) });
      toast.success("Purchase order cancelled");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to cancel purchase order");
    },
  });
}

export function useResendPOEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resendPOEmail(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.detail(id) });
      toast.success("Purchase order notification email resent");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to resend email notification");
    },
  });
}
