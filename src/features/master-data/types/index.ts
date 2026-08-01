/**
 * Master Data — shared TypeScript types for all master data entities.
 * Aligned with backend API (snake_case).
 */

import type { AuditFields } from "@/types";

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

/** Backend response envelope */
export interface SuccessResponse<T> {
  status: "success";
  data: T;
}

/** Paginated list response */
export interface PaginatedListResponse<T> {
  status: "success";
  data: T[];
  pagination: {
    page: number;
    size: number;
    total: number;
    pages: number;
  };
}

/** Common list query params */
export interface ListParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  is_active?: boolean;
}

// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------

export interface Category extends AuditFields {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  parent?: CategorySummary | null;
  is_active: boolean;
  product_count?: number;
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string | null;
  parent_id?: string | null;
  is_active?: boolean;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

// ---------------------------------------------------------------------------
// Brand
// ---------------------------------------------------------------------------

export interface Brand extends AuditFields {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  is_active: boolean;
  product_count?: number;
}

export interface CreateBrandRequest {
  name: string;
  description?: string | null;
  logo_url?: string | null;
  website_url?: string | null;
  is_active?: boolean;
}

export interface UpdateBrandRequest extends Partial<CreateBrandRequest> {}

// ---------------------------------------------------------------------------
// Unit of Measure (UoM)
// ---------------------------------------------------------------------------

export interface UnitOfMeasure extends AuditFields {
  id: string;
  name: string;
  symbol: string;
  description: string | null;
  is_active: boolean;
}

export interface CreateUomRequest {
  name: string;
  symbol: string;
  description?: string | null;
  is_active?: boolean;
}

export interface UpdateUomRequest extends Partial<CreateUomRequest> {}

// ---------------------------------------------------------------------------
// Supplier
// ---------------------------------------------------------------------------

export interface Supplier extends AuditFields {
  id: string;
  company_name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  notes: string | null;
  is_active: boolean;
  product_count?: number;
}

export interface CreateSupplierRequest {
  company_name: string;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  notes?: string | null;
  is_active?: boolean;
}

export interface UpdateSupplierRequest extends Partial<CreateSupplierRequest> {}

// ---------------------------------------------------------------------------
// Product
// ---------------------------------------------------------------------------

export interface Product {
  id: string;
  sku: string;
  barcode: string | null;
  name: string;
  description: string | null;
  short_description: string | null;
  category: CategorySummary | null;
  brand: BrandSummary | null;
  uom: UomSummary | null;
  supplier: SupplierSummary | null;
  cost_price: number;
  selling_price: number;
  reorder_level: number;
  reorder_quantity: number;
  image_path: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrandSummary {
  id: string;
  name: string;
}

export interface UomSummary {
  id: string;
  name: string;
  symbol: string;
}

export interface SupplierSummary {
  id: string;
  supplier_code: string;
  name: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string | null;
  short_description?: string | null;
  category_id?: string | null;
  brand_id?: string | null;
  uom_id?: string | null;
  supplier_id?: string | null;
  cost_price?: number;
  selling_price?: number;
  reorder_level?: number;
  reorder_quantity?: number;
  is_active?: boolean;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string | null;
  short_description?: string | null;
  category_id?: string | null;
  brand_id?: string | null;
  uom_id?: string | null;
  supplier_id?: string | null;
  cost_price?: number;
  selling_price?: number;
  reorder_level?: number;
  reorder_quantity?: number;
  is_active?: boolean;
}

export interface ProductListParams {
  page?: number;
  size?: number;
  search?: string;
  ordering?: string;
  active_only?: boolean;
  category_id?: string;
  brand_id?: string;
  supplier_id?: string;
}

export interface BulkImportResult {
  imported: number;
  failed: number;
  errors: Array<{ row: number; message: string }>;
}
