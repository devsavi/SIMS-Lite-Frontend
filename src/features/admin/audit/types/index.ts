export type AuditAction = "CREATE" | "UPDATE" | "DELETE";

export interface AuditFieldDiff {
  field: string;
  previousValue: any;
  newValue: any;
}

export interface AuditRecord {
  id: string;
  entity: string;
  entityId: string;
  action: AuditAction;
  userId: string;
  userName: string;
  userEmail: string;
  timestamp: string;
  ipAddress?: string;
  changedFields: string[];
  diffs: AuditFieldDiff[];
}

export interface AuditFilterParams {
  search?: string;
  entity?: string;
  action?: AuditAction | "ALL";
  user?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AuditTrailResponse {
  data: AuditRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
