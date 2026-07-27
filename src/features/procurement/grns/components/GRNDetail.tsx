"use client";

import * as React from "react";
import Link from "next/link";
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
  onSubmit?: () => void;
  onApprove?: () => void;
  isActionLoading?: boolean;
}

export function GRNDetail({
  grn,
  onSubmit,
  onApprove,
  isActionLoading = false,
}: GRNDetailProps) {
  const { user } = useAuthStore();
  const userRole = user?.role || "viewer";

  const [activeDialog, setActiveDialog] = React.useState<
    "submit" | "approve" | null
  >(null);

  const canSubmit =
    canAccess(userRole, "grn.edit") && grn.status === "DRAFT";
  const canApprove =
    canAccess(userRole, "grn.edit") && grn.status === "SUBMITTED";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {grn.grnNumber}
            </h1>
            <GRNStatusBadge status={grn.status} />
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Received on {new Date(grn.receivedDate).toLocaleDateString()} by{" "}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {grn.receivedBy?.name}
            </span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
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
              Approve GRN & Update Inventory
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium">
            Linked Purchase Order
          </p>
          <p className="text-base font-semibold text-primary mt-1">
            <Link
              href={`/procurement/purchase-orders/${grn.purchaseOrderId}`}
              className="hover:underline"
            >
              {grn.poNumber}
            </Link>
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium">Supplier</p>
          <p className="text-base font-semibold mt-1">
            {grn.supplierName || grn.supplierId}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium">
            Received By
          </p>
          <p className="text-base font-semibold mt-1">
            {grn.receivedBy?.name}
          </p>
        </div>
      </div>

      {grn.notes && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Delivery / Receipt Notes
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-wrap">
            {grn.notes}
          </p>
        </div>
      )}

      {/* Received Items */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Received Quantities</h3>
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Ordered Qty</TableHead>
                <TableHead className="text-right">Received Qty</TableHead>
                <TableHead className="text-right">Remaining / Discrepancy</TableHead>
                <TableHead>Item Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grn.items.map((item, idx) => {
                const remaining =
                  item.remainingQuantity ??
                  Math.max(0, item.orderedQuantity - item.receivedQuantity);

                return (
                  <TableRow key={item.id || idx}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {item.productName || item.productId}
                        </p>
                        {item.productSku && (
                          <p className="text-xs text-muted-foreground">
                            SKU: {item.productSku}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{item.orderedQuantity}</TableCell>
                    <TableCell className="text-right font-semibold text-emerald-600">
                      {item.receivedQuantity}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {remaining > 0 ? (
                        <span className="text-amber-600">{remaining} short</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {item.notes || "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Inventory Impact Summary (Read-Only) */}
      {grn.inventoryImpact && grn.inventoryImpact.length > 0 && (
        <div className="space-y-2 pt-4">
          <h3 className="text-lg font-semibold">Inventory Impact Summary</h3>
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Previous Stock Level</TableHead>
                  <TableHead className="text-right">Added Stock</TableHead>
                  <TableHead className="text-right font-bold text-emerald-600">
                    New Stock Level
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grn.inventoryImpact.map((impact) => (
                  <TableRow key={impact.productId}>
                    <TableCell className="font-medium">
                      {impact.productName} ({impact.productSku})
                    </TableCell>
                    <TableCell className="text-right">{impact.previousQuantity}</TableCell>
                    <TableCell className="text-right text-emerald-600 font-semibold">
                      +{impact.addedQuantity}
                    </TableCell>
                    <TableCell className="text-right font-bold text-emerald-600">
                      {impact.newQuantity}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <POActionDialog
        open={activeDialog === "submit"}
        onOpenChange={(op) => !op && setActiveDialog(null)}
        title="Submit GRN"
        description="Are you sure you want to submit this GRN?"
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
        title="Approve GRN & Update Inventory"
        description="Approving this GRN will immediately increase current stock levels in inventory for all received items. This action cannot be undone."
        actionLabel="Approve & Increase Stock"
        isLoading={isActionLoading}
        onConfirm={() => {
          onApprove?.();
          setActiveDialog(null);
        }}
      />
    </div>
  );
}
