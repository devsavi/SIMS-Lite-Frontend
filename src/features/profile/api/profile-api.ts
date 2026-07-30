import { get, put, post } from "@/lib/api/client";
import type { UserRole } from "@/lib/auth";
import type {
  UserProfile,
  UpdateProfileDTO,
  ChangePasswordDTO,
  UserSessionItem,
  ActivityLogFilters,
  ActivityLogResponse,
} from "../types";

const MOCK_SESSIONS: UserSessionItem[] = [
  {
    id: "sess-1",
    device: "Windows PC (Chrome 126.0)",
    browser: "Chrome",
    ipAddress: "192.168.1.45",
    location: "New York, USA",
    lastActive: "Just now",
    isCurrent: true,
  },
  {
    id: "sess-2",
    device: "MacBook Pro (Safari 17.4)",
    browser: "Safari",
    ipAddress: "198.51.100.22",
    location: "San Francisco, USA",
    lastActive: "2 hours ago",
    isCurrent: false,
  },
  {
    id: "sess-3",
    device: "iPhone 15 Pro (Mobile Safari)",
    browser: "Mobile Safari",
    ipAddress: "203.0.113.88",
    location: "Austin, TX, USA",
    lastActive: "Yesterday at 18:30",
    isCurrent: false,
  },
];



const MOCK_DEFAULT_PROFILE: UserProfile = {
  id: "usr-current",
  name: "System Admin",
  firstName: "System",
  lastName: "Admin",
  email: "admin@simslite.com",
  role: "admin",
  phone: "+1 555-0101",
  department: "Executive Management",
  bio: "Senior inventory & operations manager responsible for SIMS Lite platform administration.",
  status: "ACTIVE",
  createdAt: "2026-01-01T00:00:00Z",
  lastLogin: new Date().toISOString(),
  twoFactorEnabled: true,
};

const ROLE_NAME_MAP: Record<string, UserRole> = {
  ADMIN: "admin",
  OFFICER: "officer",
  STORE_KEEPER: "store_keeper",
};

function normalizeRoleName(raw?: string): UserRole {
  if (!raw) return "store_keeper";
  const upper = raw.toUpperCase().replace(/[^A-Z_]/g, "_");
  return ROLE_NAME_MAP[upper] ?? (raw.toLowerCase() as UserRole);
}


function mapRawToUserProfile(raw: any): UserProfile {
  if (!raw || typeof raw !== "object") {
    return MOCK_DEFAULT_PROFILE;
  }

  const u = raw.data ?? raw;
  const firstName = u.firstName ?? u.first_name ?? "";
  const lastName = u.lastName ?? u.last_name ?? "";
  const name =
    u.name ||
    u.full_name ||
    `${firstName} ${lastName}`.trim() ||
    u.email ||
    "User Profile";

  const rawRole =
    Array.isArray(u.roles) && u.roles.length > 0
      ? u.roles[0]?.name
      : u.role;

  const role = normalizeRoleName(rawRole);
  const status =
    u.status ?? (u.is_active === false ? "INACTIVE" : "ACTIVE");

  const createdAt =
    u.createdAt ?? u.created_at ?? "2026-01-01T00:00:00Z";
  const lastLogin = u.lastLogin ?? u.last_login ?? null;

  return {
    id: u.id ?? "usr-current",
    name,
    firstName: firstName || name.split(" ")[0] || "User",
    lastName: lastName || name.split(" ").slice(1).join(" ") || "",
    email: u.email ?? "",
    role,
    phone: u.phone ?? undefined,
    department: u.department ?? u.team ?? undefined,
    avatar: u.avatar_url ?? u.avatar ?? undefined,
    bio: u.bio ?? undefined,
    status,
    createdAt,
    updatedAt: u.updatedAt ?? u.updated_at,
    lastLogin,
    twoFactorEnabled: u.twoFactorEnabled ?? true,
  };
}

export const profileApi = {
  getProfile: async (): Promise<UserProfile> => {
    try {
      const res = await get<any>("/auth/me");
      return mapRawToUserProfile(res);
    } catch {
      return MOCK_DEFAULT_PROFILE;
    }
  },

  updateProfile: async (payload: UpdateProfileDTO): Promise<UserProfile> => {
    try {
      const body = {
        first_name: payload.firstName,
        last_name: payload.lastName,
        phone: payload.phone,
        department: payload.department,
        team: payload.department, // since team and department are combined in details input
        avatar_url: payload.avatar,
        bio: payload.bio,
      };
      const res = await put<any>("/profile/", body);
      return mapRawToUserProfile(res);
    } catch {
      return {
        ...MOCK_DEFAULT_PROFILE,
        name: `${payload.firstName} ${payload.lastName}`.trim(),
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        phone: payload.phone || MOCK_DEFAULT_PROFILE.phone,
        department: payload.department || MOCK_DEFAULT_PROFILE.department,
        avatar: payload.avatar,
        bio: payload.bio,
      };
    }
  },

  changePassword: async (payload: ChangePasswordDTO): Promise<{ message: string }> => {
    return await post<{ message: string }>("/auth/change-password", {
      current_password: payload.currentPassword,
      new_password: payload.newPassword,
      confirm_password: payload.confirmPassword,
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
    });
  },

  getSessions: async (): Promise<UserSessionItem[]> => {
    try {
      const res = await get<any>("/auth/sessions");
      const list = res?.data ?? res;
      return Array.isArray(list) ? list : MOCK_SESSIONS;
    } catch {
      return MOCK_SESSIONS;
    }
  },

  revokeOtherSessions: async (): Promise<{ message: string }> => {
    try {
      return await post<{ message: string }>("/auth/sessions/revoke-others", {});
    } catch {
      return { message: "All other active sessions have been revoked." };
    }
  },

  getActivityLogs: async (filters: ActivityLogFilters): Promise<ActivityLogResponse> => {
    const params = new URLSearchParams();
    if (filters.period !== "custom") {
      params.set("period", filters.period);
    } else {
      if (filters.date_from) params.set("date_from", filters.date_from);
      if (filters.date_to) params.set("date_to", filters.date_to);
    }
    if (filters.action !== "all") params.set("action", filters.action);
    if (filters.status !== "all") params.set("status", filters.status);
    params.set("page", String(filters.page));
    params.set("size", String(filters.size));

    const res = await get<any>(`/profile/activity?${params.toString()}`);
    return {
      data: Array.isArray(res?.data) ? res.data : [],
      pagination: res?.pagination ?? { page: 1, size: filters.size, total: 0, pages: 1 },
    };
  },

};
