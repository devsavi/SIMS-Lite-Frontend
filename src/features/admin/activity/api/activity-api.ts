import { get } from "@/lib/api/client";
import type { ActivityLogEntry, ActivityFilterParams, ActivityLogResponse } from "../types";

const MOCK_ACTIVITIES: ActivityLogEntry[] = [
  {
    id: "act-101",
    userId: "usr-1",
    userName: "System Admin",
    userEmail: "admin@simslite.com",
    userRole: "super_admin",
    action: "Updated System Settings (General)",
    module: "SETTINGS",
    status: "SUCCESS",
    timestamp: "2026-07-28T14:12:00Z",
    ipAddress: "192.168.1.45",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    details: { section: "general", changes: ["sessionTimeoutMinutes -> 60"] },
  },
  {
    id: "act-102",
    userId: "usr-3",
    userName: "Michael Smith",
    userEmail: "michael.smith@simslite.com",
    userRole: "procurement_officer",
    action: "Created Purchase Order PO-2026-00042",
    module: "PROCUREMENT",
    status: "SUCCESS",
    timestamp: "2026-07-28T13:45:00Z",
    ipAddress: "192.168.1.88",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    details: { poNumber: "PO-2026-00042", supplier: "Acme Industrial", total: 4500 },
  },
  {
    id: "act-103",
    userId: "usr-5",
    userName: "Robert Vance",
    userEmail: "robert.v@simslite.com",
    userRole: "stock_clerk",
    action: "Failed Login Attempt",
    module: "AUTH",
    status: "FAILED",
    timestamp: "2026-07-28T11:20:00Z",
    ipAddress: "198.51.100.12",
    userAgent: "Mozilla/5.0 (Linux; Android 11)",
    details: { reason: "Invalid password attempt" },
  },
  {
    id: "act-104",
    userId: "usr-4",
    userName: "Sarah Jenkins",
    userEmail: "sarah.j@simslite.com",
    userRole: "warehouse_manager",
    action: "Adjusted Stock Level for SKU BEAR-001",
    module: "INVENTORY",
    status: "SUCCESS",
    timestamp: "2026-07-28T10:05:00Z",
    ipAddress: "192.168.1.102",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    details: { sku: "BEAR-001", delta: "+50", newTotal: 150 },
  },
  {
    id: "act-105",
    userId: "usr-2",
    userName: "Jane Doe",
    userEmail: "jane.doe@simslite.com",
    userRole: "admin",
    action: "Assigned Role 'warehouse_manager' to Sarah Jenkins",
    module: "USERS",
    status: "SUCCESS",
    timestamp: "2026-07-27T16:30:00Z",
    ipAddress: "192.168.1.50",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    details: { targetUser: "Sarah Jenkins", newRole: "warehouse_manager" },
  },
  {
    id: "act-106",
    userId: "usr-1",
    userName: "System Admin",
    userEmail: "admin@simslite.com",
    userRole: "super_admin",
    action: "Tested SMTP Gateway Connectivity",
    module: "EMAIL",
    status: "WARNING",
    timestamp: "2026-07-27T14:15:00Z",
    ipAddress: "192.168.1.45",
    details: { latencyMs: 850, warning: "High SMTP response delay" },
  },
];

export const activityApi = {
  getActivityLogs: async (params?: ActivityFilterParams): Promise<ActivityLogResponse> => {
    try {
      return await get<ActivityLogResponse>("/api/v1/admin/activity-logs", { params });
    } catch {
      let filtered = [...MOCK_ACTIVITIES];

      if (params?.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(
          (a) =>
            a.action.toLowerCase().includes(query) ||
            a.userName.toLowerCase().includes(query) ||
            a.userEmail.toLowerCase().includes(query)
        );
      }

      if (params?.status && params.status !== "ALL") {
        filtered = filtered.filter((a) => a.status === params.status);
      }

      if (params?.module && params.module !== "ALL") {
        filtered = filtered.filter((a) => a.module === params.module);
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
};
