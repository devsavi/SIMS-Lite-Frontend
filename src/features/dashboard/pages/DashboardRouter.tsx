"use client";

/**
 * DashboardRouter — renders the correct dashboard based on the current user's role.
 *
 * Role mapping:
 *   admin / super_admin      → AdminDashboard
 *   procurement_officer /
 *   warehouse_manager        → OfficerDashboard
 *   stock_clerk              → StoreKeeperDashboard
 *   viewer / unknown         → AdminDashboard (read-only KPIs still visible)
 */

import * as React from "react";
import { useAuthStore } from "@/stores/auth.store";
import { AdminDashboard } from "./AdminDashboard";
import { OfficerDashboard } from "./OfficerDashboard";
import { StoreKeeperDashboard } from "./StoreKeeperDashboard";

export function DashboardRouter() {
  const role = useAuthStore((s) => s.role);

  switch (role) {
    case "super_admin":
    case "admin":
      return <AdminDashboard />;

    case "procurement_officer":
    case "warehouse_manager":
      return <OfficerDashboard />;

    case "stock_clerk":
      return <StoreKeeperDashboard />;

    default:
      // viewer or any unexpected role gets the admin view (read-only by permission guards)
      return <AdminDashboard />;
  }
}
