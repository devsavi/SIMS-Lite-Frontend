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

const MOCK_USERS: UserItem[] = [
  {
    id: "usr-1",
    name: "System Admin",
    email: "admin@simslite.com",
    role: "admin",
    status: "ACTIVE",
    lastLogin: "2026-07-28T14:30:00Z",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-07-28T14:30:00Z",
    department: "Executive Management",
    phone: "+1 555-0101",
  },
  {
    id: "usr-2",
    name: "Michael Smith",
    email: "michael.smith@simslite.com",
    role: "officer",
    status: "ACTIVE",
    lastLogin: "2026-07-27T16:45:00Z",
    createdAt: "2026-03-01T11:20:00Z",
    updatedAt: "2026-07-27T16:45:00Z",
    department: "Procurement",
    phone: "+1 555-0103",
  },
  {
    id: "usr-3",
    name: "Sarah Jenkins",
    email: "sarah.j@simslite.com",
    role: "store_keeper",
    status: "ACTIVE",
    lastLogin: "2026-07-28T08:00:00Z",
    createdAt: "2026-03-10T14:10:00Z",
    updatedAt: "2026-07-28T08:00:00Z",
    department: "Warehouse & Inventory",
    phone: "+1 555-0104",
  },
];

let localUsersStore = [...MOCK_USERS];

export interface UsersResponse {
  data: UserItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const adminUsersApi = {
  getUsers: async (params?: UserFilterParams): Promise<UsersResponse> => {
    try {
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

      const response = await get<any>("/users/", { params: query });
      return {
        data: Array.isArray(response?.data) ? response.data.map(mapBackendUserToUserItem) : [],
        total: response?.pagination?.total ?? 0,
        page: response?.pagination?.page ?? 1,
        limit: response?.pagination?.size ?? 10,
        totalPages: response?.pagination?.pages ?? 1,
      };
    } catch {
      // Fallback filtering over mock store
      let filtered = [...localUsersStore];

      if (params?.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            u.name.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query) ||
            (u.department && u.department.toLowerCase().includes(query))
        );
      }

      if (params?.role && params.role !== "ALL") {
        filtered = filtered.filter((u) => u.role === params.role);
      }

      if (params?.status && params.status !== "ALL") {
        filtered = filtered.filter((u) => u.status === params.status);
      }

      const page = params?.page ?? 1;
      const limit = params?.limit ?? 10;
      const total = filtered.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const startIndex = (page - 1) * limit;
      const data = filtered.slice(startIndex, startIndex + limit);

      return {
        data,
        total,
        page,
        limit,
        totalPages,
      };
    }
  },

  getUserById: async (id: string): Promise<UserDetailItem> => {
    try {
      const response = await get<any>(`/api/v1/users/${id}`);
      const rawUser = response?.data || response;
      const mapped = mapBackendUserToUserItem(rawUser);
      return {
        ...mapped,
        activities: [],
        notifications: [],
        permissions: rawUser.roles?.[0]?.permissions?.map((p: any) => p.name) || [],
      };
    } catch {
      const user = localUsersStore.find((u) => u.id === id) || localUsersStore[0];
      return {
        ...user,
        permissions: [
          "dashboard.view",
          "products.view",
          "inventory.view",
          "reports.view",
          "settings.view",
        ],
        activities: [
          {
            id: "act-1",
            action: "Logged into System",
            timestamp: user.lastLogin || new Date().toISOString(),
            ipAddress: "192.168.1.45",
          },
          {
            id: "act-2",
            action: "Updated Profile details",
            timestamp: "2026-07-27T12:00:00Z",
            ipAddress: "192.168.1.45",
          },
        ],
        notifications: [
          {
            id: "notif-1",
            title: "Security Alert",
            message: "New login detected from a new browser",
            createdAt: "2026-07-27T10:00:00Z",
            read: true,
          },
          {
            id: "notif-2",
            title: "Password Changed",
            message: "Your password was successfully updated",
            createdAt: "2026-07-20T14:20:00Z",
            read: true,
          },
        ],
      };
    }
  },

  createUser: async (payload: CreateUserDTO): Promise<UserItem> => {
    try {
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
    } catch {
      const newUser: UserItem = {
        id: `usr-${Date.now()}`,
        name: payload.name || `${payload.first_name} ${payload.last_name}`.trim(),
        email: payload.email,
        role: payload.role || "officer",
        status: payload.is_active ? "ACTIVE" : "INACTIVE",
        lastLogin: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        department: payload.department || "General",
        phone: payload.phone || "",
      };
      localUsersStore.unshift(newUser);
      return newUser;
    }
  },

  updateUser: async (id: string, payload: UpdateUserDTO): Promise<UserItem> => {
    try {
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
    } catch {
      localUsersStore = localUsersStore.map((u) =>
        u.id === id
          ? {
              ...u,
              name: payload.name || u.name,
              email: payload.email || u.email,
              role: payload.role || u.role,
              status: payload.status || u.status,
              department: payload.department || u.department,
              phone: payload.phone || u.phone,
              updatedAt: new Date().toISOString(),
            }
          : u
      );
      const updated = localUsersStore.find((u) => u.id === id);
      if (!updated) throw new Error("User not found");
      return updated;
    }
  },

  toggleUserStatus: async (id: string, status: "ACTIVE" | "INACTIVE"): Promise<UserItem> => {
    try {
      const response = status === "ACTIVE"
        ? await post<any>(`/users/${id}/activate`)
        : await post<any>(`/users/${id}/deactivate`);
      const rawUser = response?.data || response;
      return mapBackendUserToUserItem(rawUser);
    } catch {
      localUsersStore = localUsersStore.map((u) =>
        u.id === id
          ? {
              ...u,
              status,
              updatedAt: new Date().toISOString(),
            }
          : u
      );
      const updated = localUsersStore.find((u) => u.id === id);
      if (!updated) throw new Error("User not found");
      return updated;
    }
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
    try {
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
    } catch {
      return {
        data: [
          {
            id: "audit-mock-1",
            actor_id: userId,
            action: "auth.login",
            resource_type: "user",
            resource_id: userId,
            ip_address: "192.168.1.45",
            status: "success",
            detail: { message: "User logged in successfully" },
            created_at: new Date().toISOString(),
          },
        ],
        pagination: { page: 1, size: filters.size, total: 1, pages: 1 },
      };
    }
  },
};
;
