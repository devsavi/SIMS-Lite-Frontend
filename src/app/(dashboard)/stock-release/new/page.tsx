import type { Metadata } from "next";
import { CreateStockReleasePage } from "@/features/stock-release";

export const metadata: Metadata = {
  title: "New Stock Release | SIMS Lite",
  description: "Create a new inventory stock release request.",
};

export default function Page() {
  return <CreateStockReleasePage />;
}
