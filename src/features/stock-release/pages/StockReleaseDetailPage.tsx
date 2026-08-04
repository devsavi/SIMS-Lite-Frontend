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
  Tag,
  FileInput,
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
  getPurposeLabel,
} from "../utils/stock-release-utils";
import { useAuthStore } from "@/stores/auth.store";
import { usePageTitle } from "@/hooks/use-page-title";

export interface StockReleaseDetailPageProps {
  id: string;
}

export function StockReleaseDetailPage({ id }: StockReleaseDetailPageProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const userRole = user?.role;

  const { data: release, isLoading, error, refetch } = useStockReleaseDetail(id);

  usePageTitle(
    release
      ? release.release_number || `REL-${release.id.substring(0, 8)}`
      : null
  );

  const submitMutation = useSubmitStockRelease();
  const approveMutation = useApproveStockRelease();
  const cancelMutation = useCancelStockRelease();

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

  const createdByName = release.created_by
    ? `${release.created_by.first_name} ${release.created_by.last_name}`.trim()
    : "System User";

  const approvedByName = release.approved_by
    ? `${release.approved_by.first_name} ${release.approved_by.last_name}`.trim()
    : "—";

  const items = release.items || [];
  const totalQty = release.total_quantity ?? 0;
  const totalCost = release.total_cost ?? 0;

  return (
    <PageContainer className="space-y-6">
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
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Info */}
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
                  <Tag className="h-3.5 w-3.5" />
                  <span>Purpose</span>
                </span>
                <p className="font-medium text-foreground">
                  {getPurposeLabel(release.purpose)}
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
                  <span>Created By</span>
                </span>
                <p className="font-medium text-foreground">{createdByName}</p>
                {release.created_by?.email && (
                  <p className="text-[11px] text-muted-foreground">
                    {release.created_by.email}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Approved By</span>
                </span>
                <p className="font-medium text-emerald-700 dark:text-emerald-400">
                  {approvedByName}
                </p>
              </div>

              {release.reference_document && (
                <div className="space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <FileInput className="h-3.5 w-3.5" />
                    <span>Reference Document</span>
                  </span>
                  <p className="font-medium text-foreground font-mono text-xs">
                    {release.reference_document}
                  </p>
                </div>
              )}

              {release.notes && (
                <div className="sm:col-span-2 space-y-1 pt-2 border-t border-border/40">
                  <span className="text-muted-foreground font-semibold">Notes:</span>
                  <p className="text-foreground text-xs leading-relaxed">{release.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Released Items */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span>Released Items</span>
                </CardTitle>
                <div className="flex items-center gap-4 text-xs font-mono font-semibold text-muted-foreground">
                  <span>Qty: {totalQty}</span>
                  <span>Cost: {totalCost.toLocaleString()}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Product</TableHead>
                    <TableHead className="text-xs">SKU</TableHead>
                    <TableHead className="text-xs text-right">Qty Requested</TableHead>
                    <TableHead className="text-xs text-right">Unit Cost</TableHead>
                    <TableHead className="text-xs text-right">Line Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-6 text-muted-foreground text-xs"
                      >
                        No items attached to this release.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item, idx) => (
                      <TableRow key={item.id || idx}>
                        <TableCell className="text-xs font-medium text-foreground">
                          {item.product?.name || "—"}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {item.product?.sku || "—"}
                        </TableCell>
                        <TableCell className="text-xs font-mono font-bold text-right text-foreground">
                          {item.quantity_requested}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-right text-muted-foreground">
                          {item.unit_cost.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-xs font-mono font-semibold text-right text-foreground">
                          {item.line_total.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right column: timeline */}
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
