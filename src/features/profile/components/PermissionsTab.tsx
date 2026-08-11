"use client";

import * as React from "react";
import { ShieldCheck, CheckCircle2, Lock, Info, Layers } from "lucide-react";
import { getPermissions, type Permission } from "@/lib/auth/permissions";
import { ROLE_LABELS, type UserRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import type { UserProfile } from "../types";

interface PermissionsTabProps {
  profile: UserProfile;
}

interface PermissionGroup {
  name: string;
  permissions: { key: Permission; label: string }[];
}

const ALL_PERMISSION_GROUPS: PermissionGroup[] = [
  {
    name: "Dashboard & Navigation",
    permissions: [
      { key: "dashboard.view", label: "View Executive Dashboard" },
    ],
  },
  {
    name: "Users & Administration",
    permissions: [
      { key: "users.view", label: "View Users List" },
      { key: "users.create", label: "Create New User" },
      { key: "users.edit", label: "Edit User Details & Roles" },
      { key: "users.delete", label: "Deactivate or Delete Users" },
      { key: "roles.view", label: "View Roles & Permissions" },
      { key: "roles.write", label: "Create & Edit Roles" },
      { key: "roles.delete", label: "Delete Roles" },
      { key: "audit_logs.view", label: "View Audit Logs" },
    ],
  },
  {
    name: "Products & Catalog",
    permissions: [
      { key: "products.view", label: "View Product Catalog" },
      { key: "products.create", label: "Add New Products" },
      { key: "products.edit", label: "Edit Product Details & Specs" },
      { key: "products.delete", label: "Archive / Delete Products" },
    ],
  },
  {
    name: "Categories & Brands",
    permissions: [
      { key: "categories.view", label: "View Categories" },
      { key: "categories.edit", label: "Create & Edit Categories" },
      { key: "brands.view", label: "View Brands" },
      { key: "brands.edit", label: "Create & Edit Brands" },
      { key: "uoms.view", label: "View Units of Measure" },
    ],
  },
  {
    name: "Suppliers & Procurement",
    permissions: [
      { key: "suppliers.view", label: "View Supplier List" },
      { key: "suppliers.edit", label: "Manage Supplier Profiles" },
      { key: "purchase_orders.view", label: "View Purchase Orders" },
      { key: "purchase_orders.create", label: "Draft Purchase Orders" },
      { key: "purchase_orders.approve", label: "Approve Purchase Orders" },
      { key: "grn.view", label: "View Goods Received Notes (GRN)" },
      { key: "grn.create", label: "Process & Confirm GRN" },
    ],
  },
  {
    name: "Inventory & Stock Release",
    permissions: [
      { key: "inventory.view", label: "View Stock & Warehouses" },
      { key: "inventory.adjust", label: "Perform Stock Adjustments" },
      { key: "inventory.transfer", label: "Transfer Stock Between Locations" },
      { key: "inventory.approve", label: "Approve Stock Adjustments" },
      { key: "stock_release.view", label: "View Stock Releases" },
      { key: "stock_release.create", label: "Create Stock Release Requests" },
      { key: "stock_release.approve", label: "Approve Stock Releases" },
    ],
  },
  {
    name: "Reports & System Settings",
    permissions: [
      { key: "notifications.view", label: "View Notifications" },
      { key: "reports.view", label: "View Reports & Data Export" },
      { key: "reports.export", label: "Export CSV / PDF Reports" },
      { key: "settings.view", label: "View System Settings" },
      { key: "settings.edit", label: "Edit Global Company Settings" },
    ],
  },
];

export function PermissionsTab({ profile }: PermissionsTabProps) {
  const userRole = profile.role as UserRole;
  const roleLabel = ROLE_LABELS[userRole] || userRole;
  const grantedPermissions = React.useMemo(() => new Set(getPermissions(userRole)), [userRole]);

  return (
    <div className="space-y-6">
      {/* Role Overview Card */}
      <Card className="rounded-none border border-border bg-card">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Assigned Role & Access Rights
              </CardTitle>
              <CardDescription className="text-xs">
                Your current role determines your authority and operational capabilities within SIMS Lite.
              </CardDescription>
            </div>
            <Badge variant="outline" className="rounded-none bg-primary/10 text-primary border-primary/20 font-semibold px-3 py-1 text-xs self-start sm:self-auto">
              {roleLabel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 border border-border bg-muted/20 p-4">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-semibold text-foreground">Role Security Policy</span>
              <p className="text-muted-foreground leading-relaxed">
                Role permissions are managed centrally by System Administrators. If you require additional access permissions or need role escalation, please contact your IT administrator.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Breakdown Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Granular Permission Matrix ({grantedPermissions.size} permissions granted)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ALL_PERMISSION_GROUPS.map((group) => {
            const groupGrantedCount = group.permissions.filter((p) => grantedPermissions.has(p.key)).length;

            return (
              <Card key={group.name} className="rounded-none border border-border bg-card">
                <CardHeader className="py-3 px-4 border-b border-border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-semibold text-foreground">
                      {group.name}
                    </CardTitle>
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {groupGrantedCount} / {group.permissions.length} Enabled
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="space-y-2">
                    {group.permissions.map((perm) => {
                      const isGranted = grantedPermissions.has(perm.key);
                      return (
                        <div
                          key={perm.key}
                          className={`flex items-center justify-between p-2 text-xs border ${
                            isGranted
                              ? "border-emerald-500/20 bg-emerald-500/5 text-foreground"
                              : "border-border/60 bg-muted/10 text-muted-foreground/60"
                          }`}
                        >
                          <span className="font-medium">{perm.label}</span>
                          {isGranted ? (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Allowed
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Lock className="h-3 w-3" /> Restricted
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
