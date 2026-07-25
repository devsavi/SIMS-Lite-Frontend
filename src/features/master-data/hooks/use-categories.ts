"use client";

/**
 * Master Data — Category TanStack Query hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/app/components/ui/use-toast";
import { categoriesApi } from "../api/categories-api";
import { categoryKeys } from "./query-keys";
import type { CreateCategoryRequest, UpdateCategoryRequest, ListParams } from "../types";

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

export function useCategories(params?: ListParams) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => categoriesApi.list(params),
  });
}

// ---------------------------------------------------------------------------
// Detail
// ---------------------------------------------------------------------------

export function useCategory(id: string | null) {
  return useQuery({
    queryKey: categoryKeys.detail(id ?? ""),
    queryFn: () => categoriesApi.getById(id!),
    enabled: !!id,
  });
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast({ title: "Category created", variant: "success" });
    },
    onError: () => {
      toast({ title: "Failed to create category", variant: "destructive" });
    },
  });
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export function useUpdateCategory(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCategoryRequest) => categoriesApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.setQueryData(categoryKeys.detail(id), updated);
      toast({ title: "Category updated", variant: "success" });
    },
    onError: () => {
      toast({ title: "Failed to update category", variant: "destructive" });
    },
  });
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.removeQueries({ queryKey: categoryKeys.detail(id) });
      toast({ title: "Category deleted", variant: "success" });
    },
    onError: () => {
      toast({ title: "Failed to delete category", variant: "destructive" });
    },
  });
}

// ---------------------------------------------------------------------------
// Restore
// ---------------------------------------------------------------------------

export function useRestoreCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast({ title: "Category restored", variant: "success" });
    },
    onError: () => {
      toast({ title: "Failed to restore category", variant: "destructive" });
    },
  });
}
