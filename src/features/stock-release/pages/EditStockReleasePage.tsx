"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/page-header";
import { PageContainer } from "@/components/common/page-container";
import { Breadcrumb } from "@/components/common";
import { LoadingState } from "@/components/common/loading-state";
import { ErrorState } from "@/components/common/error-state";
import { StockReleaseForm } from "../components/release-form/StockReleaseForm";
import {
  useStockReleaseDetail,
  useUpdateStockRelease,
  useSubmitStockRelease,
} from "../hooks/use-stock-release";
import { useAuthStore } from "@/stores/auth.store";
import type { CreateStockReleasePayload } from "../types/stock-release-types";

export interface EditStockReleasePageProps {
  id: string;
}

export function EditStockReleasePage({ id }: EditStockReleasePageProps) {
  const router = useRouter();
  const { role } = useAuthStore();
  const isDateLocked = role !== "admin";
  const { data: release, isLoading, error, refetch } = useStockReleaseDetail(id);

  const updateMutation = useUpdateStockRelease();
  const submitMutation = useSubmitStockRelease();

  const handleFormSubmit = async (
    payload: CreateStockReleasePayload,
    autoSubmit = false
  ) => {
    if (!id) return;

    const updatedRelease = await updateMutation.mutateAsync({ id, payload });

    if (autoSubmit && updatedRelease?.id) {
      try {
        await submitMutation.mutateAsync(updatedRelease.id);
      } catch {
        // suppress
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
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "Stock Release", href: "/stock-release" },
              { label: release.release_number || id, href: `/stock-release/${id}` },
              { label: "Edit" },
            ]}
          />
        }
      />

      <StockReleaseForm
        initialData={release}
        onSubmit={handleFormSubmit}
        isLoading={updateMutation.isPending || submitMutation.isPending}
        mode="edit"
        isDateLocked={isDateLocked}
      />
    </PageContainer>
  );
}
