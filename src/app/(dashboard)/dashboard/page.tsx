import type { Metadata } from "next";
import { DashboardRouter } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
};

/**
 * Dashboard page — role-aware.
 * The DashboardRouter client component selects the correct view
 * based on the authenticated user's role.
 */
export default function DashboardPage() {
  return <DashboardRouter />;
}
