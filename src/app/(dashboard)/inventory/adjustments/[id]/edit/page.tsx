import type { Metadata } from "next";
import { EditStockAdjustmentPage } from "@/features/inventory";

export const metadata: Metadata = {
  title: "Edit Stock Adjustment | SIMS Lite",
  description: "Edit a draft stock adjustment.",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditStockAdjustmentRoute({ params }: Props) {
  const { id } = await params;
  return <EditStockAdjustmentPage id={id} />;
}
