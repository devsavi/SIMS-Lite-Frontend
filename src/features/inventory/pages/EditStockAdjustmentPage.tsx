"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/page-header";
import { PageContainer } from "@/components/common/page-container";
import { Breadcrumb } from "@/components/common";
import { LoadingState } from "@/components/common/loading-state";
import { ErrorState } from "@/components/common/error-state";
import { StockAdjustmentForm } from "../components/adjustment-form/StockAdjustmentForm";
import {
  useStockAdjustmentDetail,
  useUpdateStockAdjustment,
  useSubmitStockAdjustment,
} from "../hooks/use-inventory";
import type { StockAdjustmentCreatePayload } from "../types";

export interface EditStockAdjustmentPageProps {
  id: string;
}

export function EditStockAdjustmentPage({ id }: EditStockAdjustmentPageProps) {
  const router = useRouter();
  const { data: adjustment, isLoading, error, refetch } = useStockAdjustmentDetail(id);
  const updateMutation = useUpdateStockAdjustment();
  const submitMutation = useSubmitStockAdjustment();

  const handleSubmit = async (
    payload: StockAdjustmentCreatePayload,
    autoSubmit = false
  ) => {
    await updateMutation.mutateAsync({ id, payload });

    if (autoSubmit) {
      try {
        await submitMutation.mutateAsync(id);
      } catch {
        // Updated but submission failed
      }
    }

    router.push(`/inventory/adjustments/${id}`);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState text="Loading adjustment..." />
      </PageContainer>
    );
  }

  if (error || !adjustment) {
    return (
      <PageContainer>
        <ErrorState
          title="Adjustment Not Found"
          description="Could not load the requested stock adjustment."
          onRetry={() => refetch()}
        />
      </PageContainer>
    );
  }

  if (adjustment.status !== "DRAFT") {
    return (
      <PageContainer>
        <ErrorState
          title="Cannot Edit Adjustment"
          description="Only draft adjustments can be edited."
          onRetry={() => router.push(`/inventory/adjustments/${id}`)}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title={`Edit ${adjustment.adjustment_number}`}
        description="Update the draft stock adjustment details and items."
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "Inventory", href: "/inventory" },
              { label: "Stock Adjustments", href: "/inventory/adjustments" },
              { label: adjustment.adjustment_number, href: `/inventory/adjustments/${id}` },
              { label: "Edit" },
            ]}
          />
        }
      />

      <StockAdjustmentForm
        initialData={adjustment}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending || submitMutation.isPending}
        mode="edit"
      />
    </PageContainer>
  );
}
