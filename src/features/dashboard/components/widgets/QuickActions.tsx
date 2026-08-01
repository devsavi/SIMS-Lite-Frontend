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
    href: "/products?create=true",
    icon: Package,
    permission: "products.create",
    // created chip — blue
    color: "bg-[#DCEBFC] text-[#1D63C4] dark:bg-[rgba(96,165,250,0.15)] dark:text-[#60A5FA]",
  },
  {
    id: "create-supplier",
    label: "Create Supplier",
    description: "Register a new supplier",
    href: "/suppliers?create=true",
    icon: Truck,
    permission: "suppliers.create",
    // approved chip — green
    color: "bg-[#D6F5DE] text-[#1B8A4C] dark:bg-[rgba(52,211,153,0.15)] dark:text-[#34D399]",
  },
  {
    id: "create-po",
    label: "Create Purchase Order",
    description: "Raise a new purchase order",
    href: "/procurement/purchase-orders/new",
    icon: ShoppingCart,
    permission: "purchase_orders.create",
    // updated chip — amber-orange
    color: "bg-[#FEEAD3] text-[#C1650F] dark:bg-[rgba(251,146,60,0.15)] dark:text-[#FB923C]",
  },
  {
    id: "view-inventory",
    label: "View Inventory",
    description: "Browse current stock levels",
    href: "/inventory",
    icon: Archive,
    permission: "inventory.view",
    // deleted chip — charcoal grey
    color: "bg-[#E7E7E7] text-[#4A4A4A] dark:bg-[rgba(148,163,184,0.15)] dark:text-[#94A3B8]",
  },
  {
    id: "view-reports",
    label: "View Reports",
    description: "Analytics and reporting",
    href: "/reports",
    icon: BarChart2,
    permission: "reports.view",
    // received chip — teal
    color: "bg-[#D3F3F1] text-[#12796F] dark:bg-[rgba(45,212,191,0.15)] dark:text-[#2DD4BF]",
  },
];

const OFFICER_ACTIONS: QuickAction[] = [
  {
    id: "create-po",
    label: "Create Purchase Order",
    description: "Raise a new purchase order",
    href: "/procurement/purchase-orders/new",
    icon: ShoppingCart,
    permission: "purchase_orders.create",
    // updated chip — amber-orange
    color: "bg-[#FEEAD3] text-[#C1650F] dark:bg-[rgba(251,146,60,0.15)] dark:text-[#FB923C]",
  },
  {
    id: "receive-goods",
    label: "Receive Goods",
    description: "Record goods receipt",
    href: "/grn/new",
    icon: ClipboardList,
    permission: "grn.create",
    // received chip — teal
    color: "bg-[#D3F3F1] text-[#12796F] dark:bg-[rgba(45,212,191,0.15)] dark:text-[#2DD4BF]",
  },
  {
    id: "view-inventory",
    label: "View Inventory",
    description: "Browse current stock levels",
    href: "/inventory",
    icon: Archive,
    permission: "inventory.view",
    // deleted chip — charcoal grey
    color: "bg-[#E7E7E7] text-[#4A4A4A] dark:bg-[rgba(148,163,184,0.15)] dark:text-[#94A3B8]",
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
    // created chip — blue
    color: "bg-[#DCEBFC] text-[#1D63C4] dark:bg-[rgba(96,165,250,0.15)] dark:text-[#60A5FA]",
  },
  {
    id: "stock-release",
    label: "Stock Release",
    description: "Process a stock release",
    href: "/stock-release/new",
    icon: ArrowUpFromLine,
    permission: "stock_release.create",
    // released chip — purple
    color: "bg-[#EAE1FB] text-[#6D28D9] dark:bg-[rgba(167,139,250,0.15)] dark:text-[#A78BFA]",
  },
  {
    id: "view-inventory",
    label: "View Inventory",
    description: "Browse current stock levels",
    href: "/inventory",
    icon: Archive,
    permission: "inventory.view",
    // deleted chip — charcoal grey
    color: "bg-[#E7E7E7] text-[#4A4A4A] dark:bg-[rgba(148,163,184,0.15)] dark:text-[#94A3B8]",
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
