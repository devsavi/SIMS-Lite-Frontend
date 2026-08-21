"use client";

/**
 * Master Data — Supplier TanStack Query hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/app/components/ui/use-toast";
import { suppliersApi } from "../api/suppliers-api";
import { supplierKeys } from "./query-keys";
import { QUERY_CACHE_TIMES } from "@/lib/query/query-client";
import type { CreateSupplierRequest, UpdateSupplierRequest, ListParams } from "../types";

export function useSuppliers(params?: ListParams) {
  return useQuery({
    queryKey: supplierKeys.list(params),
    queryFn: () => suppliersApi.list(params),
    ...QUERY_CACHE_TIMES.MASTER_DATA,
  });
}

export function useSupplier(id: string | null) {
  return useQuery({
    queryKey: supplierKeys.detail(id ?? ""),
    queryFn: () => suppliersApi.getById(id!),
    enabled: !!id,
    ...QUERY_CACHE_TIMES.MASTER_DATA,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSupplierRequest) => suppliersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists(), refetchType: "all" });
      toast({ title: "Supplier created", variant: "success" });
    },
    onError: () => {
      toast({ title: "Failed to create supplier", variant: "destructive" });
    },
  });
}

export function useUpdateSupplier(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSupplierRequest) => suppliersApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists(), refetchType: "all" });
      queryClient.setQueryData(supplierKeys.detail(id), updated);
      toast({ title: "Supplier updated", variant: "success" });
    },
    onError: () => {
      toast({ title: "Failed to update supplier", variant: "destructive" });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => suppliersApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists(), refetchType: "all" });
      queryClient.removeQueries({ queryKey: supplierKeys.detail(id) });
      toast({ title: "Supplier deleted", variant: "success" });
    },
    onError: () => {
      toast({ title: "Failed to delete supplier", variant: "destructive" });
    },
  });
}

export function useRestoreSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => suppliersApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists(), refetchType: "all" });
      toast({ title: "Supplier restored", variant: "success" });
    },
    onError: () => {
      toast({ title: "Failed to restore supplier", variant: "destructive" });
    },
  });
}
