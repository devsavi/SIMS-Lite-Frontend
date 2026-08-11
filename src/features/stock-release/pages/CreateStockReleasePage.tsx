"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/page-header";
import { PageContainer } from "@/components/common/page-container";
import { Breadcrumb } from "@/components/common";
import { StockReleaseForm } from "../components/release-form/StockReleaseForm";
import { useCreateStockRelease, useSubmitStockRelease } from "../hooks/use-stock-release";
import { useAuthStore } from "@/stores/auth.store";
import type { CreateStockReleasePayload } from "../types/stock-release-types";

export function CreateStockReleasePage() {
  const router = useRouter();
  const { role } = useAuthStore();
  const isDateLocked = role !== "admin";
  const createMutation = useCreateStockRelease();
  const submitMutation = useSubmitStockRelease();

  const handleFormSubmit = async (
    payload: CreateStockReleasePayload,
    autoSubmit = false
  ) => {
    const createdRelease = await createMutation.mutateAsync({
      payload,
      skipRefetch: autoSubmit, // skip intermediate DRAFT refetch if we're about to submit
    });

    if (autoSubmit && createdRelease?.id) {
      try {
        await submitMutation.mutateAsync(createdRelease.id);
      } catch {
        // release was already created; navigate anyway
      }
    }

    router.push("/stock-release");
  };

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="New Stock Release"
        description="Create a new stock release request for store inventory items."
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "Stock Release", href: "/stock-release" },
              { label: "New" },
            ]}
          />
        }
      />

      <StockReleaseForm
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || submitMutation.isPending}
        mode="create"
        isDateLocked={isDateLocked}
      />
    </PageContainer>
  );
}
