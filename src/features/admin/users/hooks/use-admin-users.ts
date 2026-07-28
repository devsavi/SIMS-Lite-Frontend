import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminUsersApi } from "../api/admin-users-api";
import type {
  UserFilterParams,
  CreateUserDTO,
  UpdateUserDTO,
  ResetPasswordDTO,
  AssignRoleDTO,
} from "../types";

export const adminUsersKeys = {
  all: ["admin-users"] as const,
  list: (filters?: UserFilterParams) => [...adminUsersKeys.all, "list", filters] as const,
  detail: (id: string) => [...adminUsersKeys.all, "detail", id] as const,
};

export function useUsersList(filters?: UserFilterParams) {
  return useQuery({
    queryKey: adminUsersKeys.list(filters),
    queryFn: () => adminUsersApi.getUsers(filters),
    staleTime: 60 * 1000,
  });
}

export function useUserDetail(id: string | null) {
  return useQuery({
    queryKey: adminUsersKeys.detail(id || ""),
    queryFn: () => adminUsersApi.getUserById(id!),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserDTO) => adminUsersApi.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.all });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserDTO }) =>
      adminUsersApi.updateUser(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.all });
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.detail(variables.id) });
    },
  });
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "ACTIVE" | "INACTIVE" }) =>
      adminUsersApi.toggleUserStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.all });
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.detail(variables.id) });
    },
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordDTO) => adminUsersApi.resetPassword(payload),
  });
}

export function useAssignUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignRoleDTO) => adminUsersApi.assignRole(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.all });
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.detail(variables.userId) });
    },
  });
}
