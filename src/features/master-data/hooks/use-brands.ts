"use client";

/**
 * Master Data — Brand TanStack Query hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/app/components/ui/use-toast";
import { brandsApi } from "../api/brands-api";
import { brandKeys } from "./query-keys";
import { QUERY_CACHE_TIMES } from "@/lib/query/query-client";
import type { CreateBrandRequest, UpdateBrandRequest, ListParams } from "../types";

export function useBrands(params?: ListParams) {
  return useQuery({
    queryKey: brandKeys.list(params),
    queryFn: () => brandsApi.list(params),
    ...QUERY_CACHE_TIMES.MASTER_DATA,
  });
}

export function useBrand(id: string | null) {
  return useQuery({
    queryKey: brandKeys.detail(id ?? ""),
    queryFn: () => brandsApi.getById(id!),
    enabled: !!id,
    ...QUERY_CACHE_TIMES.MASTER_DATA,
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBrandRequest) => brandsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.lists(), refetchType: "all" });
      toast({ title: "Brand created", variant: "success" });
    },
    onError: () => {
      toast({ title: "Failed to create brand", variant: "destructive" });
    },
  });
}

export function useUpdateBrand(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBrandRequest) => brandsApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: brandKeys.lists(), refetchType: "all" });
      queryClient.setQueryData(brandKeys.detail(id), updated);
      toast({ title: "Brand updated", variant: "success" });
    },
    onError: () => {
      toast({ title: "Failed to update brand", variant: "destructive" });
    },
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => brandsApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: brandKeys.lists(), refetchType: "all" });
      queryClient.removeQueries({ queryKey: brandKeys.detail(id) });
      toast({ title: "Brand deleted", variant: "success" });
    },
    onError: () => {
      toast({ title: "Failed to delete brand", variant: "destructive" });
    },
  });
}

export function useRestoreBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => brandsApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.lists(), refetchType: "all" });
      toast({ title: "Brand restored", variant: "success" });
    },
    onError: () => {
      toast({ title: "Failed to restore brand", variant: "destructive" });
    },
  });
}
