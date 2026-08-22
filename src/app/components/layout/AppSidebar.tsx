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
  SlidersHorizontal,
  BarChart2,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ShieldCheck,
  Building2,
  Mail,
  Hash,
  Activity,
  ChevronDown,
  ChevronUp,
  Wrench,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useAuthStore } from "@/stores/auth.store";
import { useSidebarStore } from "@/stores/sidebar.store";
import { useSystemSettingsStore } from "@/stores/settings.store";
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

interface NavGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permissions: Permission[];
  items: NavItem[];
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
    label: "Units of Measure",
    href: "/uoms",
    icon: Hash,
    permissions: ["uoms.view"],
  },
  {
    label: "Suppliers",
    href: "/suppliers",
    icon: Truck,
    permissions: ["suppliers.view"],
  },
  {
    label: "Purchase Orders",
    href: "/procurement/purchase-orders",
    icon: ShoppingCart,
    permissions: ["purchase_orders.view"],
  },
  {
    label: "GRN",
    href: "/procurement/grns",
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
    label: "Stock Adjustments",
    href: "/inventory/adjustments",
    icon: SlidersHorizontal,
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
    label: "Tools & Utilities",
    href: "/tools",
    icon: Wrench,
    permissions: ["tools.view"],
  },
];

const ADMIN_GROUP: NavGroup = {
  label: "Administration",
  icon: ShieldCheck,
  permissions: ["settings.view"],
  items: [
    { label: "Company Profile", href: "/admin/company", icon: Building2, permissions: ["settings.edit"] },
    { label: "System Settings", href: "/admin/settings", icon: Settings, permissions: ["settings.view"] },
    { label: "Email Config", href: "/admin/email", icon: Mail, permissions: ["settings.edit"] },
    { label: "Activity Log", href: "/admin/activity", icon: Activity, permissions: ["settings.view"] },
  ],
};

// ---------------------------------------------------------------------------
// NavLink
// ---------------------------------------------------------------------------

interface NavLinkProps {
  item: NavItem;
  collapsed: boolean;
  onClick?: () => void;
  indent?: boolean;
}

function NavLink({ item, collapsed, onClick, indent = false }: NavLinkProps) {
  const pathname = usePathname();

  // For the base Inventory route, don't mark it active when we're on the adjustments sub-route
  const isActive = (() => {
    if (item.href === "/inventory") {
      return (
        pathname === "/inventory" ||
        (pathname.startsWith("/inventory/") &&
          !pathname.startsWith("/inventory/adjustments"))
      );
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  })();
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
        collapsed && "justify-center px-2",
        indent && !collapsed && "pl-7"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// AdminNavGroup
// ---------------------------------------------------------------------------

interface AdminNavGroupProps {
  group: NavGroup;
  collapsed: boolean;
  role: UserRole;
  onClick?: () => void;
}

function AdminNavGroup({ group, collapsed, role, onClick }: AdminNavGroupProps) {
  const pathname = usePathname();
  const isGroupActive = group.items.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  const [isOpen, setIsOpen] = React.useState(isGroupActive);
  const GroupIcon = group.icon;

  React.useEffect(() => {
    if (isGroupActive) setIsOpen(true);
  }, [isGroupActive]);

  const visibleItems = group.items.filter((item) =>
    canAccessAny(role, item.permissions)
  );

  if (visibleItems.length === 0) return null;

  if (collapsed) {
    const firstHref = visibleItems[0]?.href || "/admin/company";
    return (
      <li>
        <Link
          href={firstHref}
          title="Administration"
          className={cn(
            "flex items-center justify-center px-2 py-2 text-sm font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isGroupActive
              ? "bg-primary text-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <GroupIcon className="h-4 w-4 shrink-0" />
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={cn(
          "flex w-full items-center gap-3 px-3 py-2 text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isGroupActive
            ? "text-primary"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        <GroupIcon className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate text-left">{group.label}</span>
        {isOpen ? (
          <ChevronUp className="h-3.5 w-3.5 shrink-0" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 shrink-0" />
        )}
      </button>

      {isOpen && (
        <ul className="mt-0.5 space-y-0.5">
          {visibleItems.map((item) => (
            <li key={item.href}>
              <NavLink
                item={item}
                collapsed={false}
                onClick={onClick}
                indent
              />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

// ---------------------------------------------------------------------------
// AppSidebar
// ---------------------------------------------------------------------------

export function AppSidebar() {
  const { role } = useAuthStore();
  const { isCollapsed, isMobileOpen, toggle, setMobileOpen } = useSidebarStore();
  const { appTitle, logoUrl } = useSystemSettingsStore();

  const visibleItems = React.useMemo(() => {
    if (!role) return [];
    return NAV_ITEMS.filter((item) =>
      canAccessAny(role as UserRole, item.permissions)
    );
  }, [role]);

  const showAdminGroup = React.useMemo(() => {
    if (!role) return false;
    return canAccessAny(role as UserRole, ADMIN_GROUP.permissions);
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
              <div className={cn(
                "flex h-7 w-7 items-center justify-center overflow-hidden shrink-0",
                logoUrl ? "bg-transparent" : "bg-primary"
              )}>
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt={appTitle} className="h-full w-full object-contain p-0.5 bg-transparent" />
                ) : (
                  <span className="text-xs font-bold text-primary-foreground">
                    {appTitle.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-sm font-semibold text-sidebar-foreground truncate max-w-[150px]">
                {appTitle}
              </span>
            </Link>
          )}

          {/* Mobile close */}
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="rounded-none p-1 text-sidebar-foreground hover:bg-sidebar-accent md:hidden"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Desktop collapse toggle */}
          <button
            type="button"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={toggle}
            className="hidden rounded-none p-1 text-sidebar-foreground hover:bg-sidebar-accent md:block"
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

            {/* Administration Group */}
            {showAdminGroup && (
              <>
                {!isCollapsed && (
                  <li>
                    <div className="mt-3 mb-1 px-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                        Administration
                      </span>
                    </div>
                  </li>
                )}
                <AdminNavGroup
                  group={ADMIN_GROUP}
                  collapsed={isCollapsed}
                  role={role as UserRole}
                  onClick={() => setMobileOpen(false)}
                />
              </>
            )}
          </ul>
        </nav>
      </aside>

      {/* Mobile hamburger (rendered outside sidebar for accessibility) */}
      <button
        type="button"
        aria-label="Open navigation menu"
        onClick={() => setMobileOpen(true)}
        className={cn(
          "fixed left-4 top-4 z-20 rounded-none p-1.5 text-foreground",
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
