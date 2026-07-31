import { get, post, put, patch, del } from "@/lib/api/client";
import type { UserRole } from "@/lib/auth";
import type {
  UserItem,
  UserDetailItem,
  UserFilterParams,
  CreateUserDTO,
  UpdateUserDTO,
  ResetPasswordDTO,
  AssignRoleDTO,
  Role,
} from "../types";
import type { ActivityLogFilters, ActivityLogResponse } from "@/features/profile/types";

const ROLE_NAME_MAP: Record<string, UserRole> = {
  ADMIN: "admin",
  OFFICER: "officer",
  STORE_KEEPER: "store_keeper",
};

function normalizeRoleName(raw?: string): UserRole {
  if (!raw) return "officer";
  const upper = raw.toUpperCase().replace(/[^A-Z_]/g, "_");
  return ROLE_NAME_MAP[upper] ?? (raw.toLowerCase() as UserRole);
}

function mapBackendUserToUserItem(u: any): UserItem {
  const rawRole = u.roles?.[0]?.name || "OFFICER";
  const role = normalizeRoleName(rawRole);
  const name = u.full_name || `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email;
  return {
    id: u.id,
    name,
    email: u.email,
    role,
    status: u.is_active ? "ACTIVE" : "INACTIVE",
    lastLogin: u.last_login,
    createdAt: u.created_at,
    updatedAt: u.updated_at,
    avatarUrl: u.avatar_url || undefined,
    department: u.department || u.team || undefined,
    phone: u.phone || undefined,
  };
}


export interface UsersResponse {
  data: UserItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const adminUsersApi = {
  getUsers: async (params?: UserFilterParams): Promise<UsersResponse> => {
    let active_only: boolean | undefined = undefined;
    if (params?.status === "ACTIVE") active_only = true;
    if (params?.status === "INACTIVE") active_only = false;

    const query: Record<string, any> = {
      page: params?.page ?? 1,
      size: params?.limit ?? 10,
    };
    if (active_only !== undefined) {
      query.active_only = active_only;
    }
    if (params?.search) {
      query.search = params.search;
    }

    const response = await get<any>("/users/", { params: query });

    // The backend may return either:
    // Shape A (inventory-style): { data: [...], pagination: { page, size, total, pages } }
    // Shape B (master-data-style): { status, data: [...], total, page, page_size, total_pages }
    const rawList = Array.isArray(response?.data) ? response.data : [];
    const pagination = response?.pagination;

    return {
      data: rawList.map(mapBackendUserToUserItem),
      total: pagination?.total ?? response?.total ?? rawList.length,
      page: pagination?.page ?? response?.page ?? 1,
      limit: pagination?.size ?? response?.page_size ?? params?.limit ?? 10,
      totalPages: pagination?.pages ?? response?.total_pages ?? 1,
    };
  },

  getUserById: async (id: string): Promise<UserDetailItem> => {
    const response = await get<any>(`/users/${id}`);
    const rawUser = response?.data || response;
    const mapped = mapBackendUserToUserItem(rawUser);
    return {
      ...mapped,
      activities: [],
      notifications: [],
      permissions: rawUser.roles?.[0]?.permissions?.map((p: any) => p.name) || [],
    };
  },

  createUser: async (payload: CreateUserDTO): Promise<UserItem> => {
    const body = {
      email: payload.email,
      password: payload.password,
      first_name: payload.first_name,
      last_name: payload.last_name,
      phone: payload.phone,
      is_active: payload.is_active,
      is_verified: payload.is_verified,
      role_ids: payload.role_ids,
    };
    const response = await post<any>("/users/", body);
    const rawUser = response?.data || response;
    return mapBackendUserToUserItem(rawUser);
  },

  updateUser: async (id: string, payload: UpdateUserDTO): Promise<UserItem> => {
    const body = {
      first_name: payload.first_name,
      last_name: payload.last_name,
      phone: payload.phone,
      is_active: payload.is_active,
      is_verified: payload.is_verified,
    };
    const response = await put<any>(`/users/${id}`, body);
    const rawUser = response?.data || response;
    return mapBackendUserToUserItem(rawUser);
  },

  toggleUserStatus: async (id: string, status: "ACTIVE" | "INACTIVE"): Promise<UserItem> => {
    const response = status === "ACTIVE"
      ? await post<any>(`/users/${id}/activate`)
      : await post<any>(`/users/${id}/deactivate`);
    const rawUser = response?.data || response;
    return mapBackendUserToUserItem(rawUser);
  },

  resetPassword: async (payload: ResetPasswordDTO): Promise<{ message: string }> => {
    const { userId, ...body } = payload;
    return await post<{ message: string }>(`/users/${userId}/reset-password`, body);
  },

  assignRole: async (userId: string, roleIds: string[]): Promise<void> => {
    await put<void>(`/users/${userId}/roles`, { role_ids: roleIds });
  },

  deleteUser: async (id: string): Promise<void> => {
    await del<void>(`/users/${id}`);
  },

  getRoles: async (): Promise<Role[]> => {
    try {
      const response = await get<{ status: string; data: Role[] }>("/roles/");
      return Array.isArray(response?.data) ? response.data : [];
    } catch {
      return [
        {
          id: "bd77f00e-512b-4831-9e32-e4fbc347a491",
          name: "ADMIN",
          description: "Full system access. Can manage users, roles, and all data.",
          is_system: true,
        },
        {
          id: "2c8af070-b1df-45b6-b4e1-9c3dfb8120e7",
          name: "OFFICER",
          description: "Academic officer with read/write access to records.",
          is_system: true,
        },
        {
          id: "07ef7314-2e14-480c-ab53-f3a881771a4b",
          name: "STORE_KEEPER",
          description: "Inventory and store management access.",
          is_system: true,
        },
      ];
    }
  },

  getUserAuditLogs: async (userId: string, filters: ActivityLogFilters): Promise<ActivityLogResponse> => {
    const query: Record<string, any> = {
      user_id: userId,
      page: filters.page,
      size: filters.size,
    };
    if (filters.period !== "custom") {
      query.period = filters.period;
    } else {
      if (filters.date_from) query.date_from = filters.date_from;
      if (filters.date_to) query.date_to = filters.date_to;
    }
    if (filters.action !== "all") query.action = filters.action;
    if (filters.status !== "all") query.status = filters.status;

    const res = await get<any>("/admin/audit-logs/", { params: query });
    return {
      data: Array.isArray(res?.data) ? res.data : [],
      pagination: res?.pagination ?? { page: 1, size: filters.size, total: 0, pages: 1 },
    };
  },
};
