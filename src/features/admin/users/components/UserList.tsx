"use client";

import React from "react";
import { createPortal } from "react-dom";
import {
  MoreVertical,
  Shield,
  KeyRound,
  Eye,
  Edit2,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  Search,
  Trash2,
} from "lucide-react";
import { ROLE_LABELS, type UserRole } from "@/lib/auth";
import type { UserItem, UserStatus, UserFilterParams } from "../types";
import { getRoleBadgeClass, getStatusBadgeClass, formatDateTime } from "../utils/user-helpers";
import { cn } from "@/utils/cn";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

/** Renders a dropdown menu via a portal so it escapes any overflow/scroll containers. */
function DropdownPortal({
  anchorRef,
  onClose,
  children,
}: {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [coords, setCoords] = React.useState<{ top: number; right: number } | null>(null);

  React.useLayoutEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
  }, [anchorRef]);

  // Close on scroll or resize
  React.useEffect(() => {
    const close = () => onClose();
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [onClose]);

  if (!coords) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 w-44 rounded-none border border-border bg-popover p-1 shadow-md text-popover-foreground text-xs"
        style={{ top: coords.top, right: coords.right }}
      >
        {children}
      </div>
    </>,
    document.body,
  );
}

interface UserListProps {
  users: UserItem[];
  isLoading: boolean;
  total: number;
  page: number;
  totalPages: number;
  filters: UserFilterParams;
  onFilterChange: (newFilters: UserFilterParams) => void;
  onViewDetails: (user: UserItem) => void;
  onEditUser: (user: UserItem) => void;
  onAssignRole: (user: UserItem) => void;
  onResetPassword: (user: UserItem) => void;
  onToggleStatus: (user: UserItem) => void;
  onDeleteUser: (userId: string) => void;
}

export function UserList({
  users,
  isLoading,
  total,
  page,
  totalPages,
  filters,
  onFilterChange,
  onViewDetails,
  onEditUser,
  onAssignRole,
  onResetPassword,
  onToggleStatus,
  onDeleteUser,
}: UserListProps) {
  const [openDropdownId, setOpenDropdownId] = React.useState<string | null>(null);
  const buttonRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value, page: 1 });
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users by name, email or department..."
            value={filters.search || ""}
            onChange={handleSearchChange}
            className="w-full rounded-none border border-input bg-background pl-9 pr-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Role Filter */}
          <Select
            value={filters.role || "ALL"}
            onValueChange={(v) => onFilterChange({ ...filters, role: v === "ALL" ? undefined : v as any, page: 1 })}
          >
            <SelectTrigger className="h-9 w-36 text-sm" aria-label="Filter by role">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="officer">Officer</SelectItem>
              <SelectItem value="store_keeper">Store Keeper</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={filters.status || "ALL"}
            onValueChange={(v) => onFilterChange({ ...filters, status: v === "ALL" ? undefined : v as UserStatus, page: 1 })}
          >
            <SelectTrigger className="h-9 w-36 text-sm" aria-label="Filter by status">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-none border border-border bg-card shadow-sm">
        <table className="w-full text-left text-sm text-foreground">
          <thead className="bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
            <tr>
              <th scope="col" className="px-4 py-3">Name & Email</th>
              <th scope="col" className="px-4 py-3">Role</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3">Last Login</th>
              <th scope="col" className="px-4 py-3">Created Date</th>
              <th scope="col" className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-4 py-3">
                    <div className="h-4 w-36 rounded-none bg-muted"></div>
                    <div className="mt-1 h-3 w-48 rounded-none bg-muted/60"></div>
                  </td>
                  <td className="px-4 py-3"><div className="h-5 w-24 rounded-none bg-muted"></div></td>
                  <td className="px-4 py-3"><div className="h-5 w-16 rounded-none bg-muted"></div></td>
                  <td className="px-4 py-3"><div className="h-4 w-28 rounded-none bg-muted"></div></td>
                  <td className="px-4 py-3"><div className="h-4 w-24 rounded-none bg-muted"></div></td>
                  <td className="px-4 py-3 text-right"><div className="ml-auto h-6 w-8 rounded-none bg-muted"></div></td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No users found matching the selected criteria.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center rounded-none border px-2.5 py-0.5 text-xs font-semibold", getRoleBadgeClass(user.role))}>
                      {ROLE_LABELS[user.role] || user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center rounded-none border px-2.5 py-0.5 text-xs font-medium", getStatusBadgeClass(user.status))}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDateTime(user.lastLogin)}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDateTime(user.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onViewDetails(user)}
                        title="View Details"
                        aria-label={`View details for ${user.name}`}
                        className="rounded-none p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditUser(user)}
                        title="Edit User"
                        aria-label={`Edit ${user.name}`}
                        className="rounded-none p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      {/* Dropdown Menu Toggle */}
                      <div className="relative">
                        <button
                          type="button"
                          ref={(el) => { buttonRefs.current[user.id] = el; }}
                          onClick={() => setOpenDropdownId(openDropdownId === user.id ? null : user.id)}
                          aria-label={`More actions for ${user.name}`}
                          className="rounded-none p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {openDropdownId === user.id && (
                          <DropdownPortal
                            anchorRef={{ current: buttonRefs.current[user.id] ?? null }}
                            onClose={() => setOpenDropdownId(null)}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setOpenDropdownId(null);
                                onAssignRole(user);
                              }}
                              className="flex w-full items-center gap-2 rounded-none px-2 py-1.5 hover:bg-accent hover:text-accent-foreground"
                            >
                              <Shield className="h-3.5 w-3.5" />
                              Assign Role
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenDropdownId(null);
                                onResetPassword(user);
                              }}
                              className="flex w-full items-center gap-2 rounded-none px-2 py-1.5 hover:bg-accent hover:text-accent-foreground"
                            >
                              <KeyRound className="h-3.5 w-3.5" />
                              Reset Password
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenDropdownId(null);
                                onToggleStatus(user);
                              }}
                              className="flex w-full items-center gap-2 rounded-none px-2 py-1.5 text-destructive hover:bg-destructive/10"
                            >
                              {user.status === "ACTIVE" ? (
                                <>
                                  <XCircle className="h-3.5 w-3.5" />
                                  Deactivate User
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Activate User
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenDropdownId(null);
                                onDeleteUser(user.id);
                              }}
                              className="flex w-full items-center gap-2 rounded-none px-2 py-1.5 text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete User
                            </button>
                          </DropdownPortal>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
        <div>
          Showing {users.length > 0 ? (page - 1) * (filters.limit || 10) + 1 : 0} to{" "}
          {Math.min(page * (filters.limit || 10), total)} of {total} users
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onFilterChange({ ...filters, page: page - 1 })}
            className="rounded-none border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages || 1}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onFilterChange({ ...filters, page: page + 1 })}
            className="rounded-none border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
