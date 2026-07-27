"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { PurchaseOrderDetail } from "@/features/procurement/purchase-orders/components/PurchaseOrderDetail";
import {
  usePurchaseOrder,
  useSubmitPurchaseOrder,
  useApprovePurchaseOrder,
  useRejectPurchaseOrder,
  useCancelPurchaseOrder,
  useResendPOEmail,
} from "@/features/procurement/purchase-orders/hooks/use-purchase-orders";

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: po, isLoading, error } = usePurchaseOrder(id);

  const submitMutation = useSubmitPurchaseOrder();
  const approveMutation = useApprovePurchaseOrder();
  const rejectMutation = useRejectPurchaseOrder();
  const cancelMutation = useCancelPurchaseOrder();
  const resendEmailMutation = useResendPOEmail();

  const isActionLoading =
    submitMutation.isPending ||
    approveMutation.isPending ||
    rejectMutation.isPending ||
    cancelMutation.isPending ||
    resendEmailMutation.isPending;

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !po) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-rose-600">
          Purchase Order Not Found
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          The requested purchase order could not be loaded.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-2">
      <PurchaseOrderDetail
        po={po}
        onSubmit={() => submitMutation.mutate(po.id)}
        onApprove={() => approveMutation.mutate(po.id)}
        onReject={(reason) => rejectMutation.mutate({ id: po.id, reason })}
        onCancel={(reason) => cancelMutation.mutate({ id: po.id, reason })}
        onResendEmail={() => resendEmailMutation.mutate(po.id)}
        isActionLoading={isActionLoading}
      />
    </div>
  );
}
