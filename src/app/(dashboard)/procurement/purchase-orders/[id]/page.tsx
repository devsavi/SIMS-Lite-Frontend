"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/app/components/ui/skeleton";
import { PurchaseOrderDetail } from "@/features/procurement/purchase-orders/components/PurchaseOrderDetail";
import {
  usePurchaseOrder,
  useSubmitPurchaseOrder,
  useApprovePurchaseOrder,
  useRejectPurchaseOrder,
  useCancelPurchaseOrder,
  useDuplicatePurchaseOrder,
  useEmailPurchaseOrder,
} from "@/features/procurement/purchase-orders/hooks/use-purchase-orders";

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: response, isLoading, error } = usePurchaseOrder(id);
  const po = response?.data;

  const submitMutation = useSubmitPurchaseOrder();
  const approveMutation = useApprovePurchaseOrder();
  const rejectMutation = useRejectPurchaseOrder();
  const cancelMutation = useCancelPurchaseOrder();
  const duplicateMutation = useDuplicatePurchaseOrder();
  const emailMutation = useEmailPurchaseOrder();

  const isActionLoading =
    submitMutation.isPending ||
    approveMutation.isPending ||
    rejectMutation.isPending ||
    cancelMutation.isPending ||
    duplicateMutation.isPending ||
    emailMutation.isPending;

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
        onBack={() => router.back()}
        onSubmit={() => submitMutation.mutate(po.id)}
        onApprove={() => approveMutation.mutate(po.id)}
        onReject={(reason) =>
          rejectMutation.mutate({ id: po.id, body: { reason } })
        }
        onCancel={(reason) =>
          cancelMutation.mutate({ id: po.id, body: { reason } })
        }
        onDuplicate={() =>
          duplicateMutation.mutate(po.id, {
            onSuccess: (newPo) => {
              router.push(`/procurement/purchase-orders/${newPo.id}`);
            },
          })
        }
        onEmail={(toEmail, message) =>
          emailMutation.mutate({ id: po.id, body: { to_email: toEmail, message } })
        }
        isActionLoading={isActionLoading}
      />
    </div>
  );
}
