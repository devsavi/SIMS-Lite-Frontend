"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { POStatusBadge, POEmailStatusBadge } from "./POStatusBadge";
import { POActionDialog } from "./POActionDialog";
import type { PurchaseOrder } from "../types";
import { canAccess } from "@/lib/auth/permissions";
import { useAuthStore } from "@/stores/auth.store";
import { formatCurrency } from "@/utils/format";
import { useSystemSettingsStore } from "@/stores/settings.store";

export interface PurchaseOrderDetailProps {
  po: PurchaseOrder;
  onSubmit?: () => void;
  onApprove?: () => void;
  onReject?: (reason?: string) => void;
  onCancel?: (reason?: string) => void;
  onResendEmail?: () => void;
  isActionLoading?: boolean;
}

export function PurchaseOrderDetail({
  po,
  onSubmit,
  onApprove,
  onReject,
  onCancel,
  onResendEmail,
  isActionLoading = false,
}: PurchaseOrderDetailProps) {
  const { user } = useAuthStore();
  const userRole = user?.role || "viewer";
  const baseCurrency = useSystemSettingsStore((s) => s.baseCurrency);

  const [activeDialog, setActiveDialog] = React.useState<
    "submit" | "approve" | "reject" | "cancel" | null
  >(null);

  const canApprove =
    canAccess(userRole, "purchase_orders.approve") && po.status === "SUBMITTED";
  const canEdit =
    canAccess(userRole, "purchase_orders.edit") && po.status === "DRAFT";
  const canSubmit =
    canAccess(userRole, "purchase_orders.edit") && po.status === "DRAFT";
  const canCancel =
    canAccess(userRole, "purchase_orders.edit") &&
    (po.status === "DRAFT" || po.status === "SUBMITTED");
  const canCreateGRN =
    canAccess(userRole, "grn.create") && po.status === "APPROVED";

  const timelineSteps: Array<{ key: string; label: string }> = [
    { key: "DRAFT", label: "Draft" },
    { key: "SUBMITTED", label: "Submitted" },
    { key: "APPROVED", label: "Approved" },
  ];

  const currentStepIndex = React.useMemo(() => {
    if (po.status === "REJECTED" || po.status === "CANCELLED") return -1;
    return timelineSteps.findIndex((s) => s.key === po.status);
  }, [po.status]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {po.poNumber}
            </h1>
            <POStatusBadge status={po.status} />
            <POEmailStatusBadge
              status={po.emailStatus}
              onRetry={onResendEmail}
              isRetrying={isActionLoading}
            />
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Created on {new Date(po.createdAt).toLocaleDateString()} by{" "}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {po.createdBy?.name}
            </span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {canEdit && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/procurement/purchase-orders/${po.id}/edit`}>
                Edit Draft
              </Link>
            </Button>
          )}

          {canSubmit && (
            <Button
              size="sm"
              onClick={() => setActiveDialog("submit")}
              disabled={isActionLoading}
            >
              Submit PO
            </Button>
          )}

          {canApprove && (
            <>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setActiveDialog("approve")}
                disabled={isActionLoading}
              >
                Approve
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setActiveDialog("reject")}
                disabled={isActionLoading}
              >
                Reject
              </Button>
            </>
          )}

          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              className="text-rose-600 hover:bg-rose-50"
              onClick={() => setActiveDialog("cancel")}
              disabled={isActionLoading}
            >
              Cancel PO
            </Button>
          )}

          {canCreateGRN && (
            <Button asChild size="sm">
              <Link href={`/procurement/grns/new?poId=${po.id}`}>
                + Receive Goods (GRN)
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Lifecycle Timeline */}
      <div className="rounded-none border bg-card p-4">
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground">
          Workflow Lifecycle
        </h2>
        {po.status === "REJECTED" ? (
          <div className="rounded-none border border-rose-200 bg-rose-50 p-3 text-rose-700 text-sm">
            This purchase order was <strong>REJECTED</strong>.
          </div>
        ) : po.status === "CANCELLED" ? (
          <div className="rounded-none border border-amber-200 bg-amber-50 p-3 text-amber-700 text-sm">
            This purchase order was <strong>CANCELLED</strong>.
          </div>
        ) : (
          <div className="flex items-center justify-between">
            {timelineSteps.map((step, idx) => {
              const isPassed = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step.key} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-8 w-8 rounded-none flex items-center justify-center text-xs font-bold ${
                        isCurrent
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                          : isPassed
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-500 dark:bg-slate-800"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={`text-xs mt-1 font-medium ${
                        isCurrent
                          ? "text-primary"
                          : isPassed
                          ? "text-emerald-600"
                          : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < timelineSteps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 rounded-none ${
                        idx < currentStepIndex
                          ? "bg-emerald-500"
                          : "bg-slate-200 dark:bg-slate-800"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* General Details Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-none border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium">Supplier</p>
          <p className="text-base font-semibold mt-1">
            {po.supplierName || po.supplierId}
          </p>
        </div>
        <div className="rounded-none border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium">
            Expected Delivery Date
          </p>
          <p className="text-base font-semibold mt-1">
            {po.expectedDeliveryDate
              ? new Date(po.expectedDeliveryDate).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
        <div className="rounded-none border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium">Total Amount</p>
          <p className="text-xl font-bold text-primary mt-1">
            {formatCurrency(po.totalAmount)}
          </p>
        </div>
      </div>

      {po.notes && (
        <div className="rounded-none border bg-card p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Notes / Instructions
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-wrap">
            {po.notes}
          </p>
        </div>
      )}

      {/* Line Items Table */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Ordered Line Items</h3>
        <div className="rounded-none border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Cost ({baseCurrency})</TableHead>
                <TableHead className="text-right">Total Cost ({baseCurrency})</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {po.items.map((item, idx) => {
                const total = (item.totalCost ?? item.quantity * item.unitCost);
                return (
                  <TableRow key={item.id || idx}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.productName || item.productId}</p>
                        {item.productSku && (
                          <p className="text-xs text-muted-foreground">
                            SKU: {item.productSku}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unitCost)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(total)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Activity Log */}
      {po.activityLog && po.activityLog.length > 0 && (
        <div className="space-y-2 pt-4">
          <h3 className="text-lg font-semibold">Audit Trail & Activity Log</h3>
          <div className="rounded-none border bg-card p-4 space-y-3">
            {po.activityLog.map((log) => (
              <div
                key={log.id}
                className="flex items-start justify-between border-b pb-2 last:border-0 last:pb-0 text-sm"
              >
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {log.action}
                  </span>{" "}
                  <span className="text-slate-500">by {log.performedBy}</span>
                  {log.details && (
                    <p className="text-xs text-slate-500 mt-0.5">{log.details}</p>
                  )}
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dialogs */}
      <POActionDialog
        open={activeDialog === "submit"}
        onOpenChange={(op) => !op && setActiveDialog(null)}
        title="Submit Purchase Order"
        description="Are you sure you want to submit this PO for approval?"
        actionLabel="Submit"
        isLoading={isActionLoading}
        onConfirm={() => {
          onSubmit?.();
          setActiveDialog(null);
        }}
      />

      <POActionDialog
        open={activeDialog === "approve"}
        onOpenChange={(op) => !op && setActiveDialog(null)}
        title="Approve Purchase Order"
        description="Are you sure you want to approve this PO?"
        actionLabel="Approve"
        isLoading={isActionLoading}
        onConfirm={() => {
          onApprove?.();
          setActiveDialog(null);
        }}
      />

      <POActionDialog
        open={activeDialog === "reject"}
        onOpenChange={(op) => !op && setActiveDialog(null)}
        title="Reject Purchase Order"
        description="Please provide a reason for rejecting this PO."
        actionLabel="Reject PO"
        variant="destructive"
        requireReason
        isLoading={isActionLoading}
        onConfirm={(reason) => {
          onReject?.(reason);
          setActiveDialog(null);
        }}
      />

      <POActionDialog
        open={activeDialog === "cancel"}
        onOpenChange={(op) => !op && setActiveDialog(null)}
        title="Cancel Purchase Order"
        description="Are you sure you want to cancel this purchase order?"
        actionLabel="Cancel PO"
        variant="destructive"
        requireReason
        isLoading={isActionLoading}
        onConfirm={(reason) => {
          onCancel?.(reason);
          setActiveDialog(null);
        }}
      />
    </div>
  );
}
