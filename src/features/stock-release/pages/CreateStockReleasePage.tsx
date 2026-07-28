"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/page-header";
import { PageContainer } from "@/components/common/page-container";
import { StockReleaseForm } from "../components/release-form/StockReleaseForm";
import { useCreateStockRelease, useSubmitStockRelease } from "../hooks/use-stock-release";
import type { CreateStockReleasePayload } from "../types/stock-release-types";

export function CreateStockReleasePage() {
  const router = useRouter();
  const createMutation = useCreateStockRelease();
  const submitMutation = useSubmitStockRelease();

  const handleFormSubmit = async (
    payload: CreateStockReleasePayload,
    autoSubmit = false
  ) => {
    // 1. Create stock release draft
    const createdRelease = await createMutation.mutateAsync(payload);

    // 2. If user clicked Submit directly, submit draft
    if (autoSubmit && createdRelease?.id) {
      try {
        await submitMutation.mutateAsync(createdRelease.id);
      } catch {
        // Handle error gracefully - release was already created
      }
    }

    router.push("/stock-release");
  };

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="New Stock Release"
        description="Create a new stock release request for store inventory items."
      />

      <StockReleaseForm
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || submitMutation.isPending}
        mode="create"
      />
    </PageContainer>
  );
}
