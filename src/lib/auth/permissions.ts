/**
 * Role-based access control — permission definitions.
 *
 * Three canonical roles for SIMS Lite (matching backend API):
 *   ADMIN        — full system access
 *   OFFICER      — procurement / reporting / master data
 *   STORE_KEEPER — inventory management
 *
 * Permission keys use dot-notation: domain.action
 * They are mapped from the backend API permission names:
 *   users:read        → users.view
 *   users:write       → users.create / users.edit
 *   users:delete      → users.delete
 *   roles:read        → roles.view (mapped to settings.view)
 *   roles:write       → roles.write (mapped to settings.edit)
 *   roles:delete      → roles.delete (mapped to settings.edit)
 *   permissions:read  → permissions.view (mapped to settings.view)
 *   permissions:write → permissions.write (mapped to settings.edit)
 *   audit_logs:read   → audit_logs.view
 *   reports:read      → reports.view
 *   reports:export    → reports.export
 *   inventory:read    → inventory.view
 *   inventory:write   → inventory.adjust / inventory.transfer
 *   inventory:approve → inventory.approve / stock_release.approve
 *   procurement:read  → purchase_orders.view / grn.view
 *   procurement:write → purchase_orders.create / purchase_orders.edit / grn.create / grn.edit
 *   procurement:approve → purchase_orders.approve
 *   master_data:read  → products.view / categories.view / brands.view / suppliers.view
 *   master_data:write → products.create / products.edit / categories.create / categories.edit / brands.create / brands.edit / suppliers.create / suppliers.edit
 *   master_data:delete → products.delete / categories.delete / brands.delete / suppliers.delete
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
  // Roles & Permissions (admin-level)
  | "roles.view"
  | "roles.write"
  | "roles.delete"
  // Audit logs
  | "audit_logs.view"
  // Products (master_data:read/write/delete)
  | "products.view"
  | "products.create"
  | "products.edit"
  | "products.delete"
  // Categories (master_data:read/write/delete)
  | "categories.view"
  | "categories.create"
  | "categories.edit"
  | "categories.delete"
  // Brands (master_data:read/write/delete)
  | "brands.view"
  | "brands.create"
  | "brands.edit"
  | "brands.delete"
  // Suppliers (master_data:read/write/delete)
  | "suppliers.view"
  | "suppliers.create"
  | "suppliers.edit"
  | "suppliers.delete"
  // Purchase Orders (procurement:read/write/approve)
  | "purchase_orders.view"
  | "purchase_orders.create"
  | "purchase_orders.edit"
  | "purchase_orders.approve"
  | "purchase_orders.delete"
  // GRN (procurement:read/write)
  | "grn.view"
  | "grn.create"
  | "grn.edit"
  // Inventory (inventory:read/write/approve)
  | "inventory.view"
  | "inventory.adjust"
  | "inventory.transfer"
  | "inventory.approve"
  // Stock Release (inventory:write/approve maps here)
  | "stock_release.view"
  | "stock_release.create"
  | "stock_release.approve"
  // Reports (reports:read/export)
  | "reports.view"
  | "reports.export"
  // Settings (roles:read/write → settings.view/edit)
  | "settings.view"
  | "settings.edit"
  // Notifications
  | "notifications.view";

// ---------------------------------------------------------------------------
// Role → permissions map
//
// Derived directly from the backend API permission sets:
//
// ADMIN permissions (backend):
//   users:read, users:write, users:delete,
//   roles:read, roles:write, roles:delete,
//   permissions:read, permissions:write,
//   audit_logs:read,
//   reports:read, reports:export,
//   inventory:read, inventory:write, inventory:approve,
//   procurement:read, procurement:write, procurement:approve,
//   master_data:read, master_data:write, master_data:delete
//
// OFFICER permissions (backend):
//   master_data:read, master_data:write,
//   procurement:read, procurement:write,
//   reports:read, reports:export,
//   inventory:read
//
// STORE_KEEPER permissions (backend):
//   master_data:read,
//   inventory:read, inventory:write, inventory:approve,
//   procurement:read
// ---------------------------------------------------------------------------

const ADMIN_PERMISSIONS: Permission[] = [
  "dashboard.view",
  // Users
  "users.view",
  "users.create",
  "users.edit",
  "users.delete",
  // Roles & Permissions
  "roles.view",
  "roles.write",
  "roles.delete",
  // Audit Logs
  "audit_logs.view",
  // Master Data — full access
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
  // Procurement — full access including approve
  "purchase_orders.view",
  "purchase_orders.create",
  "purchase_orders.edit",
  "purchase_orders.approve",
  "purchase_orders.delete",
  "grn.view",
  "grn.create",
  "grn.edit",
  // Inventory — full access including approve
  "inventory.view",
  "inventory.adjust",
  "inventory.transfer",
  "inventory.approve",
  // Stock Release — full access including approve
  "stock_release.view",
  "stock_release.create",
  "stock_release.approve",
  // Reports — read & export
  "reports.view",
  "reports.export",
  // Settings — full access
  "settings.view",
  "settings.edit",
  // Notifications
  "notifications.view",
];

const OFFICER_PERMISSIONS: Permission[] = [
  "dashboard.view",
  // Master Data — read & write (no delete)
  "products.view",
  "products.create",
  "products.edit",
  "categories.view",
  "categories.create",
  "categories.edit",
  "brands.view",
  "brands.create",
  "brands.edit",
  "suppliers.view",
  "suppliers.create",
  "suppliers.edit",
  // Procurement — read & write (no approve)
  "purchase_orders.view",
  "purchase_orders.create",
  "purchase_orders.edit",
  "grn.view",
  "grn.create",
  "grn.edit",
  // Inventory — read only
  "inventory.view",
  // Stock Release — view only (cannot create or approve)
  "stock_release.view",
  // Reports — read & export
  "reports.view",
  "reports.export",
  // Notifications
  "notifications.view",
];

const STORE_KEEPER_PERMISSIONS: Permission[] = [
  "dashboard.view",
  // Master Data — read only
  "products.view",
  "categories.view",
  "brands.view",
  "suppliers.view",
  // Procurement — read only (no grn.create/edit/submit/cancel)
  "purchase_orders.view",
  "grn.view",
  // Inventory — full access including approve (inventory:write + inventory:approve)
  "inventory.view",
  "inventory.adjust",
  "inventory.transfer",
  "inventory.approve",
  // Stock Release — view, create & approve (maps from inventory:write / inventory:approve)
  "stock_release.view",
  "stock_release.create",
  "stock_release.approve",
  // Notifications
  "notifications.view",
];

// Map each role to its permission set
const ROLE_PERMISSIONS: Record<UserRole, Set<Permission>> = {
  admin: new Set(ADMIN_PERMISSIONS),
  officer: new Set(OFFICER_PERMISSIONS),
  store_keeper: new Set(STORE_KEEPER_PERMISSIONS),
};

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/**
 * Check if a role has a specific permission.
 *
 * @example
 * canAccess("admin", "products.create") // true
 * canAccess("store_keeper", "users.delete") // false
 */
export function canAccess(role: UserRole | string | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role as UserRole]?.has(permission) ?? false;
}

/**
 * Return all permissions for a given role.
 */
export function getPermissions(role: UserRole | string | null | undefined): Permission[] {
  if (!role) return [];
  return Array.from(ROLE_PERMISSIONS[role as UserRole] ?? []);
}

/**
 * Check if a role has ALL of the specified permissions.
 */
export function canAccessAll(role: UserRole | string | null | undefined, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.every((p) => canAccess(role, p));
}

/**
 * Check if a role has ANY of the specified permissions.
 */
export function canAccessAny(role: UserRole | string | null | undefined, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.some((p) => canAccess(role, p));
}

