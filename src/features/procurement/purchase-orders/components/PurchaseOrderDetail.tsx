"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { POStatusBadge } from "./POStatusBadge";
import { POActionDialog, POEmailDialog } from "./POActionDialog";
import type { PurchaseOrder } from "../types";
import { canAccess } from "@/lib/auth/permissions";
import { useAuthStore } from "@/stores/auth.store";
import { formatCurrency } from "@/utils/format";
import { useSystemSettingsStore } from "@/stores/settings.store";

export interface PurchaseOrderDetailProps {
  po: PurchaseOrder;
  onBack?: () => void;
  onSubmit?: () => void;
  onApprove?: () => void;
  onReject?: (reason: string) => void;
  onCancel?: (reason: string) => void;
  onDuplicate?: () => void;
  onEmail?: (toEmail: string, message: string) => void;
  isActionLoading?: boolean;
}

type DialogKind =
  | "submit"
  | "approve"
  | "reject"
  | "cancel"
  | "email"
  | null;

function fullName(u: { first_name: string; last_name: string } | null | undefined) {
  if (!u) return null;
  return `${u.first_name} ${u.last_name}`.trim();
}

function fmtDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString();
}

function fmtDateTime(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString();
}

export function PurchaseOrderDetail({
  po,
  onBack,
  onSubmit,
  onApprove,
  onReject,
  onCancel,
  onDuplicate,
  onEmail,
  isActionLoading = false,
}: PurchaseOrderDetailProps) {
  const { user } = useAuthStore();
  const userRole = user?.role || "viewer";
  const baseCurrency = useSystemSettingsStore((s) => s.baseCurrency);

  const [activeDialog, setActiveDialog] = React.useState<DialogKind>(null);

  const canEdit =
    canAccess(userRole, "purchase_orders.edit") && po.status === "DRAFT";
  const canSubmit =
    canAccess(userRole, "purchase_orders.edit") && po.status === "DRAFT";
  const canApprove =
    canAccess(userRole, "purchase_orders.approve") &&
    po.status === "SUBMITTED";
  const canReject =
    canAccess(userRole, "purchase_orders.approve") &&
    po.status === "SUBMITTED";
  const canCancel =
    canAccess(userRole, "purchase_orders.edit") &&
    (po.status === "DRAFT" || po.status === "SUBMITTED");
  const canCreateGRN =
    canAccess(userRole, "grn.create") &&
    (po.status === "APPROVED" || po.status === "PARTIALLY_RECEIVED");
  const canDuplicate = canAccess(userRole, "purchase_orders.create");
  const canEmail =
    canAccess(userRole, "purchase_orders.edit") &&
    (po.status === "APPROVED" ||
      po.status === "SUBMITTED" ||
      po.status === "PARTIALLY_RECEIVED" ||
      po.status === "FULLY_RECEIVED");

  // Timeline steps
  const timelineSteps = ["DRAFT", "SUBMITTED", "APPROVED"];
  const currentStepIndex = timelineSteps.indexOf(po.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              {po.po_number}
            </h1>
            <POStatusBadge status={po.status} />
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Created {fmtDateTime(po.created_at)} by{" "}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {fullName(po.created_by)}
            </span>
          </p>
          {po.email_sent_at && (
            <p className="text-xs text-emerald-600 mt-0.5">
              Emailed to {po.email_sent_to} on {fmtDateTime(po.email_sent_at)}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {canEdit && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/procurement/purchase-orders/${po.id}/edit`}>
                Edit
              </Link>
            </Button>
          )}
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Back
            </Button>
          )}
          {canDuplicate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDuplicate}
              disabled={isActionLoading}
            >
              Duplicate
            </Button>
          )}
          {canEmail && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveDialog("email")}
              disabled={isActionLoading}
            >
              Email PO
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
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => setActiveDialog("approve")}
              disabled={isActionLoading}
            >
              Approve
            </Button>
          )}
          {canReject && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setActiveDialog("reject")}
              disabled={isActionLoading}
            >
              Reject
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              className="text-rose-600 hover:bg-rose-50"
              onClick={() => setActiveDialog("cancel")}
              disabled={isActionLoading}
            >
              Cancel
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

      {/* Workflow Lifecycle */}
      <div className="rounded-none border bg-card p-4">
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground">
          Workflow Lifecycle
        </h2>
        {po.status === "REJECTED" ? (
          <div
            className="rounded-none border p-3 text-sm"
            style={{
              background: "#FDE2E2",
              borderColor: "#F8C1BC",
              color: "#C0362C",
            }}
          >
            <strong>REJECTED</strong>
            {po.rejection_reason && (
              <span> — {po.rejection_reason}</span>
            )}
            {po.rejected_by && (
              <span className="ml-2 text-xs opacity-70">
                by {fullName(po.rejected_by)} on {fmtDateTime(po.rejected_at)}
              </span>
            )}
          </div>
        ) : po.status === "CANCELLED" ? (
          <div
            className="rounded-none border p-3 text-sm"
            style={{
              background: "#FDE2E2",
              borderColor: "#F8C1BC",
              color: "#C0362C",
            }}
          >
            <strong>CANCELLED</strong>
            {po.cancellation_reason && (
              <span> — {po.cancellation_reason}</span>
            )}
            {po.cancelled_by && (
              <span className="ml-2 text-xs opacity-70">
                by {fullName(po.cancelled_by)} on {fmtDateTime(po.cancelled_at)}
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            {timelineSteps.map((step, idx) => {
              const isPassed = currentStepIndex >= 0 && idx <= currentStepIndex;
              const isCurrent = currentStepIndex >= 0 && idx === currentStepIndex;
              const label = step.charAt(0) + step.slice(1).toLowerCase();
              return (
                <div key={step} className="flex-1 flex items-center">
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
                      {label}
                    </span>
                  </div>
                  {idx < timelineSteps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 rounded-none ${
                        currentStepIndex > idx
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

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-none border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium">Supplier</p>
          <p className="text-base font-semibold mt-1">{po.supplier.name}</p>
          <p className="text-xs text-muted-foreground">
            {po.supplier.contact_person}
          </p>
        </div>
        <div className="rounded-none border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium">Order Date</p>
          <p className="text-base font-semibold mt-1">{fmtDate(po.order_date)}</p>
        </div>
        <div className="rounded-none border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium">
            Expected Delivery
          </p>
          <p className="text-base font-semibold mt-1">
            {fmtDate(po.expected_delivery_date)}
          </p>
        </div>
        <div className="rounded-none border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium">
            Total Amount
          </p>
          <p className="text-xl font-bold text-primary mt-1">
            {formatCurrency(po.total_amount)}
          </p>
        </div>
      </div>

      {/* Financials */}
      <div className="rounded-none border bg-card p-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">
          Financial Summary
        </h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm max-w-xs">
          <span className="text-muted-foreground">Subtotal:</span>
          <span className="font-medium text-right">
            {formatCurrency(po.subtotal)}
          </span>
          <span className="text-muted-foreground">Discount:</span>
          <span className="font-medium text-right text-rose-600">
            -{formatCurrency(po.discount_amount)}
          </span>
          <span className="text-muted-foreground">Tax:</span>
          <span className="font-medium text-right">
            {formatCurrency(po.tax_amount)}
          </span>
          <span className="font-semibold border-t pt-1">Total:</span>
          <span className="font-bold text-primary border-t pt-1 text-right">
            {formatCurrency(po.total_amount)}
          </span>
        </div>
      </div>

      {/* Additional Details */}
      {(po.notes || po.terms_conditions || po.shipping_address) && (
        <div className="grid gap-4 md:grid-cols-3">
          {po.notes && (
            <div className="rounded-none border bg-card p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Notes
              </h3>
              <p className="text-sm whitespace-pre-wrap">{po.notes}</p>
            </div>
          )}
          {po.terms_conditions && (
            <div className="rounded-none border bg-card p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Terms & Conditions
              </h3>
              <p className="text-sm whitespace-pre-wrap">
                {po.terms_conditions}
              </p>
            </div>
          )}
          {po.shipping_address && (
            <div className="rounded-none border bg-card p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Shipping Address
              </h3>
              <p className="text-sm whitespace-pre-wrap">
                {po.shipping_address}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Approval Details */}
      {(po.submitted_by || po.approved_by) && (
        <div className="rounded-none border bg-card p-4 grid gap-3 sm:grid-cols-2 text-sm">
          {po.submitted_by && (
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Submitted By
              </span>
              <p className="mt-0.5">
                {fullName(po.submitted_by)}{" "}
                <span className="text-muted-foreground">
                  on {fmtDateTime(po.submitted_at)}
                </span>
              </p>
            </div>
          )}
          {po.approved_by && (
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Approved By
              </span>
              <p className="mt-0.5">
                {fullName(po.approved_by)}{" "}
                <span className="text-muted-foreground">
                  on {fmtDateTime(po.approved_at)}
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Line Items Table */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Order Items</h3>
        <div className="rounded-none border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Qty Ordered</TableHead>
                <TableHead className="text-right">Qty Received</TableHead>
                <TableHead className="text-right">
                  Unit Price ({baseCurrency})
                </TableHead>
                <TableHead className="text-right">Disc %</TableHead>
                <TableHead className="text-right">Tax %</TableHead>
                <TableHead className="text-right">
                  Line Total ({baseCurrency})
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {po.items.map((item, idx) => (
                <TableRow key={item.id || idx}>
                  <TableCell>
                    <p className="font-medium">{item.product.name}</p>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground">
                        {item.notes}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {item.product.sku}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.quantity_ordered}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.quantity_received}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.unit_price)}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.discount_percent}%
                  </TableCell>
                  <TableCell className="text-right">
                    {item.tax_percent}%
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(item.line_total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Dialogs */}
      <POActionDialog
        open={activeDialog === "submit"}
        onOpenChange={(op) => !op && setActiveDialog(null)}
        title="Submit Purchase Order"
        description="Submit this PO for approval? It will no longer be editable."
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
        description="Approve this PO? It will be ready for goods receiving."
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
        reasonLabel="Rejection Reason *"
        isLoading={isActionLoading}
        onConfirm={(reason) => {
          if (reason) {
            onReject?.(reason);
            setActiveDialog(null);
          }
        }}
      />

      <POActionDialog
        open={activeDialog === "cancel"}
        onOpenChange={(op) => !op && setActiveDialog(null)}
        title="Cancel Purchase Order"
        description="Cancel this purchase order? Please provide a reason."
        actionLabel="Cancel PO"
        variant="destructive"
        requireReason
        reasonLabel="Cancellation Reason *"
        isLoading={isActionLoading}
        onConfirm={(reason) => {
          if (reason) {
            onCancel?.(reason);
            setActiveDialog(null);
          }
        }}
      />

      <POEmailDialog
        open={activeDialog === "email"}
        onOpenChange={(op) => !op && setActiveDialog(null)}
        defaultEmail={po.supplier.email}
        isLoading={isActionLoading}
        onConfirm={(toEmail, message) => {
          onEmail?.(toEmail, message);
          setActiveDialog(null);
        }}
      />
    </div>
  );
}
