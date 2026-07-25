import type { Metadata } from "next";
import { ProductDetailPage } from "@/features/master-data/products/pages/ProductDetailPage";

export const metadata: Metadata = {
  title: "Product Details",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <ProductDetailPage productId={id} />;
}
