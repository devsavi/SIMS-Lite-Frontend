export type GRNStatus = "DRAFT" | "SUBMITTED" | "APPROVED";

export interface GRNItem {
  id?: string;
  productId: string;
  productName?: string;
  productSku?: string;
  orderedQuantity: number;
  receivedQuantity: number;
  remainingQuantity?: number;
  notes?: string | null;
}

export interface InventoryImpactSummaryItem {
  productId: string;
  productName: string;
  productSku: string;
  previousQuantity: number;
  addedQuantity: number;
  newQuantity: number;
}

export interface GoodsReceivedNote {
  id: string;
  grnNumber: string;
  purchaseOrderId: string;
  poNumber: string;
  supplierId: string;
  supplierName?: string;
  receivedBy: {
    id: string;
    name: string;
    email?: string;
  };
  receivedDate: string;
  status: GRNStatus;
  notes?: string | null;
  items: GRNItem[];
  inventoryImpact?: InventoryImpactSummaryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface GRNFilters {
  search?: string;
  status?: GRNStatus | "ALL";
  supplierId?: string | "ALL";
  purchaseOrderId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateGRNRequest {
  purchaseOrderId: string;
  notes?: string | null;
  items: {
    productId: string;
    orderedQuantity: number;
    receivedQuantity: number;
    notes?: string | null;
  }[];
  isDraft?: boolean;
}
