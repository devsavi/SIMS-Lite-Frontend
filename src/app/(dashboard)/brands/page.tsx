import type { Metadata } from "next";
import { BrandsPage } from "@/features/master-data/brands/pages/BrandsPage";

export const metadata: Metadata = {
  title: "Brands",
};

export default function Page() {
  return <BrandsPage />;
}
