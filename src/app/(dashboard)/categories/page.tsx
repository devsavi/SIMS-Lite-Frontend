import type { Metadata } from "next";
import { CategoriesPage } from "@/features/master-data/categories/pages/CategoriesPage";

export const metadata: Metadata = {
  title: "Categories",
};

export default function Page() {
  return <CategoriesPage />;
}
