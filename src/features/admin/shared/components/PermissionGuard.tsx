"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { canAccess, canAccessAny } from "@/lib/auth/permissions";
import type { UserRole } from "@/lib/auth";
import type { Permission } from "@/lib/auth/permissions";

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  requiredPermissions?: Permission[];
  fallbackUrl?: string;
}

export function PermissionGuard({
  children,
  requiredPermission,
  requiredPermissions,
  fallbackUrl = "/dashboard",
}: PermissionGuardProps) {
  const { user, role } = useAuthStore();

  const userRole = role as UserRole | undefined;

  const hasAccess = React.useMemo(() => {
    if (user?.is_superuser) return true;
    if (!userRole) return false;
    if (requiredPermission) {
      return canAccess(userRole, requiredPermission);
    }
    if (requiredPermissions && requiredPermissions.length > 0) {
      return canAccessAny(userRole, requiredPermissions);
    }
    // Default to admin requirement if no specific permission specified
    return userRole === "admin";
  }, [user, userRole, requiredPermission, requiredPermissions]);

  if (!hasAccess) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-none border border-border bg-card p-8 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-none bg-destructive/10 text-destructive mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          You do not have administrative privileges to access this page or system settings section.
          Please contact your administrator if you believe this is an error.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Link
            href={fallbackUrl}
            className="inline-flex items-center gap-2 rounded-none bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
