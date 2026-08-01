"use client";

import * as React from "react";
import { Plus, Edit2, Trash2, RotateCcw } from "lucide-react";
import { useUoms, useDeleteUom, useRestoreUom } from "../../hooks/use-uoms";
import { UomFormDialog } from "../components/UomFormDialog";
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
import type { UnitOfMeasure } from "../../types";

export function UomsPage() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [search, setSearch] = React.useState("");
  const [showInactive, setShowInactive] = React.useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingUom, setEditingUom] = React.useState<UnitOfMeasure | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<UnitOfMeasure | null>(null);

  const { data, isLoading, error, refetch } = useUoms({
    page,
    page_size: pageSize,
    search: debouncedSearch || undefined,
    is_active: showInactive ? undefined : true,
    ordering: "name",
  });

  const deleteMutation = useDeleteUom();
  const restoreMutation = useRestoreUom();

  const columns: ColumnDef<UnitOfMeasure>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <span className="font-medium text-foreground">{row.original.name}</span>,
    },
    {
      accessorKey: "symbol",
      header: "Symbol",
      cell: ({ row }) => (
        <code className="rounded-none bg-muted px-1.5 py-0.5 text-sm font-mono">
          {row.original.symbol}
        </code>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.description || "—"}</span>
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
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <PermissionGuard permission="products.edit">
            <button
              type="button"
              onClick={() => { setEditingUom(row.original); setDialogOpen(true); }}
              title="Edit"
              aria-label={`Edit ${row.original.name}`}
              className="rounded-none p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          </PermissionGuard>
          <RowActionsMenu label={`More actions for ${row.original.name}`}>
            {!row.original.is_active && (
              <PermissionGuard permission="products.edit">
                <RowActionsMenuItem
                  icon={<RotateCcw className="h-3.5 w-3.5" />}
                  onClick={() => restoreMutation.mutate(row.original.id)}
                  disabled={restoreMutation.isPending}
                >
                  Restore
                </RowActionsMenuItem>
              </PermissionGuard>
            )}
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
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Units of Measure"
        description="Manage units used for product quantities."
        actions={
          <PermissionGuard permission="products.create">
            <Button onClick={() => { setEditingUom(null); setDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              New Unit
            </Button>
          </PermissionGuard>
        }
      />

      <Toolbar>
        <ToolbarLeft>
          <SearchInput
            placeholder="Search units…"
            value={search}
            onChange={setSearch}
            aria-label="Search units of measure"
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
        totalRows={data?.pagination?.total ?? 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
      />

      <UomFormDialog
        open={dialogOpen}
        onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditingUom(null); }}
        uom={editingUom}
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
