"use client";

/**
 * ProductDetailPage — detail view for a single product.
 * Shows general info, classification, pricing, inventory thresholds, image, and metadata.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Package,
  Tag,
  Barcode,
  Building2,
  Ruler,
  Truck,
  DollarSign,
  Download,
  ImageIcon,
  X,
} from "lucide-react";
import {
  useProduct,
  useDeleteProduct,
  useUploadProductImage,
  useDeleteProductImage,
  useDownloadBarcode,
  useProductImage,
} from "../../hooks/use-products";
import { ProductFormDialog } from "../components/ProductFormDialog";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Separator } from "@/app/components/ui/separator";
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
import { formatDate, formatCurrency } from "@/utils/format";
import { usePageTitle } from "@/hooks/use-page-title";

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

/** Trigger a blob download in the browser */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ProductDetailPage({ productId }: ProductDetailPageProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const { data: product, isLoading, error, refetch } = useProduct(productId);
  const { data: imageUrl, isLoading: imageLoading } = useProductImage(productId);
  const deleteMutation = useDeleteProduct();
  const uploadImage = useUploadProductImage(productId);
  const deleteImage = useDeleteProductImage(productId);
  const downloadBarcode = useDownloadBarcode();

  const imageInputRef = React.useRef<HTMLInputElement>(null);

  usePageTitle(product?.name);

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

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadImage.mutateAsync(file);
    e.target.value = "";
  }

  async function handleDownloadBarcode() {
    const blob = await downloadBarcode.mutateAsync(productId);
    downloadBlob(blob, `barcode-${product!.sku}.png`);
  }

  return (
    <PageContainer>
      <PageHeader
        title={product.name}
        description={product.short_description ?? `SKU: ${product.sku}`}
        breadcrumb={
          <Breadcrumb
            items={[
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

            {/* Download barcode */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadBarcode}
              disabled={downloadBarcode.isPending}
              title="Download barcode PNG"
            >
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              Barcode
            </Button>

            <PermissionGuard permission="products.edit">
              <Button size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                Edit
              </Button>
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
              value={
                <code className="rounded-none bg-muted px-1.5 py-0.5 text-xs font-mono">
                  {product.sku}
                </code>
              }
            />
            {product.barcode && (
              <DetailRow
                icon={<Barcode className="h-4 w-4" />}
                label="Barcode"
                value={
                  <code className="rounded-none bg-muted px-1.5 py-0.5 text-xs font-mono">
                    {product.barcode}
                  </code>
                }
              />
            )}
            {product.short_description && (
              <DetailRow
                icon={<Package className="h-4 w-4" />}
                label="Short Description"
                value={product.short_description}
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
              value={
                product.supplier ? (
                  <span>
                    {product.supplier.name}
                    <span className="ml-2 text-xs text-muted-foreground">
                      #{product.supplier.supplier_code}
                    </span>
                  </span>
                ) : (
                  "—"
                )
              }
            />
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4" aria-hidden="true" />
              Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <DetailRow
              icon={<DollarSign className="h-4 w-4" />}
              label="Cost Price"
              value={<span className="font-medium tabular-nums">{formatCurrency(product.cost_price)}</span>}
            />
            <DetailRow
              icon={<DollarSign className="h-4 w-4" />}
              label="Selling Price"
              value={<span className="font-medium tabular-nums">{formatCurrency(product.selling_price)}</span>}
            />
          </CardContent>
        </Card>

        {/* Inventory thresholds */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4" aria-hidden="true" />
              Inventory Thresholds
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <DetailRow
              icon={<Package className="h-4 w-4" />}
              label="Reorder Level"
              value={
                <span>
                  {product.reorder_level}
                  {product.uom && (
                    <span className="text-xs text-muted-foreground ml-1">{product.uom.symbol}</span>
                  )}
                </span>
              }
            />
            <DetailRow
              icon={<Package className="h-4 w-4" />}
              label="Reorder Quantity"
              value={
                <span>
                  {product.reorder_quantity}
                  {product.uom && (
                    <span className="text-xs text-muted-foreground ml-1">{product.uom.symbol}</span>
                  )}
                </span>
              }
            />
          </CardContent>
        </Card>

        {/* Product Image */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ImageIcon className="h-4 w-4" aria-hidden="true" />
              Product Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            {imageLoading ? (
              <div className="flex items-center justify-center py-8">
                <Skeleton className="h-48 w-full" />
              </div>
            ) : imageUrl ? (
              <div className="flex flex-col gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="max-h-48 w-auto rounded object-contain border border-border"
                />
                <PermissionGuard permission="products.edit">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={uploadImage.isPending}
                    >
                      <ImageIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                      Replace
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteImage.mutate()}
                      disabled={deleteImage.isPending}
                    >
                      <X className="mr-2 h-4 w-4" aria-hidden="true" />
                      Remove
                    </Button>
                  </div>
                </PermissionGuard>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-8 text-center text-muted-foreground">
                <ImageIcon className="h-10 w-10 opacity-30" aria-hidden="true" />
                <p className="text-sm">No image uploaded</p>
                <PermissionGuard permission="products.edit">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadImage.isPending}
                  >
                    <ImageIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                    Upload Image
                  </Button>
                </PermissionGuard>
              </div>
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              aria-label="Select product image"
            />
          </CardContent>
        </Card>

        {/* Record Info */}
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
              <span>{formatDate(product.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated</span>
              <span>{formatDate(product.updated_at)}</span>
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
        description={`Are you sure you want to delete "${product.name}" (SKU: ${product.sku})? This action cannot be undone.`}
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </PageContainer>
  );
}
