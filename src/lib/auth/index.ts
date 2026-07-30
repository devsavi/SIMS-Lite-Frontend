/**
 * Auth library — role definitions, user type, and re-exports.
 *
 * Three canonical roles matching the backend API:
 *   ADMIN        → "admin"
 *   OFFICER      → "officer"
 *   STORE_KEEPER → "store_keeper"
 */

export type UserRole = "admin" | "officer" | "store_keeper";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  is_superuser?: boolean;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  officer: "Officer",
  store_keeper: "Store Keeper",
};

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 3,
  officer: 2,
  store_keeper: 1,
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
