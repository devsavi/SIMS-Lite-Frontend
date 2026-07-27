import type { StockStatus, StockAdjustmentType, LedgerEntryType } from "../types";

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
  if (
    adjustmentType === "increase" ||
    adjustmentType === "found" ||
    adjustmentType === "cycle_count"
  ) {
    return currentQty + adjustedQty;
  }
  return currentQty - adjustedQty;
}

/**
 * Checks if stock adjustment would result in illegal negative stock level.
 */
export function isNegativeStockViolation(
  currentQty: number,
  adjustmentType: StockAdjustmentType,
  adjustedQty: number
): boolean {
  const isDecrease = [
    "decrease",
    "damage",
    "loss",
    "write_off",
  ].includes(adjustmentType);

  if (isDecrease && currentQty - adjustedQty < 0) {
    return true;
  }
  return false;
}

/**
 * Human readable label for ledger entry types.
 */
export function getLedgerEntryTypeLabel(type: LedgerEntryType | string): string {
  switch (type) {
    case "GRN_RECEIPT":
      return "GRN Receipt";
    case "STOCK_RELEASE":
      return "Stock Release";
    case "ADJUSTMENT_INCREASE":
      return "Adjustment (+)";
    case "ADJUSTMENT_DECREASE":
      return "Adjustment (-)";
    case "INITIAL_STOCK":
      return "Initial Stock";
    case "RETURN":
      return "Customer Return";
    case "TRANSFER":
      return "Stock Transfer";
    default:
      return type.replace(/_/g, " ");
  }
}

/**
 * Format currency numbers safely.
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "$0.00";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
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
