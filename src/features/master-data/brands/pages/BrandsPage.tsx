"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, RotateCcw, ExternalLink } from "lucide-react";
import { useBrands, useDeleteBrand, useRestoreBrand } from "../../hooks/use-brands";
import { BrandFormDialog } from "../components/BrandFormDialog";
import { Button } from "@/app/components/ui/button";
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
} from "@/components/common";
import type { ColumnDef } from "@/components/common/data-table";
import { formatDate } from "@/utils/format";
import { useDebounce } from "@/hooks/use-debounce";
import type { Brand } from "../../types";

export function BrandsPage() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [search, setSearch] = React.useState("");
  const [showInactive, setShowInactive] = React.useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingBrand, setEditingBrand] = React.useState<Brand | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Brand | null>(null);

  const { data, isLoading, error, refetch } = useBrands({
    page,
    page_size: pageSize,
    search: debouncedSearch || undefined,
    is_active: showInactive ? undefined : true,
    ordering: "name",
  });

  const deleteMutation = useDeleteBrand();
  const restoreMutation = useRestoreBrand();

  const columns: ColumnDef<Brand>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{row.original.name}</span>
          {row.original.website_url && (
            <a
              href={row.original.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
              aria-label={`Visit ${row.original.name} website`}
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          )}
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="max-w-xs truncate text-sm text-muted-foreground">
          {row.original.description || "—"}
        </span>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => <StatusBadge variant={row.original.is_active ? "active" : "inactive"} dot />,
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.original.createdAt)}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <PermissionGuard permission="brands.edit">
            {row.original.is_active ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setEditingBrand(row.original); setDialogOpen(true); }}
                aria-label={`Edit ${row.original.name}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => restoreMutation.mutate(row.original.id)}
                disabled={restoreMutation.isPending}
                aria-label={`Restore ${row.original.name}`}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </PermissionGuard>
          <PermissionGuard permission="brands.delete">
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
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Brands"
        description="Manage product brands."
        breadcrumb={
          <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Brands" }]} />
        }
        actions={
          <PermissionGuard permission="brands.create">
            <Button onClick={() => { setEditingBrand(null); setDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              New Brand
            </Button>
          </PermissionGuard>
        }
      />

      <Toolbar>
        <ToolbarLeft>
          <SearchInput
            placeholder="Search brands…"
            value={search}
            onChange={setSearch}
            aria-label="Search brands"
            className="w-64"
          />
        </ToolbarLeft>
        <ToolbarRight>
          <Button variant="outline" size="sm" onClick={() => setShowInactive((v) => !v)}>
            {showInactive ? "Hide Inactive" : "Show Inactive"}
          </Button>
        </ToolbarRight>
      </Toolbar>

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
      />

      <BrandFormDialog
        open={dialogOpen}
        onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditingBrand(null); }}
        brand={editingBrand}
      />

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
