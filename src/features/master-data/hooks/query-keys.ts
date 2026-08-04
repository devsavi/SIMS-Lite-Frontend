/**
 * Master Data — TanStack Query key factories.
 * Centralised keys ensure correct cache invalidation across all master data modules.
 */

import type { ListParams, ProductListParams } from "../types";


export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (params?: ListParams) => [...categoryKeys.lists(), params] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

export const brandKeys = {
  all: ["brands"] as const,
  lists: () => [...brandKeys.all, "list"] as const,
  list: (params?: ListParams) => [...brandKeys.lists(), params] as const,
  details: () => [...brandKeys.all, "detail"] as const,
  detail: (id: string) => [...brandKeys.details(), id] as const,
};

export const uomKeys = {
  all: ["uoms"] as const,
  lists: () => [...uomKeys.all, "list"] as const,
  list: (params?: ListParams) => [...uomKeys.lists(), params] as const,
  details: () => [...uomKeys.all, "detail"] as const,
  detail: (id: string) => [...uomKeys.details(), id] as const,
};

export const supplierKeys = {
  all: ["suppliers"] as const,
  lists: () => [...supplierKeys.all, "list"] as const,
  list: (params?: ListParams) => [...supplierKeys.lists(), params] as const,
  details: () => [...supplierKeys.all, "detail"] as const,
  detail: (id: string) => [...supplierKeys.details(), id] as const,
};

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params?: ProductListParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  images: () => [...productKeys.all, "image"] as const,
  image: (id: string) => [...productKeys.images(), id] as const,
};
