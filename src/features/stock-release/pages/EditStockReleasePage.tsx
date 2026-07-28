"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/page-header";
import { PageContainer } from "@/components/common/page-container";
import { LoadingState } from "@/components/common/loading-state";
import { ErrorState } from "@/components/common/error-state";
import { StockReleaseForm } from "../components/release-form/StockReleaseForm";
import {
  useStockReleaseDetail,
  useUpdateStockRelease,
  useSubmitStockRelease,
} from "../hooks/use-stock-release";
import type { CreateStockReleasePayload } from "../types/stock-release-types";

export interface EditStockReleasePageProps {
  id: string;
}

export function EditStockReleasePage({ id }: EditStockReleasePageProps) {
  const router = useRouter();
  const { data: release, isLoading, error, refetch } = useStockReleaseDetail(id);

  const updateMutation = useUpdateStockRelease();
  const submitMutation = useSubmitStockRelease();

  const handleFormSubmit = async (
    payload: CreateStockReleasePayload,
    autoSubmit = false
  ) => {
    if (!id) return;

    // 1. Update draft release
    const updatedRelease = await updateMutation.mutateAsync({
      id,
      payload,
    });

    // 2. Submit if requested
    if (autoSubmit && updatedRelease?.id) {
      try {
        await submitMutation.mutateAsync(updatedRelease.id);
      } catch {
        // Suppress
      }
    }

    router.push(`/stock-release/${id}`);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState text="Loading stock release details..." />
      </PageContainer>
    );
  }

  if (error || !release) {
    return (
      <PageContainer>
        <ErrorState
          title="Stock Release Not Found"
          description="Could not load the requested stock release draft for editing."
          onRetry={() => refetch()}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title={`Edit Release ${release.release_number || ""}`}
        description="Modify release details, dates, and item quantities before submission."
      />

      <StockReleaseForm
        initialData={release}
        onSubmit={handleFormSubmit}
        isLoading={updateMutation.isPending || submitMutation.isPending}
        mode="edit"
      />
    </PageContainer>
  );
}
