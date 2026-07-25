"use client";

/**
 * PermissionGuard — conditionally renders children based on permissions.
 *
 * @example
 * <PermissionGuard permission="products.create">
 *   <CreateProductButton />
 * </PermissionGuard>
 *
 * @example — require any of multiple permissions
 * <PermissionGuard anyOf={["inventory.adjust", "inventory.transfer"]}>
 *   <AdjustStockPanel />
 * </PermissionGuard>
 */

import * as React from "react";
import { useAuthStore } from "@/stores/auth.store";
import { canAccessAll, canAccessAny } from "@/lib/auth/permissions";
import type { Permission } from "@/lib/auth/permissions";
import type { UserRole } from "@/lib/auth";

interface PermissionGuardProps {
  children: React.ReactNode;
  /** Require a single permission */
  permission?: Permission;
  /** Require ALL listed permissions */
  allOf?: Permission[];
  /** Require ANY of listed permissions */
  anyOf?: Permission[];
  /** Rendered when the guard fails (optional fallback) */
  fallback?: React.ReactNode;
}

export function PermissionGuard({
  children,
  permission,
  allOf,
  anyOf,
  fallback = null,
}: PermissionGuardProps) {
  const { role, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !role) return <>{fallback}</>;

  const userRole = role as UserRole;

  if (permission && !canAccessAll(userRole, [permission])) {
    return <>{fallback}</>;
  }

  if (allOf && !canAccessAll(userRole, allOf)) {
    return <>{fallback}</>;
  }

  if (anyOf && !canAccessAny(userRole, anyOf)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
