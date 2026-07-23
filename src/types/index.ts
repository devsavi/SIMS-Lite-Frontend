// ---------------------------------------------------------------------------
// Shared primitive types
// ---------------------------------------------------------------------------

export type ID = string;

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Status types shared across features
// ---------------------------------------------------------------------------

export type ActiveStatus = "active" | "inactive";

export type ApprovalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

// ---------------------------------------------------------------------------
// Audit fields (present on most entities)
// ---------------------------------------------------------------------------

export interface AuditFields {
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}
