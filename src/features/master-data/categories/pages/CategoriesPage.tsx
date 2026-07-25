"use client";

/**
 * CategoriesPage — full CRUD list page for product categories.
 */

import * as React from "react";
import { Plus, Pencil, Trash2, RotateCcw } from "lucide-react";
import { useCategories, useDeleteCategory, useRestoreCategory } from "../../hooks/use-categories";
import { CategoryFormDialog } from "../components/CategoryFormDialog";
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
import type { Category } from "../../types";

export function CategoriesPage() {
  // ---- State ----
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [search, setSearch] = React.useState("");
  const [showInactive, setShowInactive] = React.useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Category | null>(null);

  // ---- Query ----
  const { data, isLoading, error, refetch } = useCategories({
    page,
    page_size: pageSize,
    search: debouncedSearch || undefined,
    is_active: showInactive ? undefined : true,
    ordering: "name",
  });

  const deleteMutation = useDeleteCategory();
  const restoreMutation = useRestoreCategory();

  // ---- Columns ----
  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "parent",
      header: "Parent",
      cell: ({ row }) => row.original.parent?.name ?? <span className="text-muted-foreground">—</span>,
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
      cell: ({ row }) => (
        <StatusBadge
          variant={row.original.is_active ? "active" : "inactive"}
          dot
        />
      ),
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
          <PermissionGuard permission="categories.edit">
            {row.original.is_active ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setEditingCategory(row.original); setDialogOpen(true); }}
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
          <PermissionGuard permission="categories.delete">
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
        title="Categories"
        description="Manage product categories and hierarchy."
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Categories" },
            ]}
          />
        }
        actions={
          <PermissionGuard permission="categories.create">
            <Button
              onClick={() => { setEditingCategory(null); setDialogOpen(true); }}
            >
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              New Category
            </Button>
          </PermissionGuard>
        }
      />

      <Toolbar>
        <ToolbarLeft>
          <SearchInput
            placeholder="Search categories…"
            value={search}
            onChange={setSearch}
            aria-label="Search categories"
            className="w-64"
          />
        </ToolbarLeft>
        <ToolbarRight>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInactive((v) => !v)}
          >
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

      {/* Create / Edit dialog */}
      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditingCategory(null); }}
        category={editingCategory}
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
