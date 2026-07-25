"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  Tag,
  Award,
  Truck,
  ShoppingCart,
  ClipboardList,
  Archive,
  ArrowUpFromLine,
  BarChart2,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useAuthStore } from "@/stores/auth.store";
import { useSidebarStore } from "@/stores/sidebar.store";
import { canAccessAny } from "@/lib/auth/permissions";
import type { UserRole } from "@/lib/auth";
import type { Permission } from "@/lib/auth/permissions";

// ---------------------------------------------------------------------------
// Nav item definition
// ---------------------------------------------------------------------------

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permissions: Permission[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permissions: ["dashboard.view"],
  },
  {
    label: "Users",
    href: "/users",
    icon: Users,
    permissions: ["users.view"],
  },
  {
    label: "Products",
    href: "/products",
    icon: Package,
    permissions: ["products.view"],
  },
  {
    label: "Categories",
    href: "/categories",
    icon: Tag,
    permissions: ["categories.view"],
  },
  {
    label: "Brands",
    href: "/brands",
    icon: Award,
    permissions: ["brands.view"],
  },
  {
    label: "Suppliers",
    href: "/suppliers",
    icon: Truck,
    permissions: ["suppliers.view"],
  },
  {
    label: "Purchase Orders",
    href: "/purchase-orders",
    icon: ShoppingCart,
    permissions: ["purchase_orders.view"],
  },
  {
    label: "GRN",
    href: "/grn",
    icon: ClipboardList,
    permissions: ["grn.view"],
  },
  {
    label: "Inventory",
    href: "/inventory",
    icon: Archive,
    permissions: ["inventory.view"],
  },
  {
    label: "Stock Release",
    href: "/stock-release",
    icon: ArrowUpFromLine,
    permissions: ["stock_release.view"],
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    permissions: ["notifications.view"],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart2,
    permissions: ["reports.view"],
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    permissions: ["settings.view"],
  },
];

// ---------------------------------------------------------------------------
// NavLink
// ---------------------------------------------------------------------------

interface NavLinkProps {
  item: NavItem;
  collapsed: boolean;
  onClick?: () => void;
}

function NavLink({ item, collapsed, onClick }: NavLinkProps) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        collapsed && "justify-center px-2"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// AppSidebar
// ---------------------------------------------------------------------------

export function AppSidebar() {
  const { role } = useAuthStore();
  const { isCollapsed, isMobileOpen, toggle, setMobileOpen } = useSidebarStore();

  const visibleItems = React.useMemo(() => {
    if (!role) return [];
    return NAV_ITEMS.filter((item) =>
      canAccessAny(role as UserRole, item.permissions)
    );
  }, [role]);

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        aria-label="Application navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar-background",
          "transition-[width] duration-200 ease-in-out",
          // Desktop collapsed/expanded
          "hidden md:flex",
          isCollapsed ? "md:w-16" : "md:w-64",
          // Mobile: slide in
          isMobileOpen && "flex w-64"
        )}
      >
        {/* Logo + collapse toggle */}
        <div
          className={cn(
            "flex h-14 shrink-0 items-center border-b border-sidebar-border px-4",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center bg-primary">
                <span className="text-xs font-bold text-primary-foreground">S</span>
              </div>
              <span className="text-sm font-semibold text-sidebar-foreground">
                SIMS Lite
              </span>
            </Link>
          )}

          {/* Mobile close */}
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="rounded-sm p-1 text-sidebar-foreground hover:bg-sidebar-accent md:hidden"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Desktop collapse toggle */}
          <button
            type="button"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={toggle}
            className="hidden rounded-sm p-1 text-sidebar-foreground hover:bg-sidebar-accent md:block"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-2" aria-label="Main navigation">
          <ul className="space-y-0.5 px-2" role="list">
            {visibleItems.map((item) => (
              <li key={item.href}>
                <NavLink
                  item={item}
                  collapsed={isCollapsed}
                  onClick={() => setMobileOpen(false)}
                />
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Mobile hamburger (rendered outside sidebar for accessibility) */}
      <button
        type="button"
        aria-label="Open navigation menu"
        onClick={() => setMobileOpen(true)}
        className={cn(
          "fixed left-4 top-4 z-20 rounded-sm p-1.5 text-foreground",
          "bg-card border border-border shadow-sm",
          "md:hidden",
          isMobileOpen && "hidden"
        )}
      >
        <Menu className="h-4 w-4" />
      </button>
    </>
  );
}
