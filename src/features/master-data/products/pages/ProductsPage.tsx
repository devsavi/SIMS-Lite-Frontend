"use client";

/**
 * ProductsPage — full CRUD list page for products.
 * Supports server-side search, filtering by category/brand/supplier, pagination.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, RotateCcw, Eye } from "lucide-react";
import { type SortingState } from "@tanstack/react-table";
import { useProducts, useDeleteProduct, useRestoreProduct } from "../../hooks/use-products";
import { useCategories } from "../../hooks/use-categories";
import { useBrands } from "../../hooks/use-brands";
import { useSuppliers } from "../../hooks/use-suppliers";
import { ProductFormDialog } from "../components/ProductFormDialog";
import { Button } from "@/app/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  PageContainer,
  PageHeader,
  Breadcrumb,
  DataTable,
  SearchInput,
  Toolbar,
  ToolbarLeft,
  ToolbarRight,
  StatusBadge,
  DeleteDialog,
  PermissionGuard,
  FilterBar,
} from "@/components/common";
import type { ColumnDef } from "@/components/common/data-table";
import { formatDate } from "@/utils/format";
import { useDebounce } from "@/hooks/use-debounce";
import type { Product, Category, Brand, Supplier } from "../../types";

export function ProductsPage() {
  const router = useRouter();

  // ---- Pagination & search ----
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search, 300);

  // ---- Filters ----
  const [categoryId, setCategoryId] = React.useState<string | undefined>();
  const [brandId, setBrandId] = React.useState<string | undefined>();
  const [supplierId, setSupplierId] = React.useState<string | undefined>();
  const [showInactive, setShowInactive] = React.useState(false);

  // ---- Sorting ----
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // ---- Dialog state ----
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Product | null>(null);

  // Derive server-side ordering string
  const ordering = sorting.length > 0
    ? `${sorting[0].desc ? "-" : ""}${sorting[0].id}`
    : "name";

  // ---- Queries ----
  const { data, isLoading, error, refetch } = useProducts({
    page,
    page_size: pageSize,
    search: debouncedSearch || undefined,
    is_active: showInactive ? undefined : true,
    ordering,
    category_id: categoryId,
    brand_id: brandId,
    supplier_id: supplierId,
  });

  const { data: categoriesData } = useCategories({ page: 1, page_size: 200, is_active: true });
  const { data: brandsData } = useBrands({ page: 1, page_size: 200, is_active: true });
  const { data: suppliersData } = useSuppliers({ page: 1, page_size: 200, is_active: true });

  const deleteMutation = useDeleteProduct();
  const restoreMutation = useRestoreProduct();

  // Reset page on filter changes
  React.useEffect(() => { setPage(1); }, [debouncedSearch, categoryId, brandId, supplierId, showInactive]);

  // ---- Active filter chips ----
  const activeFilters: Array<{ label: string; onRemove: () => void }> = [
    ...(categoryId
      ? [{
          label: `Category: ${categoriesData?.data.find((c: Category) => c.id === categoryId)?.name ?? categoryId}`,
          onRemove: () => setCategoryId(undefined),
        }]
      : []),
    ...(brandId
      ? [{
          label: `Brand: ${brandsData?.data.find((b: Brand) => b.id === brandId)?.name ?? brandId}`,
          onRemove: () => setBrandId(undefined),
        }]
      : []),
    ...(supplierId
      ? [{
          label: `Supplier: ${suppliersData?.data.find((s: Supplier) => s.id === supplierId)?.company_name ?? supplierId}`,
          onRemove: () => setSupplierId(undefined),
        }]
      : []),
    ...(showInactive ? [{ label: "Showing inactive", onRemove: () => setShowInactive(false) }] : []),
  ];

  // ---- Columns ----
  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => (
        <code className="rounded-none bg-muted px-1.5 py-0.5 text-xs font-mono">
          {row.original.sku}
        </code>
      ),
      size: 120,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.name}</span>
      ),
    },
    {
      id: "category",
      header: "Category",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.category?.name ?? "—"}
        </span>
      ),
    },
    {
      id: "brand",
      header: "Brand",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.brand?.name ?? "—"}
        </span>
      ),
    },
    {
      id: "uom",
      header: "UoM",
      cell: ({ row }) => {
        const uom = row.original.uom;
        if (!uom) return <span className="text-muted-foreground">—</span>;
        return (
          <code className="rounded-none bg-muted px-1.5 py-0.5 text-xs font-mono">
            {uom.symbol}
          </code>
        );
      },
      size: 80,
    },
    {
      id: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const current = row.original.current_stock;
        const min = row.original.min_stock_level;
        if (current == null) return <span className="text-muted-foreground">—</span>;
        const isLow = current <= min;
        return (
          <span className={isLow ? "text-destructive font-medium" : undefined}>
            {current}
          </span>
        );
      },
      size: 80,
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge variant={row.original.is_active ? "active" : "inactive"} dot />
      ),
      size: 100,
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.original.createdAt)}</span>
      ),
      size: 120,
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <PermissionGuard permission="products.view">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/products/${row.original.id}`)}
              aria-label={`View ${row.original.name}`}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </PermissionGuard>
          <PermissionGuard permission="products.edit">
            {row.original.is_active ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setEditingProduct(row.original); setDialogOpen(true); }}
                aria-label={`Edit ${row.original.name}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => restoreMutation.mutate(row.original.id)}
                aria-label={`Restore ${row.original.name}`}
                disabled={restoreMutation.isPending}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </PermissionGuard>
          <PermissionGuard permission="products.delete">
            {row.original.is_active && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteTarget(row.original)}
                aria-label={`Delete ${row.original.name}`}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </PermissionGuard>
        </div>
      ),
      size: 120,
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Products"
        description="Manage your product catalogue."
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Products" },
            ]}
          />
        }
        actions={
          <PermissionGuard permission="products.create">
            <Button
              onClick={() => { setEditingProduct(null); setDialogOpen(true); }}
            >
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              New Product
            </Button>
          </PermissionGuard>
        }
      />

      {/* Toolbar */}
      <Toolbar>
        <ToolbarLeft>
          <SearchInput
            placeholder="Search by name or SKU…"
            value={search}
            onChange={setSearch}
            aria-label="Search products"
            className="w-64"
          />
        </ToolbarLeft>
        <ToolbarRight>
          {/* Category filter */}
          <Select
            value={categoryId ?? "__all__"}
            onValueChange={(v) => setCategoryId(v === "__all__" ? undefined : v)}
          >
            <SelectTrigger className="h-9 w-44 text-sm">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Categories</SelectItem>
              {(categoriesData?.data ?? []).map((c: Category) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Brand filter */}
          <Select
            value={brandId ?? "__all__"}
            onValueChange={(v) => setBrandId(v === "__all__" ? undefined : v)}
          >
            <SelectTrigger className="h-9 w-36 text-sm">
              <SelectValue placeholder="All Brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Brands</SelectItem>
              {(brandsData?.data ?? []).map((b: Brand) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Supplier filter */}
          <Select
            value={supplierId ?? "__all__"}
            onValueChange={(v) => setSupplierId(v === "__all__" ? undefined : v)}
          >
            <SelectTrigger className="h-9 w-44 text-sm">
              <SelectValue placeholder="All Suppliers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Suppliers</SelectItem>
              {(suppliersData?.data ?? []).map((s: Supplier) => (
                <SelectItem key={s.id} value={s.id}>{s.company_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInactive((v) => !v)}
          >
            {showInactive ? "Hide Inactive" : "Show Inactive"}
          </Button>
        </ToolbarRight>
      </Toolbar>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <FilterBar
          filters={activeFilters}
          onClearAll={() => {
            setCategoryId(undefined);
            setBrandId(undefined);
            setSupplierId(undefined);
            setShowInactive(false);
          }}
        />
      )}

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        serverSide
        totalRows={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        sorting={sorting}
        onSortingChange={setSorting}
        caption="Products list"
        emptyTitle="No products found"
        emptyDescription={
          activeFilters.length > 0
            ? "Try adjusting your filters."
            : "Add your first product to get started."
        }
        showColumnToggle
      />

      {/* Create / Edit dialog */}
      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditingProduct(null); }}
        product={editingProduct}
      />

      {/* Delete confirmation */}
      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}
        itemName={deleteTarget?.name}
        loading={deleteMutation.isPending}
        onConfirm={async () => {
          if (deleteTarget) await deleteMutation.mutateAsync(deleteTarget.id);
        }}
      />
    </PageContainer>
  );
}
