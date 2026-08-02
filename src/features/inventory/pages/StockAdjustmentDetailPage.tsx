"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Edit3,
  Send,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  User,
  Calendar,
  Package,
  FileText,
  Clock,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { PageContainer } from "@/components/common/page-container";
import { Breadcrumb } from "@/components/common";
import { LoadingState } from "@/components/common/loading-state";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { StockAdjustmentStatusBadge } from "../components/adjustment-status/StockAdjustmentStatusBadge";
import {
  useStockAdjustmentDetail,
  useSubmitStockAdjustment,
  useApproveStockAdjustment,
  useCancelStockAdjustment,
} from "../hooks/use-inventory";
import { useAuthStore } from "@/stores/auth.store";
import { usePageTitle } from "@/hooks/use-page-title";
import { formatCurrency, formatQuantity } from "../utils/inventory-utils";

export interface StockAdjustmentDetailPageProps {
  id: string;
}

function formatUserName(user: { first_name: string; last_name: string; email: string } | null | undefined): string {
  if (!user) return "—";
  return `${user.first_name} ${user.last_name}`.trim() || user.email;
}

function formatDateStr(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return format(new Date(dateStr), "MMM dd, yyyy HH:mm");
  } catch {
    return dateStr;
  }
}

function getAdjustmentTypeLabel(type: string): string {
  switch (type) {
    case "INCREASE": return "Stock Increase (+)";
    case "DECREASE": return "Stock Decrease (-)";
    case "RECOUNT": return "Stock Recount";
    default: return type;
  }
}

function getAdjustmentTypeClass(type: string): string {
  if (type === "INCREASE") return "text-emerald-600 dark:text-emerald-400";
  if (type === "DECREASE") return "text-rose-600 dark:text-rose-400";
  return "text-blue-600 dark:text-blue-400";
}

export function StockAdjustmentDetailPage({ id }: StockAdjustmentDetailPageProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const role = user?.role ?? "";

  const canEdit = user?.is_superuser || role === "admin" || role === "store_keeper";
  const canApprove = user?.is_superuser || role === "admin" || role === "store_keeper";

  const { data: adjustment, isLoading, error, refetch } = useStockAdjustmentDetail(id);

  usePageTitle(adjustment?.adjustment_number ?? null);

  const submitMutation = useSubmitStockAdjustment();
  const approveMutation = useApproveStockAdjustment();
  const cancelMutation = useCancelStockAdjustment();

  const [submitOpen, setSubmitOpen] = React.useState(false);
  const [approveOpen, setApproveOpen] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [cancellationReason, setCancellationReason] = React.useState("");

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState text="Loading adjustment details..." />
      </PageContainer>
    );
  }

  if (error || !adjustment) {
    return (
      <PageContainer>
        <ErrorState
          title="Adjustment Not Found"
          description="Could not load the requested stock adjustment details."
          onRetry={() => refetch()}
        />
      </PageContainer>
    );
  }

  const isDraft = adjustment.status === "DRAFT";
  const isSubmitted = adjustment.status === "SUBMITTED";
  const isCancellable = isDraft || isSubmitted;
  const totalQty = adjustment.items.reduce(
    (sum, item) => sum + item.quantity_adjusted,
    0
  );

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title={adjustment.adjustment_number}
        description="Stock adjustment details, line items, and approval audit trail."
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "Inventory", href: "/inventory" },
              { label: "Stock Adjustments", href: "/inventory/adjustments" },
              { label: adjustment.adjustment_number },
            ]}
          />
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/inventory/adjustments">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <ArrowLeft className="h-4 w-4" />
                <span>All Adjustments</span>
              </Button>
            </Link>

            {canEdit && isDraft && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/inventory/adjustments/${id}/edit`)}
                className="gap-1.5 text-xs"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Draft</span>
              </Button>
            )}

            {isDraft && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSubmitOpen(true)}
                className="gap-1.5 text-xs text-amber-600 border-amber-300 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/40"
              >
                <Send className="h-4 w-4" />
                <span>Submit</span>
              </Button>
            )}

            {isSubmitted && canApprove && (
              <Button
                size="sm"
                onClick={() => setApproveOpen(true)}
                className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Approve</span>
              </Button>
            )}

            {isCancellable && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setCancelOpen(true)}
                className="gap-1.5 text-xs"
              >
                <XCircle className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: General info + items */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>General Information</span>
                </CardTitle>
                <StockAdjustmentStatusBadge status={adjustment.status} />
              </div>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Adjustment Number</span>
                </span>
                <p className="font-mono font-semibold text-foreground text-sm">
                  {adjustment.adjustment_number}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground">Adjustment Type</span>
                <p className={`font-semibold text-sm ${getAdjustmentTypeClass(adjustment.adjustment_type)}`}>
                  {getAdjustmentTypeLabel(adjustment.adjustment_type)}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span>Created By</span>
                </span>
                <p className="font-medium text-foreground">
                  {formatUserName(adjustment.created_by)}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Created At</span>
                </span>
                <p className="font-medium text-foreground">
                  {formatDateStr(adjustment.created_at)}
                </p>
              </div>

              <div className="sm:col-span-2 space-y-1 pt-2 border-t border-border/40">
                <span className="text-muted-foreground font-semibold">Reason:</span>
                <p className="text-foreground leading-relaxed">{adjustment.reason}</p>
              </div>

              {adjustment.notes && (
                <div className="sm:col-span-2 space-y-1">
                  <span className="text-muted-foreground font-semibold">Notes:</span>
                  <p className="text-foreground leading-relaxed">{adjustment.notes}</p>
                </div>
              )}

              {adjustment.status === "CANCELLED" && adjustment.cancellation_reason && (
                <div className="sm:col-span-2 space-y-1 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-none">
                  <span className="text-rose-700 dark:text-rose-300 font-semibold">
                    Cancellation Reason:
                  </span>
                  <p className="text-rose-700 dark:text-rose-300">
                    {adjustment.cancellation_reason}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Adjustment Items */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span>Adjustment Items</span>
                </CardTitle>
                <span className="text-xs font-mono font-semibold text-muted-foreground">
                  Total Qty: {formatQuantity(totalQty)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Product</TableHead>
                    <TableHead className="text-xs">SKU</TableHead>
                    <TableHead className="text-xs text-right">Qty Adjusted</TableHead>
                    <TableHead className="text-xs text-right">Unit Cost</TableHead>
                    <TableHead className="text-xs">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adjustment.items.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-6 text-muted-foreground text-xs"
                      >
                        No items attached to this adjustment.
                      </TableCell>
                    </TableRow>
                  ) : (
                    adjustment.items.map((item, idx) => (
                      <TableRow key={item.id ?? idx}>
                        <TableCell className="text-xs font-medium text-foreground">
                          {item.product ? (
                            <Link
                              href={`/inventory/${item.product.id}`}
                              className="text-primary hover:underline"
                            >
                              {item.product.name}
                            </Link>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {item.product?.sku ?? "—"}
                        </TableCell>
                        <TableCell className="text-xs font-mono font-bold text-right text-foreground">
                          {formatQuantity(item.quantity_adjusted)}
                        </TableCell>
                        <TableCell className="text-xs text-right text-muted-foreground">
                          {formatCurrency(item.unit_cost)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate">
                          {item.notes ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right: Audit timeline */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>Audit Trail</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ol className="relative border-l border-border space-y-5 ml-2">
                {/* Created */}
                <li className="ml-4">
                  <span className="absolute -left-2 flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 ring-2 ring-background">
                    <span className="h-2 w-2 rounded-full bg-slate-500" />
                  </span>
                  <p className="text-xs font-semibold text-foreground">Created</p>
                  <p className="text-xs text-muted-foreground">
                    {formatUserName(adjustment.created_by)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateStr(adjustment.created_at)}
                  </p>
                </li>

                {/* Submitted */}
                {adjustment.submitted_by && (
                  <li className="ml-4">
                    <span className="absolute -left-2 flex h-4 w-4 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50 ring-2 ring-background">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                    </span>
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                      Submitted
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatUserName(adjustment.submitted_by)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateStr(adjustment.submitted_at)}
                    </p>
                  </li>
                )}

                {/* Approved */}
                {adjustment.approved_by && (
                  <li className="ml-4">
                    <span className="absolute -left-2 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 ring-2 ring-background">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Approved
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatUserName(adjustment.approved_by)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateStr(adjustment.approved_at)}
                    </p>
                  </li>
                )}

                {/* Cancelled */}
                {adjustment.cancelled_by && (
                  <li className="ml-4">
                    <span className="absolute -left-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/50 ring-2 ring-background">
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                    </span>
                    <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                      Cancelled
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatUserName(adjustment.cancelled_by)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateStr(adjustment.cancelled_at)}
                    </p>
                  </li>
                )}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation dialogs */}
      <ConfirmationDialog
        open={submitOpen}
        onOpenChange={setSubmitOpen}
        title={`Submit ${adjustment.adjustment_number}`}
        description="Submit this draft for approval. Reviewers will be notified to review and approve."
        variant="info"
        confirmLabel="Submit for Approval"
        loading={submitMutation.isPending}
        onConfirm={async () => {
          await submitMutation.mutateAsync(adjustment.id);
        }}
      />

      <ConfirmationDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title={`Approve ${adjustment.adjustment_number}`}
        description="Approving will permanently update inventory stock levels and create ledger entries. This cannot be undone."
        variant="success"
        confirmLabel="Approve & Apply"
        loading={approveMutation.isPending}
        onConfirm={async () => {
          await approveMutation.mutateAsync(adjustment.id);
        }}
      />

      {/* Cancel dialog — requires a reason */}
      <Dialog
        open={cancelOpen}
        onOpenChange={(open) => {
          setCancelOpen(open);
          if (!open) setCancellationReason("");
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel {adjustment.adjustment_number}</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancellation. Cancelled adjustments
              cannot be reactivated.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="cancel-reason-detail" className="text-xs font-semibold">
              Cancellation Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="cancel-reason-detail"
              rows={3}
              placeholder="Explain why this adjustment is being cancelled..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCancelOpen(false);
                setCancellationReason("");
              }}
              disabled={cancelMutation.isPending}
            >
              Back
            </Button>
            <Button
              variant="destructive"
              disabled={!cancellationReason.trim() || cancelMutation.isPending}
              onClick={async () => {
                await cancelMutation.mutateAsync({
                  id: adjustment.id,
                  reason: cancellationReason.trim(),
                });
                setCancelOpen(false);
                setCancellationReason("");
              }}
            >
              {cancelMutation.isPending ? "Cancelling…" : "Cancel Adjustment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
