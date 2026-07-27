"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GRNForm } from "@/features/procurement/grns/components/GRNForm";
import { useCreateGRN } from "@/features/procurement/grns/hooks/use-grns";
import { usePurchaseOrders } from "@/features/procurement/purchase-orders/hooks/use-purchase-orders";
import type { GRNFormValues } from "@/features/procurement/grns/schemas/grn.schema";

export default function NewGRNPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const poIdParam = searchParams.get("poId");

  const [selectedPOId, setSelectedPOId] = React.useState<string>(poIdParam || "");

  const createMutation = useCreateGRN();

  const { data: posData } = usePurchaseOrders({
    status: "APPROVED",
    limit: 100,
  });

  const approvedPOs = React.useMemo(() => {
    return posData?.data || [];
  }, [posData]);

  const selectedPO = React.useMemo(() => {
    return approvedPOs.find((p) => p.id === selectedPOId);
  }, [approvedPOs, selectedPOId]);

  const handleSubmit = (values: GRNFormValues, isDraft: boolean) => {
    createMutation.mutate(
      {
        purchaseOrderId: values.purchaseOrderId,
        notes: values.notes || null,
        items: values.items,
        isDraft,
      },
      {
        onSuccess: () => {
          router.push("/procurement/grns");
        },
      }
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Goods Received Note</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Receive delivery for an approved Purchase Order.
        </p>
      </div>

      <GRNForm
        approvedPOs={approvedPOs}
        selectedPO={selectedPO}
        onPOSelect={setSelectedPOId}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
