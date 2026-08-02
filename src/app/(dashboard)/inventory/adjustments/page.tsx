import type { Metadata } from "next";
import { StockAdjustmentListPage } from "@/features/inventory";

export const metadata: Metadata = {
  title: "Stock Adjustments | SIMS Lite",
  description:
    "Create and manage inventory stock adjustments — increases, decreases, and recounts.",
};

export default function StockAdjustmentsPage() {
  return <StockAdjustmentListPage />;
}
