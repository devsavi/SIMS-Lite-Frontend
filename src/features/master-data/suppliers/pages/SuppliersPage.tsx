"use client";

/**
 * SuppliersPage — full CRUD list page for suppliers.
 */

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Edit2, Trash2, RotateCcw, Eye, Mail, Phone } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { canAccess } from "@/lib/auth/permissions";
import { useSuppliers, useDeleteSupplier, useRestoreSupplier } from "../../hooks/use-suppliers";
import { SupplierFormDialog } from "../components/SupplierFormDialog";
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
import type { Supplier } from "../../types";

export function SuppliersPage() {
  const { role } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ---- State ----
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [search, setSearch] = React.useState("");
  const [showInactive, setShowInactive] = React.useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingSupplier, setEditingSupplier] = React.useState<Supplier | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Supplier | null>(null);

  // Automatically open dialog if query param create=true
  React.useEffect(() => {
    if (searchParams.get("create") === "true") {
      setEditingSupplier(null);
      setDialogOpen(true);
    }
  }, [searchParams]);

  // ---- Query ----
  const { data, isLoading, error, refetch } = useSuppliers({
    page,
    page_size: pageSize,
    search: debouncedSearch || undefined,
    is_active: showInactive ? undefined : true,
    ordering: "company_name",
  });

  const deleteMutation = useDeleteSupplier();
  const restoreMutation = useRestoreSupplier();

  // ---- Columns ----
  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: "company_name",
      header: "Company",
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.company_name}</span>
      ),
    },
    {
      accessorKey: "contact_person",
      header: "Contact",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.contact_person || "—"}
        </span>
      ),
    },
    {
      id: "contact_info",
      header: "Contact Info",
      cell: ({ row }) => {
        const { email, phone } = row.original;
        if (!email && !phone) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex flex-col gap-0.5">
            {email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-1 text-sm hover:text-primary"
                aria-label={`Email ${email}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Mail className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                <span className="truncate max-w-[180px]">{email}</span>
              </a>
            )}
            {phone && (
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-1 text-sm hover:text-primary"
                aria-label={`Call ${phone}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Phone className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                {phone}
              </a>
            )}
          </div>
        );
      },
    },
    {
      id: "location",
      header: "Location",
      cell: ({ row }) => {
        const { city, country } = row.original;
        const location = [city, country].filter(Boolean).join(", ");
        return (
          <span className="text-sm text-muted-foreground">{location || "—"}</span>
        );
      },
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
      cell: ({ row }) => {
        const canEdit = canAccess(role, "suppliers.edit");
        const canDelete = canAccess(role, "suppliers.delete");

        const hasRestore = !row.original.is_active && canEdit;
        const hasDelete = row.original.is_active && canDelete;
        const hasMenuOptions = hasRestore || hasDelete;

        return (
          <div className="flex items-center justify-end gap-1">
            <PermissionGuard permission="suppliers.view">
              <button
                type="button"
                onClick={() => router.push(`/suppliers/${row.original.id}`)}
                title="View details"
                aria-label={`View ${row.original.company_name}`}
                className="rounded-none p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Eye className="h-4 w-4" />
              </button>
            </PermissionGuard>
            <PermissionGuard permission="suppliers.edit">
              <button
                type="button"
                onClick={() => { setEditingSupplier(row.original); setDialogOpen(true); }}
                title="Edit"
                aria-label={`Edit ${row.original.company_name}`}
                className="rounded-none p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </PermissionGuard>
            {hasMenuOptions && (
              <RowActionsMenu label={`More actions for ${row.original.company_name}`}>
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
        title="Suppliers"
        description="Manage your supplier network."
        actions={
          <PermissionGuard permission="suppliers.create">
            <Button
              onClick={() => { setEditingSupplier(null); setDialogOpen(true); }}
            >
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              New Supplier
            </Button>
          </PermissionGuard>
        }
      />

      <Toolbar>
        <ToolbarLeft>
          <SearchInput
            placeholder="Search suppliers…"
            value={search}
            onChange={setSearch}
            aria-label="Search suppliers"
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
        totalRows={data?.pagination?.total ?? 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        caption="Suppliers list"
        emptyTitle="No suppliers found"
        emptyDescription="Add your first supplier to get started."
      />

      {/* Create / Edit dialog */}
      <SupplierFormDialog
        open={dialogOpen}
        onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditingSupplier(null); }}
        supplier={editingSupplier}
      />

      {/* Delete confirmation */}
      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}
        itemName={deleteTarget?.company_name}
        loading={deleteMutation.isPending}
        onConfirm={async () => {
          if (deleteTarget) await deleteMutation.mutateAsync(deleteTarget.id);
        }}
      />
    </PageContainer>
  );
}
