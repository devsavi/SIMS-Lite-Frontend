export type POStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export type POEmailStatus = "SENT" | "PENDING" | "FAILED";

export interface PurchaseOrderItem {
  id?: string;
  productId: string;
  productName?: string;
  productSku?: string;
  quantity: number;
  unitCost: number;
  totalCost?: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName?: string;
  status: POStatus;
  emailStatus?: POEmailStatus;
  expectedDeliveryDate?: string | null;
  notes?: string | null;
  totalItems: number;
  totalAmount: number;
  items: PurchaseOrderItem[];
  createdBy: {
    id: string;
    name: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
  activityLog?: Array<{
    id: string;
    action: string;
    performedBy: string;
    timestamp: string;
    details?: string;
  }>;
}

export interface POFilters {
  search?: string;
  status?: POStatus | "ALL";
  supplierId?: string | "ALL";
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreatePORequest {
  supplierId: string;
  expectedDeliveryDate?: string | null;
  notes?: string | null;
  items: {
    productId: string;
    quantity: number;
    unitCost: number;
  }[];
  isDraft?: boolean;
}

export interface UpdatePORequest {
  supplierId?: string;
  expectedDeliveryDate?: string | null;
  notes?: string | null;
  items?: {
    productId: string;
    quantity: number;
    unitCost: number;
  }[];
}
