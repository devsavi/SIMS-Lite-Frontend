import type { Metadata } from "next";
import { StockReleaseDetailPage } from "@/features/stock-release";

export const metadata: Metadata = {
  title: "Stock Release Details | SIMS Lite",
  description:
    "View stock release request details, released item quantities, and lifecycle audit history.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <StockReleaseDetailPage id={id} />;
}
