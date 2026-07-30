// ---- Audit Log Entry (matches GET /admin/audit-logs/ response) ----

export interface AuditLogActor {
  id: string;
  email: string;
  full_name: string;
}

export interface AuditLogEntry {
  id: string;
  actor_id: string;
  actor: AuditLogActor;
  action: string;
  resource_type: string;
  resource_id: string;
  ip_address: string;
  status: "success" | "failure";
  detail: Record<string, any> | null;
  created_at: string;
}

// ---- Filter Params ----

export type AuditPeriod = "today" | "week" | "month" | "custom";
export type AuditActionCategory = "all" | "auth" | "user" | "inventory";
export type AuditResourceType = "all" | "User" | "Product" | "PurchaseOrder";

export interface AuditLogFilterParams {
  period: AuditPeriod;
  date_from?: string;
  date_to?: string;
  action: AuditActionCategory;
  user_id?: string;
  resource_type: AuditResourceType;
  page: number;
  size: number;
}

// ---- API Response ----

export interface AuditLogPagination {
  page: number;
  size: number;
  total: number;
  pages: number;
}

export interface AuditLogApiResponse {
  status: string;
  data: AuditLogEntry[];
  pagination: AuditLogPagination;
}
