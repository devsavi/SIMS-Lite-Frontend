import type { Metadata} from "next";
import { SupplierDetailPage } from "@/features/master-data/suppliers/pages/SupplierDetailPage";

export const metadata: Metadata = {
  title: "Supplier Details",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <SupplierDetailPage supplierId={id} />;
}
