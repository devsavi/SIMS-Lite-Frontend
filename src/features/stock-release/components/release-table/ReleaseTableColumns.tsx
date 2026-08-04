import * as React from "react";
import Link from "next/link";
import { Eye, Edit2, Send, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { RowActionsMenu, RowActionsMenuItem } from "@/components/common";
import { StockReleaseStatusBadge } from "../release-status/StockReleaseStatusBadge";
import {
  canEditRelease,
  canDeleteRelease,
  canSubmitRelease,
  canApproveRelease,
  canCancelRelease,
  getPurposeLabel,
} from "../../utils/stock-release-utils";
import type { ColumnDef } from "@/components/common/data-table";
import type { StockReleaseSummary } from "../../types/stock-release-types";
import type { UserRole } from "@/lib/auth";

export interface GetReleaseTableColumnsOptions {
  userRole?: UserRole;
  onEdit?: (release: StockReleaseSummary) => void;
  onSubmit?: (release: StockReleaseSummary) => void;
  onApprove?: (release: StockReleaseSummary) => void;
  onCancel?: (release: StockReleaseSummary) => void;
  onDelete?: (release: StockReleaseSummary) => void;
}

export function getReleaseTableColumns({
  userRole,
  onEdit,
  onSubmit,
  onApprove,
  onCancel,
  onDelete,
}: GetReleaseTableColumnsOptions = {}): ColumnDef<StockReleaseSummary>[] {
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
          <span className="text-xs text-foreground">
            {new Date(val).toLocaleDateString()}
          </span>
        );
      },
    },
    {
      accessorKey: "purpose",
      header: "Purpose",
      cell: ({ row }) => (
        <span className="text-xs text-foreground">
          {getPurposeLabel(row.getValue("purpose") as string)}
        </span>
      ),
    },
    {
      accessorKey: "created_by",
      header: "Created By",
      cell: ({ row }) => {
        const actor = row.original.created_by;
        if (!actor) return <span className="text-muted-foreground text-xs">—</span>;
        const fullName = `${actor.first_name} ${actor.last_name}`.trim();
        return (
          <div className="flex flex-col text-xs">
            <span className="font-medium text-foreground">{fullName}</span>
            {actor.email && (
              <span className="text-[11px] text-muted-foreground">{actor.email}</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "item_count",
      header: "Items",
      cell: ({ row }) => {
        const count = row.original.item_count ?? 0;
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-none text-xs font-mono font-medium bg-muted">
            {count}
          </span>
        );
      },
    },
    {
      accessorKey: "total_quantity",
      header: "Total Qty",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-foreground">
          {row.original.total_quantity ?? 0}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StockReleaseStatusBadge status={row.getValue("status") as string} />
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const release = row.original;
        const status = release.status;

        const editable = canEditRelease(status, userRole);
        const deletable = canDeleteRelease(status, userRole);
        const submittable = canSubmitRelease(status, userRole);
        const approvable = canApproveRelease(status, userRole);
        const cancellable = canCancelRelease(status, userRole);

        const hasOverflow =
          (submittable && onSubmit) ||
          (approvable && onApprove) ||
          (cancellable && onCancel) ||
          (deletable && onDelete);

        return (
          <div className="flex items-center justify-end gap-1">
            {/* View — always visible */}
            <Link
              href={`/stock-release/${release.id}`}
              title="View details"
              aria-label={`View ${release.release_number}`}
              className="rounded-none p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Eye className="h-4 w-4" />
            </Link>

            {/* Edit — only for draft */}
            {editable && onEdit && (
              <button
                type="button"
                onClick={() => onEdit(release)}
                title="Edit draft"
                aria-label={`Edit ${release.release_number}`}
                className="rounded-none p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}

            {/* Overflow — workflow + destructive actions */}
            {hasOverflow && (
              <RowActionsMenu label={`More actions for ${release.release_number}`}>
                {submittable && onSubmit && (
                  <RowActionsMenuItem
                    icon={<Send className="h-3.5 w-3.5" />}
                    onClick={() => onSubmit(release)}
                  >
                    Submit for Approval
                  </RowActionsMenuItem>
                )}

                {approvable && onApprove && (
                  <RowActionsMenuItem
                    icon={<CheckCircle className="h-3.5 w-3.5" />}
                    onClick={() => onApprove(release)}
                  >
                    Approve Release
                  </RowActionsMenuItem>
                )}

                {cancellable && onCancel && (
                  <RowActionsMenuItem
                    icon={<XCircle className="h-3.5 w-3.5" />}
                    onClick={() => onCancel(release)}
                    destructive
                  >
                    Cancel Release
                  </RowActionsMenuItem>
                )}

                {deletable && onDelete && (
                  <RowActionsMenuItem
                    icon={<Trash2 className="h-3.5 w-3.5" />}
                    onClick={() => onDelete(release)}
                    destructive
                  >
                    Delete Draft
                  </RowActionsMenuItem>
                )}
              </RowActionsMenu>
            )}
          </div>
        );
      },
    },
  ];
}
