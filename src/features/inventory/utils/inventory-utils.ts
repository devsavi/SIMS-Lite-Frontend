import type { StockStatus, StockAdjustmentType, LedgerEntryType } from "../types";
import { formatCurrency as formatCurrencyUtil } from "@/utils/format";

/**
 * Calculates stock status based on current quantity on hand and product reorder level.
 */
export function getStockStatus(
  quantityOnHand: number,
  reorderLevel: number = 0
): StockStatus {
  if (quantityOnHand <= 0) {
    return "out_of_stock";
  }
  if (quantityOnHand <= reorderLevel) {
    return "low_stock";
  }
  return "in_stock";
}

/**
 * Human-readable label for stock status.
 */
export function getStockStatusLabel(status: StockStatus): string {
  switch (status) {
    case "in_stock":
      return "In Stock";
    case "low_stock":
      return "Low Stock";
    case "out_of_stock":
      return "Out of Stock";
    default:
      return "Unknown";
  }
}

/**
 * Calculates preview quantity after adjustment.
 */
export function calculateNewQuantity(
  currentQty: number,
  adjustmentType: StockAdjustmentType,
  adjustedQty: number
): number {
  if (adjustmentType === "INCREASE") {
    return currentQty + adjustedQty;
  }
  if (adjustmentType === "DECREASE") {
    return currentQty - adjustedQty;
  }
  // RECOUNT — set to exact value
  return adjustedQty;
}

/**
 * Checks if stock adjustment would result in illegal negative stock level.
 */
export function isNegativeStockViolation(
  currentQty: number,
  adjustmentType: StockAdjustmentType,
  adjustedQty: number
): boolean {
  if (adjustmentType === "DECREASE" && currentQty - adjustedQty < 0) {
    return true;
  }
  return false;
}

/**
 * Human readable label for ledger entry types.
 */
export function getLedgerEntryTypeLabel(type: LedgerEntryType | string): string {
  switch (type) {
    case "PURCHASE_RECEIPT":
      return "Purchase Receipt";
    case "STOCK_RELEASE":
      return "Stock Release";
    case "ADJUSTMENT_IN":
      return "Adjustment (+)";
    case "ADJUSTMENT_OUT":
      return "Adjustment (-)";
    case "INITIAL_STOCK":
      return "Initial Stock";
    default:
      return type.replace(/_/g, " ");
  }
}

/**
 * Human readable label for ledger reference types.
 */
export function getLedgerReferenceTypeLabel(type: string): string {
  switch (type) {
    case "GRN":
      return "GRN";
    case "STOCK_ADJUSTMENT":
      return "Stock Adjustment";
    case "STOCK_RELEASE":
      return "Stock Release";
    case "INITIAL":
      return "Initial Stock";
    default:
      return type.replace(/_/g, " ");
  }
}

/**
 * Format currency numbers safely using the system base currency.
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return formatCurrencyUtil(0);
  }
  return formatCurrencyUtil(value);
}

/**
 * Format raw numbers with thousand separators.
 */
export function formatQuantity(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "0";
  }
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}
