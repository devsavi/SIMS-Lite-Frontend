"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Download, Eye, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { GRNStatusBadge } from "./GRNStatusBadge";
import type { GoodsReceivedNote } from "../types";
import { canAccess } from "@/lib/auth/permissions";
import { useAuthStore } from "@/stores/auth.store";
import { POActionDialog } from "../../purchase-orders/components/POActionDialog";

export interface GRNDetailProps {
  grn: GoodsReceivedNote;
  /** Signed URL for the attached document, if any. */
  documentUrl?: string;
  /** Error message from the document fetch (non-404 failures). */
  documentError?: string | null;
  onBack?: () => void;
  onSubmit?: () => void;
  onApprove?: () => void;
  onCancel?: () => void;
  onEditDraft?: () => void;
  /** Called with the selected file to upload. */
  onUploadDocument?: (file: File) => void;
  onDeleteDocument?: () => void;
  isActionLoading?: boolean;
  isDocumentLoading?: boolean;
}

// ---------------------------------------------------------------------------
// In-app document viewer (lightbox overlay)
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
  // Detect image vs non-image by extension
  const isImage = /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(filename);

  // Close on Escape
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
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-card shrink-0">
          <span className="text-sm font-medium truncate pr-4">{filename}</span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-none px-2 py-1 text-xs border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              onClick={(e) => { e.stopPropagation(); void triggerDownload(url, filename); }}
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

        {/* Content */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4 min-h-0">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={filename}
              className="max-h-[75vh] max-w-full object-contain"
            />
          ) : (
            <iframe
              src={url}
              title={filename}
              className="w-full h-[75vh] border-0"
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Trigger a browser download — fetches as blob to force download even for
// cross-origin URLs (S3 / MinIO signed URLs ignore the `download` attribute).
// ---------------------------------------------------------------------------
async function triggerDownload(url: string, filename: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(objectUrl);
  } catch {
    // Fallback: open in new tab if fetch fails
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function GRNDetail({
  grn,
  documentUrl,
  documentError,
  onBack,
  onSubmit,
  onApprove,
  onCancel,
  onEditDraft,
  onUploadDocument,
  onDeleteDocument,
  isActionLoading = false,
  isDocumentLoading = false,
}: GRNDetailProps) {
  const { user } = useAuthStore();
  const userRole = user?.role || "viewer";

  const [activeDialog, setActiveDialog] = React.useState<
    "submit" | "approve" | "cancel" | null
  >(null);
  const [viewerOpen, setViewerOpen] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isDraft = grn.status === "DRAFT";
  const isSubmitted = grn.status === "SUBMITTED";
  const isCancellable = isDraft || isSubmitted;

  const canEdit = canAccess(userRole, "grn.edit");
  const canSubmit = canEdit && isDraft;
  const canApprove = canEdit && isSubmitted;
  const canCancel = canEdit && isCancellable;

  const hasDocument = Boolean(grn.document_path);
  const docFilename = grn.document_original_name || "document";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadDocument?.(file);
      e.target.value = "";
    }
  };

  const handleDownload = () => {
    if (documentUrl) void triggerDownload(documentUrl, docFilename);
  };

  const formatUser = (
    u: { first_name: string; last_name: string; email: string } | null | undefined
  ) => {
    if (!u) return "—";
    return `${u.first_name} ${u.last_name}`;
  };

  const formatDateTime = (d: string | null | undefined) => {
    if (!d) return "—";
    return new Date(d).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">
              {grn.grn_number}
            </h1>
            <GRNStatusBadge status={grn.status} />
            {/* GRN type badge */}
            {grn.purchase_order_id ? (
              <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-none border bg-[#DCEBFC] text-[#1D63C4] border-[#B4D5F8] dark:bg-[rgba(96,165,250,0.15)] dark:text-[#60A5FA] dark:border-[rgba(96,165,250,0.4)]">
                PO-Based Receipt
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-none border bg-[#EAE1FB] text-[#6D28D9] border-[#D3C0F5] dark:bg-[rgba(167,139,250,0.15)] dark:text-[#A78BFA] dark:border-[rgba(167,139,250,0.4)]">
                Direct Receipt
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Received on {new Date(grn.received_date).toLocaleDateString()} ·{" "}
            Created by{" "}
            <span className="font-medium text-foreground">
              {formatUser(grn.created_by)}
            </span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Back
            </Button>
          )}

          {onEditDraft && isDraft && canEdit && (
            <Button variant="outline" size="sm" onClick={onEditDraft}>
              Edit Draft
            </Button>
          )}

          {canSubmit && (
            <Button
              size="sm"
              onClick={() => setActiveDialog("submit")}
              disabled={isActionLoading}
            >
              Submit GRN
            </Button>
          )}

          {canApprove && (
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => setActiveDialog("approve")}
              disabled={isActionLoading}
            >
              Approve GRN
            </Button>
          )}

          {canCancel && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setActiveDialog("cancel")}
              disabled={isActionLoading}
            >
              Cancel GRN
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-none border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium">
            Linked Purchase Order
          </p>
          {grn.purchase_order_id && grn.po_number ? (
            <p className="text-base font-semibold text-primary mt-1">
              <Link
                href={`/procurement/purchase-orders/${grn.purchase_order_id}`}
                className="hover:underline"
              >
                {grn.po_number}
              </Link>
            </p>
          ) : (
            <p className="text-base font-semibold text-muted-foreground mt-1">
              No PO — Direct Receipt
            </p>
          )}
        </div>

        <div className="rounded-none border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium">Supplier</p>
          <p className="text-base font-semibold mt-1">{grn.supplier?.name ?? "—"}</p>
          {grn.supplier?.contact_person && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {grn.supplier.contact_person}
            </p>
          )}
        </div>

        <div className="rounded-none border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium">
            Delivery Note Number
          </p>
          <p className="text-base font-semibold mt-1">
            {grn.delivery_note_number || "—"}
          </p>
        </div>
      </div>

      {/* Notes */}
      {grn.notes && (
        <div className="rounded-none border bg-card p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Notes
          </h3>
          <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">
            {grn.notes}
          </p>
        </div>
      )}

      {/* Cancellation info */}
      {grn.status === "CANCELLED" && (
        <div className="rounded-none border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/20 p-4">
          <h3 className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
            Cancellation Details
          </h3>
          <div className="mt-2 grid gap-1 text-sm text-rose-800 dark:text-rose-300">
            <p>
              <span className="font-medium">Cancelled by:</span>{" "}
              {formatUser(grn.cancelled_by)}
            </p>
            <p>
              <span className="font-medium">Cancelled at:</span>{" "}
              {formatDateTime(grn.cancelled_at)}
            </p>
            {grn.cancellation_reason && (
              <p>
                <span className="font-medium">Reason:</span>{" "}
                {grn.cancellation_reason}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Received Items */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Received Items</h3>
        <div className="rounded-none border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty Received</TableHead>
                <TableHead className="text-right">Unit Cost</TableHead>
                <TableHead>Item Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grn.items.map((item, idx) => (
                <TableRow key={item.id || idx}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.product?.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        SKU: {item.product?.sku ?? "—"}
                      </p>
                      {item.product?.barcode && (
                        <p className="text-xs text-muted-foreground">
                          Barcode: {item.product.barcode}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-emerald-600">
                    {item.quantity_received}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.unit_cost.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.notes || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Document section */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Attached Document</h3>
        <div className="rounded-none border bg-card p-4">
          {/* Non-404 fetch error */}
          {documentError && (
            <p className="text-sm text-destructive">{documentError}</p>
          )}

          {hasDocument && !documentError ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Filename */}
              <p className="text-sm font-medium text-foreground">{docFilename}</p>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2">
                {/* View in-app */}
                {documentUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewerOpen(true)}
                    disabled={isDocumentLoading}
                  >
                    <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                    View
                  </Button>
                )}

                {/* Download */}
                {documentUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    disabled={isDocumentLoading}
                  >
                    <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                    Download
                  </Button>
                )}

                {/* Replace */}
                {onUploadDocument && canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isDocumentLoading}
                  >
                    Replace
                  </Button>
                )}

                {/* Remove */}
                {onDeleteDocument && canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
                    onClick={onDeleteDocument}
                    disabled={isDocumentLoading}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">No document attached.</p>
              {onUploadDocument && canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isDocumentLoading}
                >
                  {isDocumentLoading ? "Uploading..." : "Upload Document"}
                </Button>
              )}
            </div>
          )}

          {/* Hidden file input — shared by Upload and Replace */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Audit Trail */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Audit Trail</h3>
        <div className="rounded-none border bg-card divide-y">
          <div className="px-4 py-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Created by</p>
              <p className="font-medium">{formatUser(grn.created_by)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Created at</p>
              <p className="font-medium">{formatDateTime(grn.created_at)}</p>
            </div>
          </div>
          {grn.submitted_by && (
            <div className="px-4 py-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Submitted by</p>
                <p className="font-medium">{formatUser(grn.submitted_by)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Submitted at</p>
                <p className="font-medium">{formatDateTime(grn.submitted_at)}</p>
              </div>
            </div>
          )}
          {grn.approved_by && (
            <div className="px-4 py-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Approved by</p>
                <p className="font-medium">{formatUser(grn.approved_by)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Approved at</p>
                <p className="font-medium">{formatDateTime(grn.approved_at)}</p>
              </div>
            </div>
          )}
          {grn.cancelled_by && (
            <div className="px-4 py-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Cancelled by</p>
                <p className="font-medium">{formatUser(grn.cancelled_by)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cancelled at</p>
                <p className="font-medium">{formatDateTime(grn.cancelled_at)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Dialogs */}
      <POActionDialog
        open={activeDialog === "submit"}
        onOpenChange={(op) => !op && setActiveDialog(null)}
        title="Submit GRN"
        description="Submit this GRN for approval? You will no longer be able to edit it."
        actionLabel="Submit GRN"
        isLoading={isActionLoading}
        onConfirm={() => {
          onSubmit?.();
          setActiveDialog(null);
        }}
      />

      <POActionDialog
        open={activeDialog === "approve"}
        onOpenChange={(op) => !op && setActiveDialog(null)}
        title="Approve GRN"
        description="Approving this GRN will update stock levels for all received items. This action cannot be undone."
        actionLabel="Approve & Update Stock"
        isLoading={isActionLoading}
        onConfirm={() => {
          onApprove?.();
          setActiveDialog(null);
        }}
      />

      <POActionDialog
        open={activeDialog === "cancel"}
        onOpenChange={(op) => !op && setActiveDialog(null)}
        title="Cancel GRN"
        description="Are you sure you want to cancel this GRN? This action cannot be undone."
        actionLabel="Cancel GRN"
        variant="destructive"
        isLoading={isActionLoading}
        onConfirm={() => {
          onCancel?.();
          setActiveDialog(null);
        }}
      />

      {/* In-app document viewer */}
      {viewerOpen && documentUrl && (
        <DocumentViewer
          url={documentUrl}
          filename={docFilename}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </div>
  );
}
