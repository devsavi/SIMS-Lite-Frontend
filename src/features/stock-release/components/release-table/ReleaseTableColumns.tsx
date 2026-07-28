import * as React from "react";
import Link from "next/link";
import { Eye, Edit3, Send, CheckCircle, XCircle, MoreHorizontal } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { StockReleaseStatusBadge } from "../release-status/StockReleaseStatusBadge";
import {
  canEditRelease,
  canSubmitRelease,
  canApproveRelease,
  canCancelRelease,
} from "../../utils/stock-release-utils";
import type { ColumnDef } from "@/components/common/data-table";
import type { StockRelease } from "../../types/stock-release-types";
import type { UserRole } from "@/lib/auth";

export interface GetReleaseTableColumnsOptions {
  userRole?: UserRole;
  onEdit?: (release: StockRelease) => void;
  onSubmit?: (release: StockRelease) => void;
  onApprove?: (release: StockRelease) => void;
  onCancel?: (release: StockRelease) => void;
}

export function getReleaseTableColumns({
  userRole,
  onEdit,
  onSubmit,
  onApprove,
  onCancel,
}: GetReleaseTableColumnsOptions = {}): ColumnDef<StockRelease>[] {
  return [
    {
      accessorKey: "release_number",
      header: "Release #",
      cell: ({ row }) => {
        const release = row.original;
        return (
          <Link
            href={`/stock-release/${release.id}`}
            className="font-mono text-xs font-semibold text-primary hover:underline"
          >
            {release.release_number || `REL-${release.id.substring(0, 8)}`}
          </Link>
        );
      },
    },
    {
      accessorKey: "release_date",
      header: "Release Date",
      cell: ({ row }) => {
        const val = row.getValue("release_date") as string;
        if (!val) return <span className="text-muted-foreground text-xs">—</span>;
        return (
          <span className="text-xs text-foreground font-medium">
            {new Date(val).toLocaleDateString()}
          </span>
        );
      },
    },
    {
      accessorKey: "requested_by",
      header: "Requested By",
      cell: ({ row }) => {
        const release = row.original;
        const name =
          release.requested_by_user?.full_name ||
          release.created_by_user?.full_name ||
          release.requested_by ||
          release.created_by ||
          "System";

        return (
          <div className="flex flex-col text-xs">
            <span className="font-medium text-foreground">{name}</span>
            {release.requested_by_user?.email && (
              <span className="text-[11px] text-muted-foreground">
                {release.requested_by_user.email}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "approved_by",
      header: "Approved By",
      cell: ({ row }) => {
        const release = row.original;
        const name =
          release.approved_by_user?.full_name || release.approved_by;

        if (!name) return <span className="text-muted-foreground text-xs">—</span>;

        return (
          <div className="flex flex-col text-xs">
            <span className="font-medium text-emerald-700 dark:text-emerald-400">
              {name}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "total_items",
      header: "Total Items",
      cell: ({ row }) => {
        const items = row.original.items || [];
        const count = row.original.total_items ?? items.length;
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-none text-xs font-mono font-medium bg-muted">
            {count} {count === 1 ? "item" : "items"}
          </span>
        );
      },
    },
    {
      accessorKey: "total_quantity",
      header: "Released Qty",
      cell: ({ row }) => {
        const items = row.original.items || [];
        const qty =
          row.original.total_quantity ??
          items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);

        return (
          <span className="font-mono text-xs font-semibold text-foreground">
            {qty}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return <StockReleaseStatusBadge status={status} />;
      },
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => {
        const notes = row.getValue("notes") as string;
        if (!notes) return <span className="text-muted-foreground text-xs">—</span>;
        return (
          <span className="text-xs text-muted-foreground truncate max-w-44 block">
            {notes}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const release = row.original;
        const status = release.status;

        const editable = canEditRelease(status, userRole);
        const submittable = canSubmitRelease(status, userRole);
        const approvable = canApproveRelease(status, userRole);
        const cancellable = canCancelRelease(status, userRole);

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label={`Actions for release ${release.release_number}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem asChild>
                <Link
                  href={`/stock-release/${release.id}`}
                  className="flex items-center gap-2 text-xs"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>View Details</span>
                </Link>
              </DropdownMenuItem>

              {editable && onEdit && (
                <DropdownMenuItem
                  onClick={() => onEdit(release)}
                  className="flex items-center gap-2 text-xs"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Draft</span>
                </DropdownMenuItem>
              )}

              {submittable && onSubmit && (
                <DropdownMenuItem
                  onClick={() => onSubmit(release)}
                  className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Release</span>
                </DropdownMenuItem>
              )}

              {approvable && onApprove && (
                <DropdownMenuItem
                  onClick={() => onApprove(release)}
                  className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Approve Release</span>
                </DropdownMenuItem>
              )}

              {cancellable && onCancel && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onCancel(release)}
                    className="flex items-center gap-2 text-xs text-destructive"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Cancel Release</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
