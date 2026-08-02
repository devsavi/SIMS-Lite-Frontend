import type { Metadata } from "next";
import { CreateStockAdjustmentPage } from "@/features/inventory";

export const metadata: Metadata = {
  title: "New Stock Adjustment | SIMS Lite",
  description: "Create a new draft stock adjustment for inventory corrections.",
};

export default function NewStockAdjustmentPage() {
  return <CreateStockAdjustmentPage />;
}
