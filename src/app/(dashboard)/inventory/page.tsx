import type { Metadata } from "next";
import { InventoryListPage } from "@/features/inventory";

export const metadata: Metadata = {
  title: "Inventory | SIMS Lite",
  description:
    "Store-wide inventory overview — view current stock levels, low-stock alerts, valuations, and perform stock adjustments.",
};

export default function InventoryPage() {
  return <InventoryListPage />;
}
