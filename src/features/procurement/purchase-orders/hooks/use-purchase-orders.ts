import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/app/components/ui/use-toast";
import { QUERY_CACHE_TIMES } from "@/lib/query/query-client";
import {
  fetchPurchaseOrders,
  fetchPurchaseOrderById,
  fetchPurchaseOrderPrint,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  submitPurchaseOrder,
  approvePurchaseOrder,
  rejectPurchaseOrder,
  cancelPurchaseOrder,
  duplicatePurchaseOrder,
  emailPurchaseOrder,
} from "../api/po-api";
import type {
  POFilters,
  CreatePORequest,
  UpdatePORequest,
  RejectPORequest,
  CancelPORequest,
  EmailPORequest,
} from "../types";

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const PO_QUERY_KEYS = {
  all: ["purchase-orders"] as const,
  lists: () => [...PO_QUERY_KEYS.all, "list"] as const,
  list: (filters: POFilters) => [...PO_QUERY_KEYS.lists(), filters] as const,
  details: () => [...PO_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...PO_QUERY_KEYS.details(), id] as const,
  print: (id: string) => [...PO_QUERY_KEYS.all, "print", id] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

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

export function usePurchaseOrderPrint(id: string, enabled = false) {
  return useQuery({
    queryKey: PO_QUERY_KEYS.print(id),
    queryFn: () => fetchPurchaseOrderPrint(id),
    enabled: Boolean(id) && enabled,
    ...QUERY_CACHE_TIMES.LIVE_DATA,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePORequest) => createPurchaseOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.lists() });
      toast({
        title: "Purchase Order Created",
        description: "Purchase order created successfully.",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create purchase order.",
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
      queryClient.invalidateQueries({
        queryKey: PO_QUERY_KEYS.detail(data.id),
      });
      toast({
        title: "Purchase Order Updated",
        description: "Draft updated successfully.",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update purchase order.",
        variant: "destructive",
      });
    },
  });
}

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.lists() });
      toast({
        title: "Purchase Order Deleted",
        description: "Draft purchase order deleted.",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete purchase order.",
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
      queryClient.invalidateQueries({
        queryKey: PO_QUERY_KEYS.detail(data.id),
      });
      toast({
        title: "Purchase Order Submitted",
        description: "Purchase order submitted for approval.",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to submit purchase order.",
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
      queryClient.invalidateQueries({
        queryKey: PO_QUERY_KEYS.detail(data.id),
      });
      toast({
        title: "Purchase Order Approved",
        description: "Purchase order approved successfully.",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to approve purchase order.",
        variant: "destructive",
      });
    },
  });
}

export function useRejectPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: RejectPORequest }) =>
      rejectPurchaseOrder(id, body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: PO_QUERY_KEYS.detail(data.id),
      });
      toast({
        title: "Purchase Order Rejected",
        description: "Purchase order has been rejected.",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to reject purchase order.",
        variant: "destructive",
      });
    },
  });
}

export function useCancelPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CancelPORequest }) =>
      cancelPurchaseOrder(id, body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: PO_QUERY_KEYS.detail(data.id),
      });
      toast({
        title: "Purchase Order Cancelled",
        description: "Purchase order has been cancelled.",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to cancel purchase order.",
        variant: "destructive",
      });
    },
  });
}

export function useDuplicatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => duplicatePurchaseOrder(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.lists() });
      toast({
        title: "Purchase Order Duplicated",
        description: `New draft ${data.po_number} created.`,
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to duplicate purchase order.",
        variant: "destructive",
      });
    },
  });
}

export function useEmailPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: EmailPORequest }) =>
      emailPurchaseOrder(id, body),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.detail(id) });
      toast({
        title: "Email Sent",
        description: "Purchase order emailed to the supplier.",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to email purchase order.",
        variant: "destructive",
      });
    },
  });
}
