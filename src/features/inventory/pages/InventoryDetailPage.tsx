"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  Package,
  Barcode,
  Tag,
  Building,
  Truck,
  Scale,
  Calendar,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  History,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { PageContainer } from "@/components/common/page-container";
import { AppCard } from "@/components/common/app-card";
import { StatCard } from "@/components/common/stat-card";
import { Button } from "@/app/components/ui/button";
import { StockStatusBadge } from "../components/stock-status/StockStatusBadge";
import { InventoryHistoryTable } from "../components/inventory-history/InventoryHistoryTable";
import { StockAdjustmentDialog } from "../components/adjustment-dialog/StockAdjustmentDialog";
import { useInventoryDetail, useProductLedger } from "../hooks/use-inventory";
import { formatQuantity, formatCurrency } from "../utils/inventory-utils";
import { useAuthStore } from "@/stores/auth.store";

export interface InventoryDetailPageProps {
  productId: string;
}

export function InventoryDetailPage({ productId }: InventoryDetailPageProps) {
  const { user } = useAuthStore();
  const canAdjust =
    user?.role === "admin" ||
    user?.role === "super_admin" ||
    user?.role === "stock_clerk" ||
    user?.role === "warehouse_manager";

  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = React.useState(false);

  const {
    data: inventoryItem,
    isLoading: isDetailLoading,
    error: detailError,
    refetch: refetchDetail,
  } = useInventoryDetail(productId);

  const {
    data: ledgerData,
    isLoading: isLedgerLoading,
    refetch: refetchLedger,
  } = useProductLedger(productId, 1, 10);

  const product = inventoryItem?.product;

  // Compute transaction statistics from ledger
  const stats = React.useMemo(() => {
    let totalReceived = 0;
    let totalReleased = 0;
    let totalAdjustments = 0;

    if (ledgerData?.data) {
      ledgerData.data.forEach((entry) => {
        const change = entry.quantity_change;
        if (entry.entry_type === "GRN_RECEIPT" || entry.entry_type === "INITIAL_STOCK") {
          totalReceived += change > 0 ? change : 0;
        } else if (entry.entry_type === "STOCK_RELEASE") {
          totalReleased += Math.abs(change);
        } else if (entry.entry_type.includes("ADJUSTMENT")) {
          totalAdjustments += Math.abs(change);
        }
      });
    }

    return { totalReceived, totalReleased, totalAdjustments };
  }, [ledgerData]);

  if (isDetailLoading) {
    return (
      <PageContainer className="space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/inventory" className="text-sm text-muted-foreground hover:underline flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Inventory
          </Link>
        </div>
        <div className="h-48 rounded-lg bg-card animate-pulse border border-border" />
      </PageContainer>
    );
  }

  if (detailError || !inventoryItem) {
    return (
      <PageContainer className="space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/inventory" className="text-sm text-muted-foreground hover:underline flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Inventory
          </Link>
        </div>
        <AppCard className="p-8 text-center space-y-4">
          <Package className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-bold">Inventory Record Not Found</h2>
          <p className="text-sm text-muted-foreground">
            The requested product inventory details could not be found or loaded.
          </p>
          <Button onClick={() => refetchDetail()}>Try Again</Button>
        </AppCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6">
      {/* Back button & Header */}
      <div className="space-y-2">
        <Link
          href="/inventory"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Inventory Overview
        </Link>

        <PageHeader
          title={product?.name ?? "Product Inventory Details"}
          description={`SKU: ${product?.sku ?? "N/A"} ${product?.barcode ? `• Barcode: ${product.barcode}` : ""}`}
          actions={
            <div className="flex items-center gap-2">
              <StockStatusBadge
                quantityOnHand={inventoryItem.quantity_on_hand}
                reorderLevel={product?.reorder_level ?? 0}
              />
              {canAdjust && (
                <Button
                  onClick={() => setAdjustmentDialogOpen(true)}
                  className="gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Adjust Stock</span>
                </Button>
              )}
            </div>
          }
        />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Current Quantity"
          value={`${formatQuantity(inventoryItem.quantity_on_hand)} ${product?.uom_code ?? ""}`}
          description={`Minimum reorder level: ${formatQuantity(product?.reorder_level ?? 0)}`}
          icon={<Package className="h-5 w-5 text-primary" />}
        />
        <StatCard
          label="Stock Valuation"
          value={formatCurrency(inventoryItem.stock_value)}
          description={`Avg Cost: ${formatCurrency(inventoryItem.average_cost)} / unit`}
          icon={<Tag className="h-5 w-5 text-emerald-600" />}
        />
        <StatCard
          label="Total Received"
          value={formatQuantity(stats.totalReceived)}
          description="Cumulative stock received"
          icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
        />
        <StatCard
          label="Total Released"
          value={formatQuantity(stats.totalReleased)}
          description="Cumulative stock issued"
          icon={<TrendingDown className="h-5 w-5 text-amber-600" />}
        />
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Product Specifications */}
        <AppCard title="Product Information" className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-xs text-muted-foreground">Product Name</div>
                <div className="font-semibold text-foreground">{product?.name ?? "—"}</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Barcode className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-xs text-muted-foreground">SKU / Barcode</div>
                <div className="font-semibold text-foreground">{product?.sku ?? "—"}</div>
                {product?.barcode && <div className="text-xs text-muted-foreground">{product.barcode}</div>}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-xs text-muted-foreground">Category</div>
                <div className="font-medium text-foreground">{product?.category_name ?? "Uncategorized"}</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-xs text-muted-foreground">Brand</div>
                <div className="font-medium text-foreground">{product?.brand_name ?? "—"}</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Truck className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-xs text-muted-foreground">Supplier</div>
                <div className="font-medium text-foreground">{product?.supplier_name ?? "—"}</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Scale className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-xs text-muted-foreground">Unit of Measure</div>
                <div className="font-medium text-foreground">{product?.uom_name ?? product?.uom_code ?? "—"}</div>
              </div>
            </div>
          </div>
        </AppCard>

        {/* Inventory Status & Pricing */}
        <AppCard title="Inventory & Pricing Breakdown" className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Current Quantity on Hand</div>
              <div className="text-2xl font-bold text-foreground">
                {formatQuantity(inventoryItem.quantity_on_hand)}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Minimum Stock Level</div>
              <div className="text-2xl font-bold text-muted-foreground">
                {formatQuantity(product?.reorder_level ?? 0)}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Average Unit Cost</div>
              <div className="font-semibold text-foreground">
                {formatCurrency(inventoryItem.average_cost)}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Catalog Selling Price</div>
              <div className="font-semibold text-foreground">
                {formatCurrency(product?.selling_price)}
              </div>
            </div>

            <div className="col-span-2 flex items-center gap-2 pt-2 text-xs text-muted-foreground border-t border-border">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                Last Stock Update:{" "}
                {inventoryItem.last_updated_at
                  ? format(new Date(inventoryItem.last_updated_at), "MMM dd, yyyy HH:mm:ss")
                  : "N/A"}
              </span>
            </div>
          </div>
        </AppCard>
      </div>

      {/* Movement History Preview Section */}
      <AppCard
        title="Recent Movement History"
        description="Audit ledger of recent stock receipts, issues, and manual adjustments."
        headerActions={
          <Link href={`/inventory/history?product_id=${productId}`}>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              <History className="h-3.5 w-3.5" />
              View Full History Ledger
            </Button>
          </Link>
        }
      >
        <InventoryHistoryTable
          data={ledgerData?.data ?? []}
          loading={isLedgerLoading}
          hideProductColumn
          totalRecords={ledgerData?.pagination?.total ?? 0}
          onRefresh={() => refetchLedger()}
        />
      </AppCard>

      {/* Stock Adjustment Dialog */}
      <StockAdjustmentDialog
        open={adjustmentDialogOpen}
        onOpenChange={setAdjustmentDialogOpen}
        inventoryItem={inventoryItem}
        onSuccess={() => {
          refetchDetail();
          refetchLedger();
        }}
      />
    </PageContainer>
  );
}
