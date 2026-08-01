import type { UserRole } from "@/lib/auth";

export interface UserProfile {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: UserRole;
  phone?: string;
  department?: string;
  avatar?: string;
  bio?: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string | null;
  twoFactorEnabled?: boolean;
}

export interface UpdateProfileDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  avatar?: string;
  bio?: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserSessionItem {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface UserActivityLog {
  id: string;
  actor_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  ip_address: string;
  status: "success" | "failure";
  detail: Record<string, unknown> | null;
  created_at: string;
}

export type ActivityPeriod = "today" | "week" | "month" | "custom";
export type ActivityAction = "all" | "auth" | "user" | "inventory";
export type ActivityStatus = "all" | "success" | "failure";

export interface ActivityLogFilters {
  period: ActivityPeriod;
  date_from?: string;
  date_to?: string;
  action: ActivityAction;
  status: ActivityStatus;
  page: number;
  size: number;
}

export interface ActivityLogPagination {
  page: number;
  size: number;
  total: number;
  pages: number;
}

export interface ActivityLogResponse {
  data: UserActivityLog[];
  pagination: ActivityLogPagination;
}

