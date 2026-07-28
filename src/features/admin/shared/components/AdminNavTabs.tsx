"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Building2,
  Sliders,
  Mail,
  Hash,
  Activity,
  FileCheck,
} from "lucide-react";
import { cn } from "@/utils/cn";

export const ADMIN_TABS = [
  { id: "users", label: "Users", href: "/admin/users", icon: Users },
  { id: "company", label: "Company Profile", href: "/admin/company", icon: Building2 },
  { id: "settings", label: "System Settings", href: "/admin/settings", icon: Sliders },
  { id: "email", label: "Email Config", href: "/admin/email", icon: Mail },
  { id: "sequences", label: "Numbering Sequences", href: "/admin/sequences", icon: Hash },
  { id: "activity", label: "Activity Log", href: "/admin/activity", icon: Activity },
  { id: "audit", label: "Audit Trail", href: "/admin/audit", icon: FileCheck },
];

export function AdminNavTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Administration Sub-navigation"
      className="flex items-center space-x-1 border-b border-border overflow-x-auto pb-px mb-6 scrollbar-none"
    >
      {ADMIN_TABS.map((tab) => {
        const isActive =
          pathname === tab.href ||
          (tab.id === "users" && pathname === "/users") ||
          (tab.id === "settings" && pathname === "/settings") ||
          pathname.startsWith(`${tab.href}/`);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-t-md",
              isActive
                ? "border-primary text-primary font-semibold bg-muted/30"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
