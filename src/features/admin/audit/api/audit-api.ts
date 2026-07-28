import { get } from "@/lib/api/client";
import type { AuditRecord, AuditFilterParams, AuditTrailResponse } from "../types";

const MOCK_AUDIT_RECORDS: AuditRecord[] = [
  {
    id: "audit-1001",
    entity: "User",
    entityId: "usr-4",
    action: "UPDATE",
    userId: "usr-2",
    userName: "Jane Doe",
    userEmail: "jane.doe@simslite.com",
    timestamp: "2026-07-28T15:20:00Z",
    ipAddress: "192.168.1.50",
    changedFields: ["role", "department"],
    diffs: [
      { field: "role", previousValue: "stock_clerk", newValue: "warehouse_manager" },
      { field: "department", previousValue: "Logistics", newValue: "Warehouse & Inventory" },
    ],
  },
  {
    id: "audit-1002",
    entity: "PurchaseOrder",
    entityId: "po-42",
    action: "CREATE",
    userId: "usr-3",
    userName: "Michael Smith",
    userEmail: "michael.smith@simslite.com",
    timestamp: "2026-07-28T13:45:00Z",
    ipAddress: "192.168.1.88",
    changedFields: ["poNumber", "supplierId", "totalAmount", "status"],
    diffs: [
      { field: "poNumber", previousValue: null, newValue: "PO-2026-00042" },
      { field: "supplierId", previousValue: null, newValue: "sup-99" },
      { field: "totalAmount", previousValue: null, newValue: 4500 },
      { field: "status", previousValue: null, newValue: "PENDING_APPROVAL" },
    ],
  },
  {
    id: "audit-1003",
    entity: "Product",
    entityId: "prod-108",
    action: "UPDATE",
    userId: "usr-4",
    userName: "Sarah Jenkins",
    userEmail: "sarah.j@simslite.com",
    timestamp: "2026-07-28T10:05:00Z",
    ipAddress: "192.168.1.102",
    changedFields: ["currentQuantity", "minStockLevel"],
    diffs: [
      { field: "currentQuantity", previousValue: 100, newValue: 150 },
      { field: "minStockLevel", previousValue: 15, newValue: 20 },
    ],
  },
  {
    id: "audit-1004",
    entity: "CompanyProfile",
    entityId: "comp-1",
    action: "UPDATE",
    userId: "usr-1",
    userName: "System Admin",
    userEmail: "admin@simslite.com",
    timestamp: "2026-07-27T17:10:00Z",
    ipAddress: "192.168.1.45",
    changedFields: ["phone", "website"],
    diffs: [
      { field: "phone", previousValue: "+1 555-0000", newValue: "+1 (555) 234-5678" },
      { field: "website", previousValue: "http://acme.local", newValue: "https://acmeindustrial.com" },
    ],
  },
  {
    id: "audit-1005",
    entity: "Supplier",
    entityId: "sup-12",
    action: "DELETE",
    userId: "usr-2",
    userName: "Jane Doe",
    userEmail: "jane.doe@simslite.com",
    timestamp: "2026-07-26T11:00:00Z",
    ipAddress: "192.168.1.50",
    changedFields: ["status"],
    diffs: [
      { field: "status", previousValue: "ACTIVE", newValue: "DELETED" },
    ],
  },
];

export const auditApi = {
  getAuditRecords: async (params?: AuditFilterParams): Promise<AuditTrailResponse> => {
    try {
      return await get<AuditTrailResponse>("/api/v1/admin/audit-trail", { params });
    } catch {
      let filtered = [...MOCK_AUDIT_RECORDS];

      if (params?.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.entity.toLowerCase().includes(query) ||
            r.entityId.toLowerCase().includes(query) ||
            r.userName.toLowerCase().includes(query) ||
            r.userEmail.toLowerCase().includes(query)
        );
      }

      if (params?.entity && params.entity !== "ALL") {
        filtered = filtered.filter((r) => r.entity === params.entity);
      }

      if (params?.action && params.action !== "ALL") {
        filtered = filtered.filter((r) => r.action === params.action);
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
