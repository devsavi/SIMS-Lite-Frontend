import type { Metadata } from "next";
import { InventoryHistoryPage } from "@/features/inventory";

export const metadata: Metadata = {
  title: "Inventory History | SIMS Lite",
  description:
    "Complete audit ledger of all inventory stock movements — receipts, releases, and adjustments across the store.",
};

interface PageProps {
  searchParams: Promise<{ product_id?: string }>;
}

export default async function InventoryHistoryRoutePage({ searchParams }: PageProps) {
  const { product_id } = await searchParams;
  return <InventoryHistoryPage initialProductId={product_id} />;
}
