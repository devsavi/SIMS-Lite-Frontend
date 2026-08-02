import type { Metadata } from "next";
import { StockAdjustmentDetailPage } from "@/features/inventory";

export const metadata: Metadata = {
  title: "Stock Adjustment Details | SIMS Lite",
  description: "View stock adjustment details, line items, and approval audit trail.",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StockAdjustmentDetailRoute({ params }: Props) {
  const { id } = await params;
  return <StockAdjustmentDetailPage id={id} />;
}
