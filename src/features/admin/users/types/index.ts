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
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  phone?: string;
  sendInviteEmail?: boolean;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  department?: string;
  phone?: string;
}

export interface ResetPasswordDTO {
  userId: string;
  newPassword?: string;
  requirePasswordChangeOnLogin?: boolean;
}

export interface AssignRoleDTO {
  userId: string;
  role: UserRole;
  reason?: string;
}
