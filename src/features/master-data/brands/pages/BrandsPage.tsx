"use client";

import * as React from "react";
import { Plus, Edit2, Trash2, RotateCcw, ExternalLink, RefreshCw } from "lucide-react";
import { type VisibilityState } from "@tanstack/react-table";
import { useAuthStore } from "@/stores/auth.store";
import { canAccess } from "@/lib/auth/permissions";
import { useBrands, useDeleteBrand, useRestoreBrand } from "../../hooks/use-brands";
import { BrandFormDialog } from "../components/BrandFormDialog";
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
import type { Brand } from "../../types";

export function BrandsPage() {
  const { role } = useAuthStore();
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [search, setSearch] = React.useState("");
  const [showInactive, setShowInactive] = React.useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingBrand, setEditingBrand] = React.useState<Brand | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Brand | null>(null);

  // ---- Column visibility: Status hidden by default ----
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({ is_active: false });

  const { data, isLoading, error, refetch, isRefetching } = useBrands({
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
      header: "Brand",
      cell: ({ row }) => {
        const logoUrl = row.original.logo_url;
        const websiteUrl = row.original.website_url;
        const name = row.original.name;

        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-muted overflow-hidden">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={`${name} logo`} className="h-full w-full object-contain p-1" />
              ) : (
                <span className="text-xs font-bold text-muted-foreground">
                  {name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-foreground">{name}</span>
              {websiteUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-6 px-2 py-0 w-fit text-[10px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-normal text-muted-foreground hover:text-foreground"
                  >
                    Visit Website <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        );
      },
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
      header: () => <div className="text-right">Actions</div>,
      enableHiding: false,
      cell: ({ row }) => {
        const canEdit = canAccess(role, "brands.edit");
        const canDelete = canAccess(role, "brands.delete");

        const hasRestore = !row.original.is_active && canEdit;
        const hasDelete = row.original.is_active && canDelete;
        const hasMenuOptions = hasRestore || hasDelete;

        return (
          <div className="flex items-center justify-end gap-1">
            <PermissionGuard permission="brands.edit">
              <button
                type="button"
                onClick={() => { setEditingBrand(row.original); setDialogOpen(true); }}
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
        title="Brands"
        description="Manage product brands."
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            title="Refresh brands"
            aria-label="Refresh brands"
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
