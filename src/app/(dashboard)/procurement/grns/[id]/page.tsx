"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/app/components/ui/skeleton";
import { GRNDetail } from "@/features/procurement/grns/components/GRNDetail";
import {
  useGRN,
  useSubmitGRN,
  useApproveGRN,
} from "@/features/procurement/grns/hooks/use-grns";

export default function GRNDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: grn, isLoading, error } = useGRN(id);

  const submitMutation = useSubmitGRN();
  const approveMutation = useApproveGRN();

  const isActionLoading = submitMutation.isPending || approveMutation.isPending;

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !grn) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-rose-600">
          GRN Not Found
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          The requested Goods Received Note could not be loaded.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-2">
      <GRNDetail
        grn={grn}
        onSubmit={() => submitMutation.mutate(grn.id)}
        onApprove={() => approveMutation.mutate(grn.id)}
        isActionLoading={isActionLoading}
      />
    </div>
  );
}
