"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sun, Moon, Monitor, ChevronRight } from "lucide-react";
import Link from "next/link";
import { UserMenu } from "./UserMenu";
import { useAppTheme } from "@/hooks/use-theme";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { NotificationBell } from "@/features/notifications";

const ROUTE_LABELS: Record<string, { parent?: string; title: string }> = {
  "/dashboard": { title: "Dashboard" },
  "/users": { title: "Users" },
  "/products": { title: "Products" },
  "/categories": { title: "Categories" },
  "/brands": { title: "Brands" },
  "/suppliers": { title: "Suppliers" },
  "/procurement/purchase-orders": { parent: "Procurement", title: "Purchase Orders" },
  "/procurement/grns": { parent: "Procurement", title: "Goods Received Notes" },
  "/inventory": { title: "Inventory Management" },
  "/stock-release": { title: "Stock Release Requests" },
  "/notifications": { title: "Notification Center" },
  "/reports": { title: "Reports & Analytics" },
  "/profile": { title: "User Profile" },
  "/admin/users": { parent: "Administration", title: "User Management" },
  "/admin/company": { parent: "Administration", title: "Company Profile" },
  "/admin/settings": { parent: "Administration", title: "System Settings" },
  "/admin/email": { parent: "Administration", title: "Email Config" },
  "/admin/sequences": { parent: "Administration", title: "Numbering Sequences" },
  "/admin/activity": { parent: "Administration", title: "Activity Log" },
  "/admin/audit": { parent: "Administration", title: "Audit Trail" },
};

function ThemeToggle() {
  const { setTheme, resolvedTheme, mounted } = useAppTheme();

  if (!mounted) {
    return <div className="h-8 w-8" aria-hidden="true" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Toggle theme (current: ${resolvedTheme})`}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          {resolvedTheme === "dark" ? (
            <Moon className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Sun className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" aria-hidden="true" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" aria-hidden="true" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" aria-hidden="true" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppHeader() {
  const pathname = usePathname();
  const safePathname = pathname || "/";
  const routeInfo = ROUTE_LABELS[safePathname] ?? {
    title: safePathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") ?? "Dashboard",
  };

  return (
    <header
      role="banner"
      aria-label="Application Header"
      className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/95 backdrop-blur-sm px-4 md:px-6 transition-colors"
    >
      {/* Left — Dynamic Breadcrumb / Page Title */}
      <div className="flex items-center gap-2 text-sm font-medium">
        <div className="hidden items-center gap-2 md:flex">
          {routeInfo.parent && (
            <>
              <span className="text-muted-foreground">{routeInfo.parent}</span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden="true" />
            </>
          )}
          <span className="font-semibold text-foreground">{routeInfo.title}</span>
        </div>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-1.5">
        <ThemeToggle />
        <NotificationBell />
        <div className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
        <UserMenu />
      </div>
    </header>
  );
}

