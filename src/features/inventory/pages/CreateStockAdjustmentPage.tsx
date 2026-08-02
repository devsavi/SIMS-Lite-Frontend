"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/page-header";
import { PageContainer } from "@/components/common/page-container";
import { Breadcrumb } from "@/components/common";
import { StockAdjustmentForm } from "../components/adjustment-form/StockAdjustmentForm";
import {
  useCreateStockAdjustment,
  useSubmitStockAdjustment,
} from "../hooks/use-inventory";
import type { StockAdjustmentCreatePayload } from "../types";

export function CreateStockAdjustmentPage() {
  const router = useRouter();
  const createMutation = useCreateStockAdjustment();
  const submitMutation = useSubmitStockAdjustment();

  const handleSubmit = async (
    payload: StockAdjustmentCreatePayload,
    autoSubmit = false
  ) => {
    const created = await createMutation.mutateAsync(payload);

    if (autoSubmit && created?.id) {
      try {
        await submitMutation.mutateAsync(created.id);
      } catch {
        // Adjustment was created; submission failed — navigate to detail
      }
    }

    router.push("/inventory/adjustments");
  };

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="New Stock Adjustment"
        description="Create a draft stock adjustment for inventory corrections."
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "Inventory", href: "/inventory" },
              { label: "Stock Adjustments", href: "/inventory/adjustments" },
              { label: "New" },
            ]}
          />
        }
      />

      <StockAdjustmentForm
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || submitMutation.isPending}
        mode="create"
      />
    </PageContainer>
  );
}
