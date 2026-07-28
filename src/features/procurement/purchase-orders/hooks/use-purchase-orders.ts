import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/app/components/ui/use-toast";
import { QUERY_CACHE_TIMES } from "@/lib/query/query-client";
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
    placeholderData: (previousData) => previousData,
    ...QUERY_CACHE_TIMES.LIVE_DATA,
  });
}

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: PO_QUERY_KEYS.detail(id),
    queryFn: () => fetchPurchaseOrderById(id),
    enabled: Boolean(id),
    ...QUERY_CACHE_TIMES.LIVE_DATA,
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePORequest) => createPurchaseOrder(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.lists() });
      toast({
        title: "Purchase Order Created",
        description: variables.isDraft
          ? "Purchase order draft saved"
          : "Purchase order created successfully",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create purchase order",
        variant: "destructive",
      });
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
      toast({
        title: "Purchase Order Updated",
        description: "Purchase order updated successfully",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update purchase order",
        variant: "destructive",
      });
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
      toast({
        title: "Purchase Order Submitted",
        description: "Purchase order submitted for approval",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to submit purchase order",
        variant: "destructive",
      });
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
      toast({
        title: "Purchase Order Approved",
        description: "Purchase order approved successfully",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to approve purchase order",
        variant: "destructive",
      });
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
      toast({
        title: "Purchase Order Rejected",
        description: "Purchase order rejected",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to reject purchase order",
        variant: "destructive",
      });
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
      toast({
        title: "Purchase Order Cancelled",
        description: "Purchase order cancelled",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to cancel purchase order",
        variant: "destructive",
      });
    },
  });
}

export function useResendPOEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resendPOEmail(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.detail(id) });
      toast({
        title: "Email Resent",
        description: "Purchase order notification email resent",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to resend email notification",
        variant: "destructive",
      });
    },
  });
}
