"use client";

/**
 * ProductDetailPage — detail view for a single product.
 * Shows general info, classification, inventory status, and metadata.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  RotateCcw,
  Package,
  Tag,
  Barcode,
  TrendingDown,
  Building2,
  Ruler,
  Truck,
  AlertCircle,
} from "lucide-react";
import { useProduct, useDeleteProduct, useRestoreProduct } from "../../hooks/use-products";
import { ProductFormDialog } from "../components/ProductFormDialog";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Separator } from "@/app/components/ui/separator";
import { Badge } from "@/app/components/ui/badge";
import {
  PageContainer,
  PageHeader,
  Breadcrumb,
  StatusBadge,
  DeleteDialog,
  PermissionGuard,
  ErrorState,
} from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { formatDate } from "@/utils/format";

interface ProductDetailPageProps {
  productId: string;
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground break-words">{value || "—"}</p>
      </div>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <PageContainer>
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-20" />
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </PageContainer>
  );
}

export function ProductDetailPage({ productId }: ProductDetailPageProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const { data: product, isLoading, error, refetch } = useProduct(productId);
  const deleteMutation = useDeleteProduct();
  const restoreMutation = useRestoreProduct();

  if (isLoading) return <ProductDetailSkeleton />;
  if (error) return (
    <PageContainer>
      <ErrorState error={error} onRetry={refetch} />
    </PageContainer>
  );
  if (!product) return null;

  async function handleDelete() {
    await deleteMutation.mutateAsync(productId);
    router.push("/products");
  }

  const isLowStock = product.current_stock != null && product.current_stock <= product.min_stock_level;

  return (
    <PageContainer>
      <PageHeader
        title={product.name}
        description={product.description ?? `SKU: ${product.sku}`}
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Products", href: "/products" },
              { label: product.name },
            ]}
          />
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Back
            </Button>
            <div className="flex items-center gap-1">
              <StatusBadge variant={product.is_active ? "active" : "inactive"} dot />
            </div>
            <PermissionGuard permission="products.edit">
              {product.is_active ? (
                <Button size="sm" onClick={() => setEditOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                  Edit
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => restoreMutation.mutate(productId)}
                  disabled={restoreMutation.isPending}
                >
                  <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                  Restore
                </Button>
              )}
            </PermissionGuard>
            <PermissionGuard permission="products.delete">
              {product.is_active && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeleteOpen(true)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                  Delete
                </Button>
              )}
            </PermissionGuard>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* General Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4" aria-hidden="true" />
              General Information
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <DetailRow
              icon={<Package className="h-4 w-4" />}
              label="Product Name"
              value={product.name}
            />
            <DetailRow
              icon={<Tag className="h-4 w-4" />}
              label="SKU"
              value={<code className="rounded-none bg-muted px-1.5 py-0.5 text-xs font-mono">{product.sku}</code>}
            />
            {product.barcode && (
              <DetailRow
                icon={<Barcode className="h-4 w-4" />}
                label="Barcode"
                value={<code className="rounded-none bg-muted px-1.5 py-0.5 text-xs font-mono">{product.barcode}</code>}
              />
            )}
            {product.description && (
              <DetailRow
                icon={<Package className="h-4 w-4" />}
                label="Description"
                value={product.description}
              />
            )}
          </CardContent>
        </Card>

        {/* Classification */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Tag className="h-4 w-4" aria-hidden="true" />
              Classification
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <DetailRow
              icon={<Tag className="h-4 w-4" />}
              label="Category"
              value={product.category?.name ?? "—"}
            />
            <DetailRow
              icon={<Building2 className="h-4 w-4" />}
              label="Brand"
              value={product.brand?.name ?? "—"}
            />
            <DetailRow
              icon={<Ruler className="h-4 w-4" />}
              label="Unit of Measure"
              value={
                product.uom ? (
                  <span>
                    {product.uom.name}{" "}
                    <code className="rounded-none bg-muted px-1.5 py-0.5 text-xs font-mono">
                      {product.uom.symbol}
                    </code>
                  </span>
                ) : (
                  "—"
                )
              }
            />
            <DetailRow
              icon={<Truck className="h-4 w-4" />}
              label="Supplier"
              value={product.supplier?.company_name ?? "—"}
            />
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4" aria-hidden="true" />
              Inventory
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <DetailRow
              icon={<Package className="h-4 w-4" />}
              label="Current Stock"
              value={
                product.current_stock != null ? (
                  <div className="flex items-center gap-2">
                    <span className={isLowStock ? "text-destructive font-semibold" : "font-medium"}>
                      {product.current_stock}
                    </span>
                    {product.uom && <span className="text-xs text-muted-foreground">{product.uom.symbol}</span>}
                    {isLowStock && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="h-3 w-3" aria-hidden="true" />
                        Low Stock
                      </Badge>
                    )}
                  </div>
                ) : (
                  "Not tracked"
                )
              }
            />
            <DetailRow
              icon={<TrendingDown className="h-4 w-4" />}
              label="Minimum Stock Level"
              value={
                <span>
                  {product.min_stock_level}
                  {product.uom && <span className="text-xs text-muted-foreground ml-1">{product.uom.symbol}</span>}
                </span>
              }
            />
          </CardContent>
        </Card>

        {/* Meta */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Record Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge variant={product.is_active ? "active" : "inactive"} dot />
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{formatDate(product.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated</span>
              <span>{formatDate(product.updatedAt)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit dialog */}
      <ProductFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        product={product}
      />

      {/* Delete confirmation */}
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        itemName={product.name}
        description={`Are you sure you want to delete "${product.name}" (SKU: ${product.sku})? This action cannot be undone and will affect inventory records.`}
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </PageContainer>
  );
}
