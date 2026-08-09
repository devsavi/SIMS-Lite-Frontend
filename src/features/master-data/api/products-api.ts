/**
 * Master Data — Products API
 *
 * Endpoints:
 *   GET    /products/                       — list with filters & pagination
 *   GET    /products/{id}                   — single product
 *   POST   /products/                       — create
 *   PUT    /products/{id}                   — update
 *   DELETE /products/{id}                   — delete
 *   GET    /products/{id}/images            — get product image URL
 *   POST   /products/{id}/image             — upload product image (multipart)
 *   DELETE /products/{id}/image             — remove product image
 *   GET    /products/{id}/barcode           — barcode PNG (blob)
 *   GET    /products/import-template        — download Excel import template
 *   POST   /products/import                 — bulk import from Excel
 */

import apiClient, { get, post, put, del } from "@/lib/api/client";
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductListParams,
  PaginatedListResponse,
  SuccessResponse,
  BulkImportResult,
} from "../types";

const BASE = "/products";

export const productsApi = {
  // -------------------------------------------------------------------------
  // List
  // -------------------------------------------------------------------------
  list: async (params?: ProductListParams): Promise<PaginatedListResponse<Product>> => {
    const query: Record<string, unknown> = {};
    if (params) {
      if (params.page != null) query.page = params.page;
      if (params.size != null) query.size = params.size;
      if (params.search) query.search = params.search;
      if (params.ordering) query.ordering = params.ordering;
      if (params.active_only != null) query.active_only = params.active_only;
      if (params.category_id) query.category_id = params.category_id;
      if (params.brand_id) query.brand_id = params.brand_id;
      if (params.supplier_id) query.supplier_id = params.supplier_id;
    }
    return get<PaginatedListResponse<Product>>(BASE + "/", { params: query });
  },

  // -------------------------------------------------------------------------
  // Single product
  // -------------------------------------------------------------------------
  getById: async (id: string): Promise<Product> => {
    const res = await get<SuccessResponse<Product>>(`${BASE}/${id}`);
    return res.data;
  },

  // -------------------------------------------------------------------------
  // Create
  // -------------------------------------------------------------------------
  create: async (data: CreateProductRequest): Promise<Product> => {
    const res = await post<SuccessResponse<Product>>(BASE + "/", data);
    return res.data;
  },

  // -------------------------------------------------------------------------
  // Update  (PUT — full replacement per the API spec)
  // -------------------------------------------------------------------------
  update: async (id: string, data: UpdateProductRequest): Promise<Product> => {
    const res = await put<SuccessResponse<Product>>(`${BASE}/${id}`, data);
    return res.data;
  },

  // -------------------------------------------------------------------------
  // Delete
  // -------------------------------------------------------------------------
  delete: async (id: string): Promise<void> => {
    await del<void>(`${BASE}/${id}`);
  },

  // -------------------------------------------------------------------------
  // Image — fetch bytes and return a blob object URL
  // -------------------------------------------------------------------------
  getImage: async (id: string): Promise<string | null> => {
    try {
      const res = await apiClient.get<Blob>(`${BASE}/${id}/image`, {
        responseType: "blob",
        headers: {
          Accept: "image/*, application/octet-stream, */*",
        },
      });
      if (!res.data) return null;
      let blob: Blob;
      if (res.data instanceof Blob) {
        blob = res.data;
      } else {
        const contentType = (res.headers && res.headers["content-type"]) || "image/jpeg";
        blob = new Blob([res.data], { type: contentType });
      }
      if (blob.size === 0) return null;
      return URL.createObjectURL(blob);
    } catch {
      // Returns null if no image exists (404 or empty)
      return null;
    }
  },

  // -------------------------------------------------------------------------
  // Image — upload (multipart/form-data)
  // -------------------------------------------------------------------------
  uploadImage: async (id: string, file: File): Promise<Product> => {
    const form = new FormData();
    form.append("file", file);
    const res = await apiClient.post<SuccessResponse<Product>>(
      `${BASE}/${id}/image`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data.data;
  },

  // -------------------------------------------------------------------------
  // Image — delete
  // -------------------------------------------------------------------------
  deleteImage: async (id: string): Promise<Product> => {
    const res = await del<SuccessResponse<Product>>(`${BASE}/${id}/image`);
    return res.data;
  },

  // -------------------------------------------------------------------------
  // Barcode PNG — returns a blob URL for display / download
  // -------------------------------------------------------------------------
  getBarcodeUrl: (id: string): string => {
    // Convenience helper: returns the raw URL so callers can use it in <img src>
    // or trigger a download. The actual request must be made with the auth token,
    // so use downloadBarcode() for programmatic use.
    return `${BASE}/${id}/barcode`;
  },

  downloadBarcode: async (id: string): Promise<Blob> => {
    const res = await apiClient.get<Blob>(`${BASE}/${id}/barcode`, {
      responseType: "blob",
    });
    return res.data;
  },

  // -------------------------------------------------------------------------
  // Import template — download Excel file
  // -------------------------------------------------------------------------
  downloadImportTemplate: async (): Promise<Blob> => {
    const res = await apiClient.get<Blob>(`${BASE}/import-template`, {
      responseType: "blob",
    });
    return res.data;
  },

  // -------------------------------------------------------------------------
  // Bulk import from Excel
  // -------------------------------------------------------------------------
  bulkImport: async (file: File): Promise<BulkImportResult> => {
    const form = new FormData();
    form.append("file", file);
    const res = await apiClient.post<SuccessResponse<BulkImportResult>>(
      `${BASE}/import`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data.data;
  },
};
