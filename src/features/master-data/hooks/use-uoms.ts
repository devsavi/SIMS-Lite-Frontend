"use client";

/**
 * Master Data — UoM TanStack Query hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/app/components/ui/use-toast";
import { uomsApi } from "../api/uoms-api";
import { uomKeys } from "./query-keys";
import { QUERY_CACHE_TIMES } from "@/lib/query/query-client";
import type { CreateUomRequest, UpdateUomRequest, ListParams } from "../types";

export function useUoms(params?: ListParams) {
  return useQuery({
    queryKey: uomKeys.list(params),
    queryFn: () => uomsApi.list(params),
    ...QUERY_CACHE_TIMES.MASTER_DATA,
  });
}

export function useUom(id: string | null) {
  return useQuery({
    queryKey: uomKeys.detail(id ?? ""),
    queryFn: () => uomsApi.getById(id!),
    enabled: !!id,
    ...QUERY_CACHE_TIMES.MASTER_DATA,
  });
}

export function useCreateUom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUomRequest) => uomsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: uomKeys.lists() });
      toast({ title: "Unit of measure created", variant: "success" });
    },
    onError: () => {
      toast({ title: "Failed to create unit of measure", variant: "destructive" });
    },
  });
}

export function useUpdateUom(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUomRequest) => uomsApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: uomKeys.lists() });
      queryClient.setQueryData(uomKeys.detail(id), updated);
      toast({ title: "Unit of measure updated", variant: "success" });
    },
    onError: () => {
      toast({ title: "Failed to update unit of measure", variant: "destructive" });
    },
  });
}

export function useDeleteUom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => uomsApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: uomKeys.lists() });
      queryClient.removeQueries({ queryKey: uomKeys.detail(id) });
      toast({ title: "Unit of measure deleted", variant: "success" });
    },
    onError: () => {
      toast({ title: "Failed to delete unit of measure", variant: "destructive" });
    },
  });
}

export function useRestoreUom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => uomsApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: uomKeys.lists() });
      toast({ title: "Unit of measure restored", variant: "success" });
    },
    onError: () => {
      toast({ title: "Failed to restore unit of measure", variant: "destructive" });
    },
  });
}
