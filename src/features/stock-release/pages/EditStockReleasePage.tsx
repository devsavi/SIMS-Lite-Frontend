"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/app/components/ui/button";
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Edit Release {release.release_number || ""}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Modify release details, dates, and item quantities before submission.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Back
        </Button>
      </div>

      <StockReleaseForm
        initialData={release}
        onSubmit={handleFormSubmit}
        isLoading={updateMutation.isPending || submitMutation.isPending}
        mode="edit"
      />
    </div>
  );
}
