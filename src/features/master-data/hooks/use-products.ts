"use client";

/**
 * Master Data — Product TanStack Query hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/app/components/ui/use-toast";
import { productsApi } from "../api/products-api";
import { productKeys } from "./query-keys";
import { QUERY_CACHE_TIMES } from "@/lib/query/query-client";
import type { CreateProductRequest, UpdateProductRequest, ProductListParams } from "../types";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useProducts(params?: ProductListParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productsApi.list(params),
    ...QUERY_CACHE_TIMES.MASTER_DATA,
  });
}

export function useProduct(id: string | null) {
  return useQuery({
    queryKey: productKeys.detail(id ?? ""),
    queryFn: () => productsApi.getById(id!),
    enabled: !!id,
    ...QUERY_CACHE_TIMES.MASTER_DATA,
  });
}

export function useProductImage(id: string | null) {
  return useQuery({
    queryKey: productKeys.image(id ?? ""),
    queryFn: () => productsApi.getImage(id!),
    enabled: !!id,
    // Blob URLs are tab-local and can't be shared across sessions/profiles,
    // so we keep them fresh and clean up when evicted from cache.
    staleTime: 0,
    gcTime: 1000 * 60 * 5, // revoke after 5 min of inactivity
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast({ title: "Product created", variant: "success" });
    },
    onError: () => {
      toast({ title: "Failed to create product", variant: "destructive" });
    },
  });
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProductRequest) => productsApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.setQueryData(productKeys.detail(id), updated);
      toast({ title: "Product updated", variant: "success" });
    },
    onError: () => {
      toast({ title: "Failed to update product", variant: "destructive" });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.removeQueries({ queryKey: productKeys.detail(id) });
      toast({ title: "Product deleted", variant: "success" });
    },
    onError: () => {
      toast({ title: "Failed to delete product", variant: "destructive" });
    },
  });
}

export function useUploadProductImage(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => productsApi.uploadImage(id, file),
    onSuccess: (updated) => {
      queryClient.setQueryData(productKeys.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.image(id) });
      toast({ title: "Image uploaded", variant: "success" });
    },
    onError: () => {
      toast({ title: "Failed to upload image", variant: "destructive" });
    },
  });
}

export function useDeleteProductImage(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => productsApi.deleteImage(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(productKeys.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.image(id) });
      toast({ title: "Image removed", variant: "success" });
    },
    onError: () => {
      toast({ title: "Failed to remove image", variant: "destructive" });
    },
  });
}

export function useDownloadBarcode() {
  return useMutation({
    mutationFn: (id: string) => productsApi.downloadBarcode(id),
    onError: () => {
      toast({ title: "Failed to download barcode", variant: "destructive" });
    },
  });
}

export function useDownloadImportTemplate() {
  return useMutation({
    mutationFn: () => productsApi.downloadImportTemplate(),
    onError: () => {
      toast({ title: "Failed to download template", variant: "destructive" });
    },
  });
}

export function useBulkImportProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => productsApi.bulkImport(file),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast({
        title: `Import complete — ${result.imported} imported, ${result.failed} failed`,
        variant: result.failed > 0 ? "destructive" : "success",
      });
    },
    onError: () => {
      toast({ title: "Failed to import products", variant: "destructive" });
    },
  });
}
