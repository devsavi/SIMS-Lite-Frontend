import type { UserRole } from "@/lib/auth";

export type UserStatus = "ACTIVE" | "INACTIVE" | "PENDING";

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string;
  department?: string;
  phone?: string;
}

export interface UserActivityLog {
  id: string;
  action: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserNotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface UserDetailItem extends UserItem {
  activities: UserActivityLog[];
  notifications: UserNotificationItem[];
  permissions: string[];
}

export interface UserFilterParams {
  search?: string;
  role?: UserRole | "ALL";
  status?: UserStatus | "ALL";
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateUserDTO {
  email: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_active?: boolean;
  is_verified?: boolean;
  role_ids?: string[];
  // Fallbacks for mock UI components
  name?: string;
  role?: UserRole;
  department?: string;
  sendInviteEmail?: boolean;
}

export interface UpdateUserDTO {
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_active?: boolean;
  is_verified?: boolean;
  // Fallbacks for mock UI components
  name?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  department?: string;
}

export interface ResetPasswordDTO {
  userId: string;
  auto_generate: boolean;
  new_password?: string;
}

export interface AssignRoleDTO {
  userId: string;
  role: UserRole;
  reason?: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  created_at: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  is_system: boolean;
  permissions?: Permission[];
  created_at?: string;
}

