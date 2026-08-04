"use client";

import * as React from "react";
import {
  useGRNs,
  useGRNDocument,
  useSubmitGRN,
  useApproveGRN,
  useCancelGRN,
} from "@/features/procurement/grns";
import { GRNTable } from "@/features/procurement/grns/components/GRNTable";
import { POActionDialog } from "@/features/procurement/purchase-orders/components/POActionDialog";
import type { GRNFilters, GoodsReceivedNote } from "@/features/procurement/grns/types";
import { X, Download } from "lucide-react";

// ---------------------------------------------------------------------------
// Blob-based download — works for cross-origin URLs (S3 / MinIO signed URLs
// ignore the HTML `download` attribute and open a new tab instead).
// ---------------------------------------------------------------------------
async function blobDownload(url: string, filename: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

// ---------------------------------------------------------------------------
// Inline document viewer lightbox
// ---------------------------------------------------------------------------

function DocumentViewer({
  url,
  filename,
  onClose,
}: {
  url: string;
  filename: string;
  onClose: () => void;
}) {
  const isImage = /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(filename);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Document viewer"
    >
      <div
        className="relative max-h-[90vh] max-w-4xl w-full bg-card rounded-none shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-2 border-b bg-card shrink-0">
          <span className="text-sm font-medium truncate pr-4">{filename}</span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-none px-2 py-1 text-xs border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              onClick={(e) => { e.stopPropagation(); void blobDownload(url, filename); }}
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-none p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Close viewer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto flex items-center justify-center p-4 min-h-0">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={filename} className="max-h-[75vh] max-w-full object-contain" />
          ) : (
            <iframe src={url} title={filename} className="w-full h-[75vh] border-0" />
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hook to lazily fetch a signed document URL for a single GRN
// ---------------------------------------------------------------------------

function useDocumentFetcher() {
  const [targetId, setTargetId] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<"view" | "download" | null>(null);
  const [targetGRN, setTargetGRN] = React.useState<GoodsReceivedNote | null>(null);

  const { data: docResponse } = useGRNDocument(
    targetId ?? "",
    Boolean(targetId)
  );

  React.useEffect(() => {
    if (!docResponse?.data?.url || !mode) return;
    const { url, original_filename } = docResponse.data;
    if (mode === "download") {
      void blobDownload(url, original_filename);
      setTargetId(null);
      setMode(null);
      setTargetGRN(null);
    }
  }, [docResponse, mode]);

  const trigger = (grn: GoodsReceivedNote, action: "view" | "download") => {
    setTargetGRN(grn);
    setMode(action);
    setTargetId(grn.id);
  };

  const clearViewer = () => {
    setTargetId(null);
    setMode(null);
    setTargetGRN(null);
  };

  const viewerUrl = mode === "view" ? docResponse?.data?.url : undefined;
  const viewerFilename =
    docResponse?.data?.original_filename ??
    targetGRN?.document_original_name ??
    "document";

  return { trigger, clearViewer, viewerUrl, viewerFilename };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function GoodsReceivedNotesPage() {
  const [filters, setFilters] = React.useState<GRNFilters>({
    page: 1,
    size: 20,
    status: "ALL",
    period: "day",
  });

  const { data, isLoading, refetch } = useGRNs(filters);

  // Document view/download
  const { trigger, clearViewer, viewerUrl, viewerFilename } = useDocumentFetcher();

  // Inline submit / approve / cancel
  const submitMutation = useSubmitGRN();
  const approveMutation = useApproveGRN();
  const cancelMutation = useCancelGRN();

  const [submitTarget, setSubmitTarget] = React.useState<GoodsReceivedNote | null>(null);
  const [approveTarget, setApproveTarget] = React.useState<GoodsReceivedNote | null>(null);
  const [cancelTarget, setCancelTarget] = React.useState<GoodsReceivedNote | null>(null);

  const actionLoadingId =
    submitMutation.isPending
      ? (submitMutation.variables as string | undefined) ?? null
      : approveMutation.isPending
      ? (approveMutation.variables as string | undefined) ?? null
      : cancelMutation.isPending
      ? (cancelMutation.variables as string | undefined) ?? null
      : null;

  const handleFilterChange = (newFilters: Partial<GRNFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Goods Received Notes (GRNs)
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Receive deliveries against approved purchase orders and update
          physical stock levels.
        </p>
      </div>

      <GRNTable
        data={data?.data}
        total={data?.pagination?.total || 0}
        pages={data?.pagination?.pages || 1}
        isLoading={isLoading}
        filters={filters}
        onFilterChange={handleFilterChange}
        onRefresh={refetch}
        onApprove={setApproveTarget}
        onSubmit={setSubmitTarget}
        onCancel={setCancelTarget}
        actionLoadingId={actionLoadingId}
        onViewDocument={(grn) => trigger(grn, "view")}
        onDownloadDocument={(grn) => trigger(grn, "download")}
      />

      {/* Submit confirmation */}
      <POActionDialog
        open={Boolean(submitTarget)}
        onOpenChange={(op) => !op && setSubmitTarget(null)}
        title="Submit GRN"
        description={`Submit ${submitTarget?.grn_number} for approval? You will no longer be able to edit it.`}
        actionLabel="Submit GRN"
        isLoading={submitMutation.isPending}
        onConfirm={() => {
          if (submitTarget) {
            submitMutation.mutate(submitTarget.id, {
              onSuccess: () => setSubmitTarget(null),
            });
          }
        }}
      />

      {/* Approve confirmation */}
      <POActionDialog
        open={Boolean(approveTarget)}
        onOpenChange={(op) => !op && setApproveTarget(null)}
        title="Approve GRN"
        description={`Approve ${approveTarget?.grn_number}? This will update stock levels for all received items and cannot be undone.`}
        actionLabel="Approve & Update Stock"
        isLoading={approveMutation.isPending}
        onConfirm={() => {
          if (approveTarget) {
            approveMutation.mutate(approveTarget.id, {
              onSuccess: () => setApproveTarget(null),
            });
          }
        }}
      />

      {/* Cancel confirmation */}
      <POActionDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(op) => !op && setCancelTarget(null)}
        title="Cancel GRN"
        description={`Cancel ${cancelTarget?.grn_number}? This action cannot be undone.`}
        actionLabel="Cancel GRN"
        variant="destructive"
        isLoading={cancelMutation.isPending}
        onConfirm={() => {
          if (cancelTarget) {
            cancelMutation.mutate(cancelTarget.id, {
              onSuccess: () => setCancelTarget(null),
            });
          }
        }}
      />

      {/* In-app document viewer */}
      {viewerUrl && (
        <DocumentViewer
          url={viewerUrl}
          filename={viewerFilename}
          onClose={clearViewer}
        />
      )}
    </div>
  );
}
