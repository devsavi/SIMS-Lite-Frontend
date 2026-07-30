"use client";

/**
 * DashboardRouter — renders the correct dashboard based on the current user's role.
 *
 * Role mapping:
 *   admin        → AdminDashboard
 *   officer      → OfficerDashboard
 *   store_keeper → StoreKeeperDashboard
 */

import * as React from "react";
import { useAuthStore } from "@/stores/auth.store";
import { AdminDashboard } from "./AdminDashboard";
import { OfficerDashboard } from "./OfficerDashboard";
import { StoreKeeperDashboard } from "./StoreKeeperDashboard";

export function DashboardRouter() {
  const role = useAuthStore((s) => s.role);

  switch (role) {
    case "admin":
      return <AdminDashboard />;

    case "officer":
      return <OfficerDashboard />;

    case "store_keeper":
      return <StoreKeeperDashboard />;

    default:
      // Fallback — show admin view (permission guards control actual visibility)
      return <AdminDashboard />;
  }
}

