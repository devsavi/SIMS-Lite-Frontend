"use client";

/**
 * PermissionGuard — re-exported from the app-level component for use in
 * shared/common components without changing the import path convention.
 *
 * Feature modules should import from this path:
 *   import { PermissionGuard } from "@/components/common/permission-guard"
 */
export { PermissionGuard } from "@/app/components/auth/PermissionGuard";
export type { } from "@/app/components/auth/PermissionGuard";
