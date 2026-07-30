"use client";

import React from "react";
import { UserPlus, Users as UsersIcon } from "lucide-react";
import { PermissionGuard } from "../../shared/components/PermissionGuard";
import { UserList } from "../components/UserList";
import { UserFormDialog } from "../components/UserFormDialog";
import { UserDetailsModal } from "../components/UserDetailsModal";
import { UserRoleModal } from "../components/UserRoleModal";
import { ResetPasswordModal } from "../components/ResetPasswordModal";
import { UserStatusToggle } from "../components/UserStatusToggle";
import {
  useUsersList,
  useCreateUser,
  useUpdateUser,
  useToggleUserStatus,
  useResetUserPassword,
  useAssignUserRole,
  useDeleteUser,
} from "../hooks/use-admin-users";
import type { UserItem, UserFilterParams, CreateUserDTO, UpdateUserDTO } from "../types";
import type { UserRole } from "@/lib/auth";

export function UsersPage() {
  const [filters, setFilters] = React.useState<UserFilterParams>({
    search: "",
    role: "ALL",
    status: "ALL",
    page: 1,
    limit: 10,
  });

  const { data, isLoading, refetch } = useUsersList(filters);

  // Modals state
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<UserItem | null>(null);

  const [detailsUser, setDetailsUser] = React.useState<UserItem | null>(null);

  const [roleUser, setRoleUser] = React.useState<UserItem | null>(null);

  const [resetUser, setResetUser] = React.useState<UserItem | null>(null);

  const [toggleUser, setToggleUser] = React.useState<UserItem | null>(null);

  // Mutations
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const toggleStatusMutation = useToggleUserStatus();
  const resetPasswordMutation = useResetUserPassword();
  const assignRoleMutation = useAssignUserRole();
  const deleteUserMutation = useDeleteUser();

  const handleCreateSubmit = async (data: CreateUserDTO) => {
    await createUserMutation.mutateAsync(data);
  };

  const handleUpdateSubmit = async (id: string, data: UpdateUserDTO) => {
    await updateUserMutation.mutateAsync({ id, payload: data });
  };

  const handleAssignRole = async (userId: string, roleIds: string[]) => {
    await assignRoleMutation.mutateAsync({ userId, roleIds });
  };

  const handleResetPassword = async (userId: string, autoGenerate: boolean, newPassword?: string) => {
    await resetPasswordMutation.mutateAsync({
      userId,
      auto_generate: autoGenerate,
      new_password: autoGenerate ? undefined : newPassword,
    });
  };

  const handleToggleStatus = async (userId: string, status: "ACTIVE" | "INACTIVE") => {
    await toggleStatusMutation.mutateAsync({ id: userId, status });
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      await deleteUserMutation.mutateAsync(userId);
    }
  };


  return (
    <PermissionGuard requiredPermission="users.view">
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
              <UsersIcon className="h-6 w-6 text-primary" />
              User Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage system users, role authorizations, activation statuses, and security credentials.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingUser(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-none bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <UserPlus className="h-4 w-4" />
            Add New User
          </button>
        </div>
        {/* User List Table */}
        <UserList
          users={data?.data || []}
          isLoading={isLoading}
          total={data?.total || 0}
          page={data?.page || 1}
          totalPages={data?.totalPages || 1}
          filters={filters}
          onFilterChange={setFilters}
          onViewDetails={(u) => setDetailsUser(u)}
          onEditUser={(u) => {
            setEditingUser(u);
            setIsFormOpen(true);
          }}
          onAssignRole={(u) => setRoleUser(u)}
          onResetPassword={(u) => setResetUser(u)}
          onToggleStatus={(u) => setToggleUser(u)}
          onDeleteUser={handleDeleteUser}
        />

        {/* Modals */}
        <UserFormDialog
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          user={editingUser}
          onSubmitCreate={handleCreateSubmit}
          onSubmitUpdate={handleUpdateSubmit}
          isSubmitting={createUserMutation.isPending || updateUserMutation.isPending}
        />

        <UserDetailsModal
          user={detailsUser}
          isOpen={!!detailsUser}
          onClose={() => setDetailsUser(null)}
        />

        <UserRoleModal
          user={roleUser}
          isOpen={!!roleUser}
          onClose={() => setRoleUser(null)}
          onAssignRole={handleAssignRole}
          isSubmitting={assignRoleMutation.isPending}
        />

        <ResetPasswordModal
          user={resetUser}
          isOpen={!!resetUser}
          onClose={() => setResetUser(null)}
          onResetPassword={handleResetPassword}
          isSubmitting={resetPasswordMutation.isPending}
        />

        <UserStatusToggle
          user={toggleUser}
          isOpen={!!toggleUser}
          onClose={() => setToggleUser(null)}
          onConfirm={handleToggleStatus}
          isSubmitting={toggleStatusMutation.isPending}
        />
      </div>
    </PermissionGuard>
  );
}
