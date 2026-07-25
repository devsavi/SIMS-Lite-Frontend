"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { PermissionGuard } from "@/components/common/permission-guard";
import {
  Package,
  Truck,
  ShoppingCart,
  Archive,
  BarChart2,
  ClipboardList,
  Settings,
  ArrowUpFromLine,
} from "lucide-react";
import type { Permission } from "@/lib/auth/permissions";

// ---------------------------------------------------------------------------
// Action definition
// ---------------------------------------------------------------------------

interface QuickAction {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: Permission;
  color: string;
}

// ---------------------------------------------------------------------------
// Role-specific action sets
// ---------------------------------------------------------------------------

const ADMIN_ACTIONS: QuickAction[] = [
  {
    id: "create-product",
    label: "Create Product",
    description: "Add new product to catalog",
    href: "/products/new",
    icon: Package,
    permission: "products.create",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    id: "create-supplier",
    label: "Create Supplier",
    description: "Register a new supplier",
    href: "/suppliers/new",
    icon: Truck,
    permission: "suppliers.create",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  {
    id: "create-po",
    label: "Create Purchase Order",
    description: "Raise a new purchase order",
    href: "/purchase-orders/new",
    icon: ShoppingCart,
    permission: "purchase_orders.create",
    color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  {
    id: "view-inventory",
    label: "View Inventory",
    description: "Browse current stock levels",
    href: "/inventory",
    icon: Archive,
    permission: "inventory.view",
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  {
    id: "view-reports",
    label: "View Reports",
    description: "Analytics and reporting",
    href: "/reports",
    icon: BarChart2,
    permission: "reports.view",
    color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  },
];

const OFFICER_ACTIONS: QuickAction[] = [
  {
    id: "create-po",
    label: "Create Purchase Order",
    description: "Raise a new purchase order",
    href: "/purchase-orders/new",
    icon: ShoppingCart,
    permission: "purchase_orders.create",
    color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  {
    id: "receive-goods",
    label: "Receive Goods",
    description: "Record goods receipt",
    href: "/grn/new",
    icon: ClipboardList,
    permission: "grn.create",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  {
    id: "view-inventory",
    label: "View Inventory",
    description: "Browse current stock levels",
    href: "/inventory",
    icon: Archive,
    permission: "inventory.view",
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
];

const STORE_KEEPER_ACTIONS: QuickAction[] = [
  {
    id: "stock-adjustment",
    label: "Stock Adjustment",
    description: "Adjust inventory quantities",
    href: "/inventory/adjust",
    icon: Settings,
    permission: "inventory.adjust",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    id: "stock-release",
    label: "Stock Release",
    description: "Process a stock release",
    href: "/stock-release/new",
    icon: ArrowUpFromLine,
    permission: "stock_release.create",
    color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  {
    id: "view-inventory",
    label: "View Inventory",
    description: "Browse current stock levels",
    href: "/inventory",
    icon: Archive,
    permission: "inventory.view",
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
];

// ---------------------------------------------------------------------------
// Single action card
// ---------------------------------------------------------------------------

interface ActionCardProps {
  action: QuickAction;
}

function ActionCard({ action }: ActionCardProps) {
  const Icon = action.icon;

  return (
    <Link
      href={action.href}
      className={cn(
        "group flex items-center gap-3 border border-border bg-card p-4 shadow-sm",
        "transition-all hover:shadow-md hover:border-primary/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
      aria-label={`${action.label}: ${action.description}`}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center transition-transform group-hover:scale-110",
          action.color
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{action.label}</p>
        <p className="text-xs text-muted-foreground truncate">{action.description}</p>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Public components — one per role
// ---------------------------------------------------------------------------

export function AdminQuickActions() {
  return (
    <section aria-labelledby="quick-actions-heading">
      <h2 id="quick-actions-heading" className="mb-3 text-sm font-semibold text-foreground">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {ADMIN_ACTIONS.map((action) => (
          <PermissionGuard key={action.id} permission={action.permission}>
            <ActionCard action={action} />
          </PermissionGuard>
        ))}
      </div>
    </section>
  );
}

export function OfficerQuickActions() {
  return (
    <section aria-labelledby="quick-actions-heading">
      <h2 id="quick-actions-heading" className="mb-3 text-sm font-semibold text-foreground">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {OFFICER_ACTIONS.map((action) => (
          <PermissionGuard key={action.id} permission={action.permission}>
            <ActionCard action={action} />
          </PermissionGuard>
        ))}
      </div>
    </section>
  );
}

export function StoreKeeperQuickActions() {
  return (
    <section aria-labelledby="quick-actions-heading">
      <h2 id="quick-actions-heading" className="mb-3 text-sm font-semibold text-foreground">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {STORE_KEEPER_ACTIONS.map((action) => (
          <PermissionGuard key={action.id} permission={action.permission}>
            <ActionCard action={action} />
          </PermissionGuard>
        ))}
      </div>
    </section>
  );
}
