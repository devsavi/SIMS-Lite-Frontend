"use client";

import * as React from "react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { ProtectedRoute } from "@/app/components/auth/ProtectedRoute";
import { useSidebarStore } from "@/stores/sidebar.store";
import { cn } from "@/utils/cn";
import { SystemSettingsSync } from "./SystemSettingsSync";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);

  return (
    <ProtectedRoute>
      <SystemSettingsSync />
      <div className="flex min-h-screen bg-background text-foreground">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main area — offset from sidebar on desktop */}
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col transition-[margin] duration-200 ease-in-out",
            "md:ml-16",
            !isCollapsed && "md:ml-64"
          )}
        >
          <AppHeader />
          <main
            role="main"
            className="flex-1 overflow-auto p-4 md:p-6"
          >
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
