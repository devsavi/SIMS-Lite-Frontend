export type ActivityStatus = "SUCCESS" | "FAILED" | "WARNING";

export interface ActivityLogEntry {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  action: string;
  module: string;
  status: ActivityStatus;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

export interface ActivityFilterParams {
  search?: string;
  user?: string;
  module?: string;
  status?: ActivityStatus | "ALL";
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ActivityLogResponse {
  data: ActivityLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
