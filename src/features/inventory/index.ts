// Public barrel export for the inventory feature module

// Pages
export { InventoryListPage } from "./pages/InventoryListPage";
export { InventoryDetailPage } from "./pages/InventoryDetailPage";
export { InventoryHistoryPage } from "./pages/InventoryHistoryPage";

// Components
export { StockStatusBadge } from "./components/stock-status/StockStatusBadge";
export { InventorySummaryCards } from "./components/inventory-summary/InventorySummaryCards";
export { InventoryTable } from "./components/inventory-table/InventoryTable";
export { InventoryFilters } from "./components/filters/InventoryFilters";
export { LedgerFilters } from "./components/filters/LedgerFilters";
export { StockAdjustmentDialog } from "./components/adjustment-dialog/StockAdjustmentDialog";
export { InventoryHistoryTable } from "./components/inventory-history/InventoryHistoryTable";

// Hooks
export {
  inventoryKeys,
  useInventoryList,
  useInventorySummary,
  useInventoryValuation,
  useInventoryDetail,
  useInventoryLedger,
  useProductLedger,
  useCreateStockAdjustment,
  useApproveStockAdjustment,
  usePrefetchInventoryDetail,
} from "./hooks/use-inventory";

// API
export { inventoryApi } from "./api/inventory-api";

// Types
export type {
  StockStatus,
  ProductRef,
  UserRef,
  InventoryItem,
  InventorySummary,
  InventoryLedgerEntry,
  LedgerEntryType,
  StockAdjustment,
  StockAdjustmentType,
  StockAdjustmentStatus,
  StockAdjustmentCreatePayload,
  InventoryFilterParams,
  LedgerFilterParams,
} from "./types";

// Schemas
export { stockAdjustmentSchema, type StockAdjustmentFormValues } from "./schemas";

// Utils
export {
  getStockStatus,
  getStockStatusLabel,
  calculateNewQuantity,
  isNegativeStockViolation,
  getLedgerEntryTypeLabel,
  formatCurrency,
  formatQuantity,
} from "./utils/inventory-utils";
