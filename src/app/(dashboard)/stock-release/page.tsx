import type { Metadata } from "next";
import { StockReleaseListPage } from "@/features/stock-release";

export const metadata: Metadata = {
  title: "Stock Release Management | SIMS Lite",
  description:
    "Manage inventory stock release requests, approvals, item quantities, and stock balance deductions.",
};

export default function Page() {
  return <StockReleaseListPage />;
}
