"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit3,
  Send,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  CheckCheck,
  Package,
  FileText,
  Clock,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { PageContainer } from "@/components/common/page-container";
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
import { StockReleaseStatusBadge } from "../components/release-status/StockReleaseStatusBadge";
import { ReleaseTimeline } from "../components/release-history/ReleaseTimeline";
import {
  useStockReleaseDetail,
  useSubmitStockRelease,
  useApproveStockRelease,
  useCancelStockRelease,
} from "../hooks/use-stock-release";
import {
  canEditRelease,
  canSubmitRelease,
  canApproveRelease,
  canCancelRelease,
} from "../utils/stock-release-utils";
import { useAuthStore } from "@/stores/auth.store";

export interface StockReleaseDetailPageProps {
  id: string;
}

export function StockReleaseDetailPage({ id }: StockReleaseDetailPageProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const userRole = user?.role;

  const { data: release, isLoading, error, refetch } = useStockReleaseDetail(id);

  const submitMutation = useSubmitStockRelease();
  const approveMutation = useApproveStockRelease();
  const cancelMutation = useCancelStockRelease();

  // Workflow Dialog states
  const [submitDialogOpen, setSubmitDialogOpen] = React.useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = React.useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);

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
          title="Release Not Found"
          description="Could not load the requested stock release details."
          onRetry={() => refetch()}
        />
      </PageContainer>
    );
  }

  const editable = canEditRelease(release.status, userRole);
  const submittable = canSubmitRelease(release.status, userRole);
  const approvable = canApproveRelease(release.status, userRole);
  const cancellable = canCancelRelease(release.status, userRole);

  const handleConfirmSubmit = async () => {
    await submitMutation.mutateAsync(release.id);
  };

  const handleConfirmApprove = async () => {
    await approveMutation.mutateAsync(release.id);
  };

  const handleConfirmCancel = async () => {
    await cancelMutation.mutateAsync({ id: release.id });
  };

  const createdBy =
    release.requested_by_user?.full_name ||
    release.created_by_user?.full_name ||
    release.requested_by ||
    release.created_by ||
    "System User";

  const approvedBy =
    release.approved_by_user?.full_name || release.approved_by || "—";

  const items = release.items || [];
  const totalQty =
    release.total_quantity ??
    items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  return (
    <PageContainer className="space-y-6">
      {/* Header with Breadcrumb Back link */}
      <PageHeader
        title={`Stock Release ${release.release_number || `REL-${release.id.substring(0, 8)}`}`}
        description="Detailed view of stock release request, released products, and audit timeline."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/stock-release">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <ArrowLeft className="h-4 w-4" />
                <span>All Releases</span>
              </Button>
            </Link>

            {editable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/stock-release/${id}/edit`)}
                className="gap-1.5 text-xs"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Draft</span>
              </Button>
            )}

            {submittable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSubmitDialogOpen(true)}
                className="gap-1.5 text-xs text-amber-600 border-amber-300 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/40"
              >
                <Send className="h-4 w-4" />
                <span>Submit Release</span>
              </Button>
            )}

            {approvable && (
              <Button
                size="sm"
                onClick={() => setApproveDialogOpen(true)}
                className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Approve & Deduct Stock</span>
              </Button>
            )}

            {cancellable && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setCancelDialogOpen(true)}
                className="gap-1.5 text-xs"
              >
                <XCircle className="h-4 w-4" />
                <span>Cancel Release</span>
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): General Info & Released Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information Card */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>General Information</span>
                </CardTitle>
                <StockReleaseStatusBadge status={release.status} />
              </div>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" />
                  <span>Release Number</span>
                </span>
                <p className="font-mono font-semibold text-foreground text-sm">
                  {release.release_number || `REL-${release.id.substring(0, 8)}`}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Release Date</span>
                </span>
                <p className="font-medium text-foreground">
                  {new Date(release.release_date).toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span>Created / Requested By</span>
                </span>
                <p className="font-medium text-foreground">{createdBy}</p>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Approved By</span>
                </span>
                <p className="font-medium text-emerald-700 dark:text-emerald-400">
                  {approvedBy}
                </p>
              </div>

              {release.notes && (
                <div className="sm:col-span-2 space-y-1 pt-2 border-t border-border/40">
                  <span className="text-muted-foreground font-semibold">Notes / Purpose:</span>
                  <p className="text-foreground text-xs leading-relaxed">{release.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Released Items Card */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span>Released Items</span>
                </CardTitle>
                <span className="text-xs font-mono font-semibold text-muted-foreground">
                  Total Released Qty: {totalQty}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Product</TableHead>
                    <TableHead className="text-xs">SKU</TableHead>
                    <TableHead className="text-xs text-right">Quantity Released</TableHead>
                    <TableHead className="text-xs">Unit of Measure</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground text-xs">
                        No items attached to this release.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item, idx) => (
                      <TableRow key={item.id || item.product_id || idx}>
                        <TableCell className="text-xs font-medium text-foreground">
                          {item.product_name || `Product #${item.product_id}`}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {item.sku || item.product_sku || "—"}
                        </TableCell>
                        <TableCell className="text-xs font-mono font-bold text-right text-foreground">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {item.unit_of_measure || item.uom_code || "units"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 col): Workflow Timeline */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>Lifecycle History</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ReleaseTimeline release={release} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
        title={`Submit Release ${release.release_number || ""}`}
        description="Are you sure you want to submit this stock release for manager approval?"
        variant="info"
        confirmLabel="Submit Release"
        loading={submitMutation.isPending}
        onConfirm={handleConfirmSubmit}
      />

      <ConfirmationDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        title={`Approve Release ${release.release_number || ""}`}
        description="Approving this stock release will deduct inventory quantities permanently and update dashboard statistics."
        variant="success"
        confirmLabel="Approve & Deduct Stock"
        loading={approveMutation.isPending}
        onConfirm={handleConfirmApprove}
      />

      <ConfirmationDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title={`Cancel Release ${release.release_number || ""}`}
        description="Are you sure you want to cancel this stock release request? This action cannot be undone."
        variant="danger"
        confirmLabel="Cancel Release"
        loading={cancelMutation.isPending}
        onConfirm={handleConfirmCancel}
      />
    </PageContainer>
  );
}
