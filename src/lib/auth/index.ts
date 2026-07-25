/**
 * Auth library — role definitions, user type, and re-exports.
 */

export type UserRole =
  | "super_admin"
  | "admin"
  | "warehouse_manager"
  | "procurement_officer"
  | "stock_clerk"
  | "viewer";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  warehouse_manager: "Warehouse Manager",
  procurement_officer: "Procurement Officer",
  stock_clerk: "Stock Clerk",
  viewer: "Viewer",
};

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 6,
  admin: 5,
  warehouse_manager: 4,
  procurement_officer: 3,
  stock_clerk: 2,
  viewer: 1,
};

export function hasPermission(
  userRole: UserRole,
  requiredRole: UserRole
): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// Re-export permissions helpers
export { canAccess, canAccessAll, canAccessAny, getPermissions } from "./permissions";
export type { Permission } from "./permissions";

// Re-export token helpers
export { accessToken, refreshToken, persistedUser, clearAllTokens, isSessionValid } from "./token";
