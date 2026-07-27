import type { Metadata } from "next";
import { InventoryDetailPage } from "@/features/inventory";

export const metadata: Metadata = {
  title: "Inventory Details | SIMS Lite",
  description:
    "View current stock, transaction history, and inventory movements for a specific product.",
};

interface PageProps {
  params: Promise<{ productId: string }>;
}

export default async function InventoryProductDetailPage({ params }: PageProps) {
  const { productId } = await params;
  return <InventoryDetailPage productId={productId} />;
}
