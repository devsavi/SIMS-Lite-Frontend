"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  SlidersHorizontal,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { PageContainer } from "@/components/common/page-container";
import { Breadcrumb } from "@/components/common";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
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
import { AdjustmentFilterPanel } from "../components/adjustment-filters/AdjustmentFilterPanel";
import { AdjustmentTable } from "../components/adjustment-table/AdjustmentTable";
import {
  useStockAdjustmentList,
  useSubmitStockAdjustment,
  useApproveStockAdjustment,
  useCancelStockAdjustment,
  useDeleteStockAdjustment,
} from "../hooks/use-inventory";
import { useAuthStore } from "@/stores/auth.store";
import type { StockAdjustmentFilterParams, StockAdjustmentSummary } from "../types";

const DEFAULT_FILTERS: StockAdjustmentFilterParams = {
  page: 1,
  size: 20,
  search: "",
  status: "ALL",
  adjustment_type: "ALL",
  period: "day",
};

export function StockAdjustmentListPage() {
  const { user } = useAuthStore();
  const role = user?.role ?? "";

  const canCreate =
    user?.is_superuser || role === "admin" || role === "store_keeper";
  const canApprove =
    user?.is_superuser || role === "admin" || role === "store_keeper";

  const [filters, setFilters] =
    React.useState<StockAdjustmentFilterParams>(DEFAULT_FILTERS);

  const [selected, setSelected] =
    React.useState<StockAdjustmentSummary | null>(null);
  const [submitOpen, setSubmitOpen] = React.useState(false);
  const [approveOpen, setApproveOpen] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [cancellationReason, setCancellationReason] = React.useState("");
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const {
    data: listData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useStockAdjustmentList(filters);

  const submitMutation = useSubmitStockAdjustment();
  const approveMutation = useApproveStockAdjustment();
  const cancelMutation = useCancelStockAdjustment();
  const deleteMutation = useDeleteStockAdjustment();

  const adjustments = listData?.data ?? [];
  const totalRows = listData?.pagination?.total ?? adjustments.length;

  // KPI aggregates from current page
  const draftCount = adjustments.filter((a) => a.status === "DRAFT").length;
  const submittedCount = adjustments.filter(
    (a) => a.status === "SUBMITTED"
  ).length;
  const approvedCount = adjustments.filter(
    (a) => a.status === "APPROVED"
  ).length;

  const handleFilterChange = (updated: Partial<StockAdjustmentFilterParams>) =>
    setFilters((prev) => ({ ...prev, ...updated }));

  const handleReset = () => setFilters(DEFAULT_FILTERS);

  const openSubmit = (item: StockAdjustmentSummary) => {
    setSelected(item);
    setSubmitOpen(true);
  };
  const openApprove = (item: StockAdjustmentSummary) => {
    setSelected(item);
    setApproveOpen(true);
  };
  const openCancel = (item: StockAdjustmentSummary) => {
    setSelected(item);
    setCancellationReason("");
    setCancelOpen(true);
  };
  const openDelete = (item: StockAdjustmentSummary) => {
    setSelected(item);
    setDeleteOpen(true);
  };

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Stock Adjustments"
        description="Create and manage inventory stock adjustments — increases, decreases, and recounts."
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "Inventory", href: "/inventory" },
              { label: "Stock Adjustments" },
            ]}
          />
        }
        actions={
          canCreate ? (
            <Link href="/inventory/adjustments/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                <span>New Adjustment</span>
              </Button>
            </Link>
          ) : null
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-card border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {totalRows}
              </h3>
            </div>
            <div className="p-2.5 rounded-none bg-primary/10 text-primary">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Drafts
              </p>
              <h3 className="text-2xl font-bold text-slate-600 dark:text-slate-400 mt-1">
                {draftCount}
              </h3>
            </div>
            <div className="p-2.5 rounded-none bg-slate-500/10 text-slate-600">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Pending Approval
              </p>
              <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {submittedCount}
              </h3>
            </div>
            <div className="p-2.5 rounded-none bg-amber-500/10 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Approved
              </p>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {approvedCount}
              </h3>
            </div>
            <div className="p-2.5 rounded-none bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <AdjustmentFilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      />

      {/* Table */}
      <AdjustmentTable
        data={adjustments}
        loading={isLoading}
        error={error}
        page={filters.page ?? 1}
        pageSize={filters.size ?? 20}
        totalRecords={totalRows}
        onPageChange={(page) => handleFilterChange({ page })}
        onPageSizeChange={(size) => handleFilterChange({ size, page: 1 })}
        onSubmit={openSubmit}
        onApprove={canApprove ? openApprove : undefined}
        onCancel={openCancel}
        onDelete={openDelete}
        onRefresh={() => refetch()}
      />

      {/* Submit dialog */}
      <ConfirmationDialog
        open={submitOpen}
        onOpenChange={setSubmitOpen}
        title={`Submit ${selected?.adjustment_number ?? "Adjustment"}`}
        description="Submit this draft adjustment for approval. Once submitted, reviewers will be notified."
        variant="info"
        confirmLabel="Submit for Approval"
        loading={submitMutation.isPending}
        onConfirm={async () => {
          if (selected) {
            await submitMutation.mutateAsync(selected.id);
            setSelected(null);
          }
        }}
      />

      {/* Approve dialog */}
      <ConfirmationDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title={`Approve ${selected?.adjustment_number ?? "Adjustment"}`}
        description="Approving this adjustment will permanently update inventory stock levels and create ledger entries."
        variant="success"
        confirmLabel="Approve & Apply to Inventory"
        loading={approveMutation.isPending}
        onConfirm={async () => {
          if (selected) {
            await approveMutation.mutateAsync(selected.id);
            setSelected(null);
          }
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
            <DialogTitle>
              Cancel {selected?.adjustment_number ?? "Adjustment"}
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for cancellation. Cancelled adjustments
              cannot be reactivated.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="cancel-reason" className="text-xs font-semibold">
              Cancellation Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="cancel-reason"
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
                if (selected) {
                  await cancelMutation.mutateAsync({
                    id: selected.id,
                    reason: cancellationReason.trim(),
                  });
                  setCancelOpen(false);
                  setCancellationReason("");
                  setSelected(null);
                }
              }}
            >
              {cancelMutation.isPending ? "Cancelling…" : "Cancel Adjustment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${selected?.adjustment_number ?? "Adjustment"}`}
        description="This will permanently delete the draft adjustment. This action cannot be undone."
        variant="danger"
        confirmLabel="Delete Draft"
        loading={deleteMutation.isPending}
        onConfirm={async () => {
          if (selected) {
            await deleteMutation.mutateAsync(selected.id);
            setSelected(null);
          }
        }}
      />
    </PageContainer>
  );
}
