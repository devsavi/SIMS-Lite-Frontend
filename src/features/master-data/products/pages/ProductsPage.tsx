"use client";

/**
 * ProductsPage — full CRUD list page for products.
 * Supports server-side search, filtering by category/brand/supplier, pagination.
 * Includes barcode download, Excel import/export template, and image management.
 */

import * as React from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Upload,
  FileSpreadsheet,
  Barcode,
  RefreshCw,
} from "lucide-react";
import { type SortingState, type VisibilityState } from "@tanstack/react-table";
import {
  useProducts,
  useDeleteProduct,
  useDownloadBarcode,
  useDownloadImportTemplate,
  useBulkImportProducts,
} from "../../hooks/use-products";
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
  DataTable,
  SearchInput,
  Toolbar,
  ToolbarLeft,
  ToolbarRight,
  StatusBadge,
  DeleteDialog,
  PermissionGuard,
  FilterBar,
  RowActionsMenu,
  RowActionsMenuItem,
} from "@/components/common";
import type { ColumnDef } from "@/components/common/data-table";
import { formatDate, formatCurrency } from "@/utils/format";
import { useDebounce } from "@/hooks/use-debounce";
import type { Product, Category, Brand, Supplier } from "../../types";

/** Trigger a blob download in the browser. */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  // ---- Auth / Role ----
  const { role } = useAuthStore();
  const isAdmin = role === "admin";

  // ---- Dialog state ----
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Product | null>(null);

  // ---- Column visibility: SKU and Status hidden by default ----
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({ sku: false, is_active: false });

  // ---- Import file ref ----
  const importInputRef = React.useRef<HTMLInputElement>(null);

  // Automatically open dialog if query param create=true
  React.useEffect(() => {
    if (searchParams.get("create") === "true") {
      setEditingProduct(null);
      setDialogOpen(true);
    }
  }, [searchParams]);

  // Derive server-side ordering string
  const ordering = sorting.length > 0
    ? `${sorting[0].desc ? "-" : ""}${sorting[0].id}`
    : "name";

  // ---- Queries ----
  const { data, isLoading, error, refetch, isRefetching } = useProducts({
    page,
    size: pageSize,
    search: debouncedSearch || undefined,
    active_only: showInactive ? undefined : true,
    ordering,
    category_id: categoryId,
    brand_id: brandId,
    supplier_id: supplierId,
  });

  const { data: categoriesData } = useCategories({ page: 1, page_size: 100, is_active: true });
  const { data: brandsData } = useBrands({ page: 1, page_size: 100, is_active: true });
  const { data: suppliersData } = useSuppliers({ page: 1, page_size: 100, is_active: true });

  const deleteMutation = useDeleteProduct();
  const downloadBarcode = useDownloadBarcode();
  const downloadTemplate = useDownloadImportTemplate();
  const bulkImport = useBulkImportProducts();

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

  // ---- Handlers ----
  async function handleDownloadBarcode(product: Product) {
    const blob = await downloadBarcode.mutateAsync(product.id);
    downloadBlob(blob, `barcode-${product.sku}.png`);
  }

  async function handleDownloadTemplate() {
    const blob = await downloadTemplate.mutateAsync();
    downloadBlob(blob, "products-import-template.xlsx");
  }

  function handleImportClick() {
    importInputRef.current?.click();
  }

  async function handleImportFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await bulkImport.mutateAsync(file);
    // reset so the same file can be re-selected
    e.target.value = "";
  }

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
      size: 150,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">{row.original.name}</p>
          {row.original.short_description && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {row.original.short_description}
            </p>
          )}
        </div>
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
      id: "cost_price",
      accessorKey: "cost_price",
      header: "Cost",
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">
          {formatCurrency(row.original.cost_price)}
        </span>
      ),
      size: 100,
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
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.original.created_at)}</span>
      ),
      size: 120,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <PermissionGuard permission="products.view">
            <button
              type="button"
              onClick={() => router.push(`/products/${row.original.id}`)}
              title="View details"
              aria-label={`View ${row.original.name}`}
              className="rounded-none p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Eye className="h-4 w-4" />
            </button>
          </PermissionGuard>
          <PermissionGuard permission="products.edit">
            <button
              type="button"
              onClick={() => { setEditingProduct(row.original); setDialogOpen(true); }}
              title="Edit"
              aria-label={`Edit ${row.original.name}`}
              className="rounded-none p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          </PermissionGuard>
          <RowActionsMenu label={`More actions for ${row.original.name}`}>
            <RowActionsMenuItem
              icon={<Barcode className="h-3.5 w-3.5" />}
              onClick={() => handleDownloadBarcode(row.original)}
              disabled={downloadBarcode.isPending}
            >
              Download Barcode
            </RowActionsMenuItem>
            <PermissionGuard permission="products.delete">
              {row.original.is_active && (
                <RowActionsMenuItem
                  icon={<Trash2 className="h-3.5 w-3.5" />}
                  onClick={() => setDeleteTarget(row.original)}
                  destructive
                >
                  Delete
                </RowActionsMenuItem>
              )}
            </PermissionGuard>
          </RowActionsMenu>
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
        actions={
          <div className="flex items-center gap-2">
            {/* Import template */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              disabled={downloadTemplate.isPending}
              title="Download Excel import template"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" aria-hidden="true" />
              Template
            </Button>

            {/* Bulk import — admin only */}
            {isAdmin && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleImportClick}
                  disabled={bulkImport.isPending}
                  title="Bulk import products from Excel"
                >
                  <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                  Import
                </Button>
                <input
                  ref={importInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleImportFileChange}
                  aria-label="Select Excel file for bulk import"
                />
              </>
            )}

            {/* New product — all roles with products.create permission */}
            <PermissionGuard permission="products.create">
              <Button
                onClick={() => { setEditingProduct(null); setDialogOpen(true); }}
              >
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                New Product
              </Button>
            </PermissionGuard>
          </div>
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
          <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
              title="Refresh products"
              aria-label="Refresh products"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} aria-hidden="true" />
              Refresh
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
        totalRows={data?.pagination?.total ?? 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        sorting={sorting}
        onSortingChange={setSorting}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={(updater) =>
          setColumnVisibility((prev) =>
            typeof updater === "function" ? updater(prev) : updater
          )
        }
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
