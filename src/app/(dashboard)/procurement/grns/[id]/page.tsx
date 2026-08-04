"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/app/components/ui/skeleton";
import { GRNDetail } from "@/features/procurement/grns/components/GRNDetail";
import {
  useGRN,
  useGRNDocument,
  useSubmitGRN,
  useApproveGRN,
  useCancelGRN,
  useUploadGRNDocument,
  useDeleteGRNDocument,
} from "@/features/procurement/grns/hooks/use-grns";

export default function GRNDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: grnResponse, isLoading, error } = useGRN(id);
  const grn = grnResponse?.data;

  // Lazily load signed document URL when there's an attachment
  const hasDocument = Boolean(grn?.document_path);
  const {
    data: documentResponse,
    isLoading: isDocumentLoading,
    error: documentError,
  } = useGRNDocument(id, hasDocument);
  const documentUrl = documentResponse?.data?.url;

  // 404 means the API says no document exists — treat it as "no doc" quietly.
  // Any other error: surface a message so the user knows the fetch failed.
  const documentFetchError =
    documentError && (documentError as any)?.status !== 404
      ? ((documentError as any)?.message ?? "Failed to load document.")
      : null;

  const submitMutation = useSubmitGRN();
  const approveMutation = useApproveGRN();
  const cancelMutation = useCancelGRN();
  const uploadDocMutation = useUploadGRNDocument();
  const deleteDocMutation = useDeleteGRNDocument();

  const isActionLoading =
    submitMutation.isPending ||
    approveMutation.isPending ||
    cancelMutation.isPending;

  const isDocumentMutating =
    uploadDocMutation.isPending || deleteDocMutation.isPending || isDocumentLoading;

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
        <h2 className="text-xl font-semibold text-rose-600">GRN Not Found</h2>
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
        documentUrl={documentUrl}
        documentError={documentFetchError}
        onBack={() => router.back()}
        onSubmit={() => submitMutation.mutate(grn.id)}
        onApprove={() => approveMutation.mutate(grn.id)}
        onCancel={() => cancelMutation.mutate(grn.id)}
        onEditDraft={() => router.push(`/procurement/grns/${grn.id}/edit`)}
        onUploadDocument={(file) =>
          uploadDocMutation.mutate({ id: grn.id, file })
        }
        onDeleteDocument={() => deleteDocMutation.mutate(grn.id)}
        isActionLoading={isActionLoading}
        isDocumentLoading={isDocumentMutating}
      />
    </div>
  );
}
