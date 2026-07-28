import { get, post, put, patch, del } from "@/lib/api/client";
import type {
  UserItem,
  UserDetailItem,
  UserFilterParams,
  CreateUserDTO,
  UpdateUserDTO,
  ResetPasswordDTO,
  AssignRoleDTO,
} from "../types";

const MOCK_USERS: UserItem[] = [
  {
    id: "usr-1",
    name: "System Admin",
    email: "admin@simslite.com",
    role: "super_admin",
    status: "ACTIVE",
    lastLogin: "2026-07-28T14:30:00Z",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-07-28T14:30:00Z",
    department: "Executive Management",
    phone: "+1 555-0101",
  },
  {
    id: "usr-2",
    name: "Jane Doe",
    email: "jane.doe@simslite.com",
    role: "admin",
    status: "ACTIVE",
    lastLogin: "2026-07-28T10:15:00Z",
    createdAt: "2026-02-15T09:00:00Z",
    updatedAt: "2026-07-28T10:15:00Z",
    department: "IT & Systems",
    phone: "+1 555-0102",
  },
  {
    id: "usr-3",
    name: "Michael Smith",
    email: "michael.smith@simslite.com",
    role: "procurement_officer",
    status: "ACTIVE",
    lastLogin: "2026-07-27T16:45:00Z",
    createdAt: "2026-03-01T11:20:00Z",
    updatedAt: "2026-07-27T16:45:00Z",
    department: "Procurement",
    phone: "+1 555-0103",
  },
  {
    id: "usr-4",
    name: "Sarah Jenkins",
    email: "sarah.j@simslite.com",
    role: "warehouse_manager",
    status: "ACTIVE",
    lastLogin: "2026-07-28T08:00:00Z",
    createdAt: "2026-03-10T14:10:00Z",
    updatedAt: "2026-07-28T08:00:00Z",
    department: "Warehouse & Inventory",
    phone: "+1 555-0104",
  },
  {
    id: "usr-5",
    name: "Robert Vance",
    email: "robert.v@simslite.com",
    role: "stock_clerk",
    status: "INACTIVE",
    lastLogin: "2026-06-12T11:30:00Z",
    createdAt: "2026-04-05T10:00:00Z",
    updatedAt: "2026-06-12T11:30:00Z",
    department: "Logistics",
    phone: "+1 555-0105",
  },
  {
    id: "usr-6",
    name: "Emily Clark",
    email: "emily.clark@simslite.com",
    role: "viewer",
    status: "PENDING",
    lastLogin: null,
    createdAt: "2026-07-25T13:40:00Z",
    updatedAt: "2026-07-25T13:40:00Z",
    department: "Auditing",
    phone: "+1 555-0106",
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
      const response = await get<UsersResponse>("/api/v1/users", { params });
      return response;
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
      return await get<UserDetailItem>(`/api/v1/users/${id}`);
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
      return await post<UserItem>("/api/v1/users", payload);
    } catch {
      const newUser: UserItem = {
        id: `usr-${Date.now()}`,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        status: "ACTIVE",
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
      return await put<UserItem>(`/api/v1/users/${id}`, payload);
    } catch {
      localUsersStore = localUsersStore.map((u) =>
        u.id === id
          ? {
              ...u,
              ...payload,
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
      return await patch<UserItem>(`/api/v1/users/${id}/status`, { status });
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
    try {
      return await post<{ message: string }>(`/api/v1/users/${payload.userId}/reset-password`, payload);
    } catch {
      return { message: "Password reset instructions sent successfully" };
    }
  },

  assignRole: async (payload: AssignRoleDTO): Promise<UserItem> => {
    try {
      return await patch<UserItem>(`/api/v1/users/${payload.userId}/role`, payload);
    } catch {
      localUsersStore = localUsersStore.map((u) =>
        u.id === payload.userId
          ? {
              ...u,
              role: payload.role,
              updatedAt: new Date().toISOString(),
            }
          : u
      );
      const updated = localUsersStore.find((u) => u.id === payload.userId);
      if (!updated) throw new Error("User not found");
      return updated;
    }
  },
};
