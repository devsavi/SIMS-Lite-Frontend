import type { Metadata } from "next";
import { ProductsPage } from "@/features/master-data/products/pages/ProductsPage";

export const metadata: Metadata = {
  title: "Products",
};

export default function Page() {
  return <ProductsPage />;
}
