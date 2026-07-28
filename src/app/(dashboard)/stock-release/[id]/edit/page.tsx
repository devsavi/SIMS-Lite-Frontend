import type { Metadata } from "next";
import { EditStockReleasePage } from "@/features/stock-release";

export const metadata: Metadata = {
  title: "Edit Stock Release | SIMS Lite",
  description: "Edit draft stock release request details and item quantities.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <EditStockReleasePage id={id} />;
}
