"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/app/components/ui/button";
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
    const createdRelease = await createMutation.mutateAsync(payload);

    if (autoSubmit && createdRelease?.id) {
      try {
        await submitMutation.mutateAsync(createdRelease.id);
      } catch {
        // release was already created
      }
    }

    router.push("/stock-release");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Stock Release</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create a new stock release request for store inventory items.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Back
        </Button>
      </div>

      <StockReleaseForm
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || submitMutation.isPending}
        mode="create"
      />
    </div>
  );
}
