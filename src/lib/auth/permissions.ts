/**
 * Role-based access control — permission definitions.
 *
 * Three primary roles for SIMS Lite:
 *   ADMIN        — full system access
 *   OFFICER      — procurement / operations
 *   STORE_KEEPER — warehouse / inventory
 *
 * Extended roles from the Phase 0 architecture are kept for compatibility.
 */

import type { UserRole } from "./index";

// ---------------------------------------------------------------------------
// Permission keys (dot-notation: domain.action)
// ---------------------------------------------------------------------------

export type Permission =
  // Dashboard
  | "dashboard.view"
  // Users
  | "users.view"
  | "users.create"
  | "users.edit"
  | "users.delete"
  // Products
  | "products.view"
  | "products.create"
  | "products.edit"
  | "products.delete"
  // Categories
  | "categories.view"
  | "categories.create"
  | "categories.edit"
  | "categories.delete"
  // Brands
  | "brands.view"
  | "brands.create"
  | "brands.edit"
  | "brands.delete"
  // Suppliers
  | "suppliers.view"
  | "suppliers.create"
  | "suppliers.edit"
  | "suppliers.delete"
  // Purchase Orders
  | "purchase_orders.view"
  | "purchase_orders.create"
  | "purchase_orders.edit"
  | "purchase_orders.approve"
  | "purchase_orders.delete"
  // GRN
  | "grn.view"
  | "grn.create"
  | "grn.edit"
  // Inventory
  | "inventory.view"
  | "inventory.adjust"
  | "inventory.transfer"
  // Stock Release
  | "stock_release.view"
  | "stock_release.create"
  | "stock_release.approve"
  // Reports
  | "reports.view"
  | "reports.export"
  // Settings
  | "settings.view"
  | "settings.edit"
  // Notifications
  | "notifications.view";

// ---------------------------------------------------------------------------
// Role → permissions map
// ---------------------------------------------------------------------------

const ADMIN_PERMISSIONS: Permission[] = [
  "dashboard.view",
  "users.view",
  "users.create",
  "users.edit",
  "users.delete",
  "products.view",
  "products.create",
  "products.edit",
  "products.delete",
  "categories.view",
  "categories.create",
  "categories.edit",
  "categories.delete",
  "brands.view",
  "brands.create",
  "brands.edit",
  "brands.delete",
  "suppliers.view",
  "suppliers.create",
  "suppliers.edit",
  "suppliers.delete",
  "purchase_orders.view",
  "purchase_orders.create",
  "purchase_orders.edit",
  "purchase_orders.approve",
  "purchase_orders.delete",
  "grn.view",
  "grn.create",
  "grn.edit",
  "inventory.view",
  "inventory.adjust",
  "inventory.transfer",
  "stock_release.view",
  "stock_release.create",
  "stock_release.approve",
  "reports.view",
  "reports.export",
  "settings.view",
  "settings.edit",
  "notifications.view",
];

const OFFICER_PERMISSIONS: Permission[] = [
  "dashboard.view",
  "products.view",
  "suppliers.view",
  "suppliers.create",
  "suppliers.edit",
  "purchase_orders.view",
  "purchase_orders.create",
  "purchase_orders.edit",
  "grn.view",
  "grn.create",
  "grn.edit",
  "inventory.view",
  "stock_release.view",
  "stock_release.create",
  "reports.view",
  "reports.export",
  "notifications.view",
];

const STORE_KEEPER_PERMISSIONS: Permission[] = [
  "dashboard.view",
  "purchase_orders.view",
  "grn.view",
  "grn.create",
  "grn.edit",
  "inventory.view",
  "inventory.adjust",
  "inventory.transfer",
  "stock_release.view",
  "stock_release.create",
  "notifications.view",
];

// Map each role to its permission set
const ROLE_PERMISSIONS: Record<UserRole, Set<Permission>> = {
  super_admin: new Set(ADMIN_PERMISSIONS),
  admin: new Set(ADMIN_PERMISSIONS),
  warehouse_manager: new Set([
    ...STORE_KEEPER_PERMISSIONS,
    ...OFFICER_PERMISSIONS,
    "stock_release.approve",
  ]),
  procurement_officer: new Set(OFFICER_PERMISSIONS),
  stock_clerk: new Set(STORE_KEEPER_PERMISSIONS),
  viewer: new Set(["dashboard.view", "inventory.view", "reports.view", "notifications.view"]),
};

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/**
 * Check if a role has a specific permission.
 *
 * @example
 * canAccess("admin", "products.create") // true
 * canAccess("stock_clerk", "users.delete") // false
 */
export function canAccess(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
}

/**
 * Return all permissions for a given role.
 */
export function getPermissions(role: UserRole): Permission[] {
  return Array.from(ROLE_PERMISSIONS[role] ?? []);
}

/**
 * Check if a role has ALL of the specified permissions.
 */
export function canAccessAll(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((p) => canAccess(role, p));
}

/**
 * Check if a role has ANY of the specified permissions.
 */
export function canAccessAny(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((p) => canAccess(role, p));
}
