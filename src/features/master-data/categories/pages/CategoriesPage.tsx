"use client";

/**
 * CategoriesPage — full CRUD list page for product categories.
 */

import * as React from "react";
import { Plus, Edit2, Trash2, RotateCcw, RefreshCw } from "lucide-react";
import { type VisibilityState } from "@tanstack/react-table";
import { useAuthStore } from "@/stores/auth.store";
import { canAccess } from "@/lib/auth/permissions";
import { useCategories, useDeleteCategory, useRestoreCategory } from "../../hooks/use-categories";
import { CategoryFormDialog } from "../components/CategoryFormDialog";
import { Button } from "@/app/components/ui/button";
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
  RowActionsMenu,
  RowActionsMenuItem,
} from "@/components/common";
import type { ColumnDef } from "@/components/common/data-table";
import { formatDate } from "@/utils/format";
import { useDebounce } from "@/hooks/use-debounce";
import type { Category } from "../../types";

export function CategoriesPage() {
  // ---- Auth / Role ----
  const { role } = useAuthStore();

  // ---- State ----
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [search, setSearch] = React.useState("");
  const [showInactive, setShowInactive] = React.useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Category | null>(null);

  // ---- Column visibility: Parent and Status hidden by default ----
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({ parent: false, is_active: false });

  // ---- Query ----
  const { data, isLoading, error, refetch, isRefetching } = useCategories({
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
      header: () => <div className="text-right">Actions</div>,
      enableHiding: false,
      cell: ({ row }) => {
        const canEdit = canAccess(role, "categories.edit");
        const canDelete = canAccess(role, "categories.delete");

        const hasRestore = !row.original.is_active && canEdit;
        const hasDelete = row.original.is_active && canDelete;
        const hasMenuOptions = hasRestore || hasDelete;

        return (
          <div className="flex items-center justify-end gap-1">
            <PermissionGuard permission="categories.edit">
              <button
                type="button"
                onClick={() => { setEditingCategory(row.original); setDialogOpen(true); }}
                title="Edit"
                aria-label={`Edit ${row.original.name}`}
                className="rounded-none p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </PermissionGuard>
            {hasMenuOptions && (
              <RowActionsMenu label={`More actions for ${row.original.name}`}>
                {hasRestore && (
                  <RowActionsMenuItem
                    icon={<RotateCcw className="h-3.5 w-3.5" />}
                    onClick={() => restoreMutation.mutate(row.original.id)}
                    disabled={restoreMutation.isPending}
                  >
                    Restore
                  </RowActionsMenuItem>
                )}
                {hasDelete && (
                  <RowActionsMenuItem
                    icon={<Trash2 className="h-3.5 w-3.5" />}
                    onClick={() => setDeleteTarget(row.original)}
                    destructive
                  >
                    Delete
                  </RowActionsMenuItem>
                )}
              </RowActionsMenu>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Categories"
        description="Manage product categories and hierarchy."
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            title="Refresh categories"
            aria-label="Refresh categories"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} aria-hidden="true" />
            Refresh
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
        totalRows={data?.pagination?.total ?? 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={(updater) =>
          setColumnVisibility((prev) =>
            typeof updater === "function" ? updater(prev) : updater
          )
        }
        showColumnToggle
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
