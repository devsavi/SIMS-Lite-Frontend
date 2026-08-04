"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ArrowUpFromLine, Clock, CheckCircle2, PackageCheck } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { PageContainer } from "@/components/common/page-container";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import { ReleaseFilterPanel } from "../components/filters/ReleaseFilterPanel";
import { ReleaseTable } from "../components/release-table/ReleaseTable";
import {
  useStockReleaseList,
  useSubmitStockRelease,
  useApproveStockRelease,
  useCancelStockRelease,
  useDeleteStockRelease,
} from "../hooks/use-stock-release";
import { useAuthStore } from "@/stores/auth.store";
import type { StockReleaseFilterParams, StockReleaseSummary } from "../types/stock-release-types";

export function StockReleaseListPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const userRole = user?.role;

  const role = (userRole as string) || "";
  const canCreate =
    user?.is_superuser || role === "admin" || role === "store_keeper";

  const [filters, setFilters] = React.useState<StockReleaseFilterParams>({
    page: 1,
    size: 20,
    search: "",
    status: "ALL",
    purpose: "ALL",
    period: "ALL",
  });

  // Dialog state
  const [selectedRelease, setSelectedRelease] = React.useState<StockReleaseSummary | null>(null);
  const [submitDialogOpen, setSubmitDialogOpen] = React.useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = React.useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const {
    data: releaseResponse,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useStockReleaseList(filters);

  const submitMutation = useSubmitStockRelease();
  const approveMutation = useApproveStockRelease();
  const cancelMutation = useCancelStockRelease();
  const deleteMutation = useDeleteStockRelease();

  const releases = releaseResponse?.data ?? [];
  const totalRows = releaseResponse?.pagination?.total ?? releases.length;

  // KPI aggregates from current page (full counts come from pagination.total)
  const pendingCount = releases.filter((r) => r.status === "SUBMITTED").length;
  const approvedCount = releases.filter((r) => r.status === "APPROVED").length;
  const totalQtyReleased = releases
    .filter((r) => r.status === "APPROVED")
    .reduce((sum, r) => sum + (r.total_quantity || 0), 0);

  const handleFilterChange = (updated: Partial<StockReleaseFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, size: 20, search: "", status: "ALL", purpose: "ALL", period: "ALL" });
  };

  const handleEdit = (release: StockReleaseSummary) => {
    router.push(`/stock-release/${release.id}/edit`);
  };

  const handleOpenSubmit = (release: StockReleaseSummary) => {
    setSelectedRelease(release);
    setSubmitDialogOpen(true);
  };

  const handleOpenApprove = (release: StockReleaseSummary) => {
    setSelectedRelease(release);
    setApproveDialogOpen(true);
  };

  const handleOpenCancel = (release: StockReleaseSummary) => {
    setSelectedRelease(release);
    setCancelDialogOpen(true);
  };

  const handleOpenDelete = (release: StockReleaseSummary) => {
    setSelectedRelease(release);
    setDeleteDialogOpen(true);
  };

  const handleConfirmSubmit = async () => {
    if (selectedRelease) {
      await submitMutation.mutateAsync(selectedRelease.id);
      setSelectedRelease(null);
    }
  };

  const handleConfirmApprove = async () => {
    if (selectedRelease) {
      await approveMutation.mutateAsync(selectedRelease.id);
      setSelectedRelease(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (selectedRelease) {
      await cancelMutation.mutateAsync({ id: selectedRelease.id });
      setSelectedRelease(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedRelease) {
      await deleteMutation.mutateAsync(selectedRelease.id);
      setSelectedRelease(null);
    }
  };

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Stock Release Management"
        description="Request, track, approve, and audit inventory stock release transactions across the store."
        actions={
          canCreate ? (
            <Link href="/stock-release/new">
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                <span>New Stock Release</span>
              </Button>
            </Link>
          ) : null
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Releases</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{totalRows}</h3>
            </div>
            <div className="p-2.5 rounded-none bg-primary/10 text-primary">
              <ArrowUpFromLine className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Pending Approvals</p>
              <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {pendingCount}
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
              <p className="text-xs text-muted-foreground font-medium">Approved Releases</p>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {approvedCount}
              </h3>
            </div>
            <div className="p-2.5 rounded-none bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Qty Released</p>
              <h3 className="text-2xl font-bold text-foreground font-mono mt-1">
                {totalQtyReleased}
              </h3>
            </div>
            <div className="p-2.5 rounded-none bg-blue-500/10 text-blue-600">
              <PackageCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Panel */}
      <ReleaseFilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      />

      {/* Release Table */}
      <ReleaseTable
        data={releases}
        loading={isLoading}
        error={error}
        page={filters.page ?? 1}
        pageSize={filters.size ?? 20}
        totalRecords={totalRows}
        onPageChange={(page) => handleFilterChange({ page })}
        onPageSizeChange={(size) => handleFilterChange({ size, page: 1 })}
        userRole={userRole}
        onEdit={handleEdit}
        onSubmit={handleOpenSubmit}
        onApprove={handleOpenApprove}
        onCancel={handleOpenCancel}
        onDelete={handleOpenDelete}
        onRefresh={() => refetch()}
      />

      {/* Submit confirmation */}
      <ConfirmationDialog
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
        title={`Submit Release ${selectedRelease?.release_number || ""}`}
        description="Are you sure you want to submit this stock release for approval? Once submitted, managers will be notified to review."
        variant="info"
        confirmLabel="Submit Release"
        loading={submitMutation.isPending}
        onConfirm={handleConfirmSubmit}
      />

      {/* Approve confirmation */}
      <ConfirmationDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        title={`Approve Release ${selectedRelease?.release_number || ""}`}
        description="Approving this release will permanently deduct stock quantities from live inventory. This action updates dashboard stats and inventory ledgers."
        variant="success"
        confirmLabel="Approve & Deduct Stock"
        loading={approveMutation.isPending}
        onConfirm={handleConfirmApprove}
      />

      {/* Cancel confirmation */}
      <ConfirmationDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title={`Cancel Release ${selectedRelease?.release_number || ""}`}
        description="Are you sure you want to cancel this release request? Cancelled releases cannot be reactivated."
        variant="danger"
        confirmLabel="Cancel Release"
        loading={cancelMutation.isPending}
        onConfirm={handleConfirmCancel}
      />

      {/* Delete confirmation */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={`Delete Draft ${selectedRelease?.release_number || ""}`}
        description="Permanently delete this draft release? This action cannot be undone."
        variant="danger"
        confirmLabel="Delete Draft"
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </PageContainer>
  );
}
