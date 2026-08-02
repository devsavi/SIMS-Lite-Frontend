// Public barrel export for the inventory feature module

// Pages
export { InventoryListPage } from "./pages/InventoryListPage";
export { InventoryDetailPage } from "./pages/InventoryDetailPage";
export { InventoryHistoryPage } from "./pages/InventoryHistoryPage";
export { StockAdjustmentListPage } from "./pages/StockAdjustmentListPage";
export { CreateStockAdjustmentPage } from "./pages/CreateStockAdjustmentPage";
export { EditStockAdjustmentPage } from "./pages/EditStockAdjustmentPage";
export { StockAdjustmentDetailPage } from "./pages/StockAdjustmentDetailPage";

// Components
export { StockStatusBadge } from "./components/stock-status/StockStatusBadge";
export { InventorySummaryCards } from "./components/inventory-summary/InventorySummaryCards";
export { InventoryTable } from "./components/inventory-table/InventoryTable";
export { InventoryFilters } from "./components/filters/InventoryFilters";
export { LedgerFilters } from "./components/filters/LedgerFilters";
export { StockAdjustmentDialog } from "./components/adjustment-dialog/StockAdjustmentDialog";
export { InventoryHistoryTable } from "./components/inventory-history/InventoryHistoryTable";
export { StockAdjustmentStatusBadge } from "./components/adjustment-status/StockAdjustmentStatusBadge";
export { AdjustmentFilterPanel } from "./components/adjustment-filters/AdjustmentFilterPanel";
export { AdjustmentTable } from "./components/adjustment-table/AdjustmentTable";
export { StockAdjustmentForm } from "./components/adjustment-form/StockAdjustmentForm";

// Hooks
export {
  inventoryKeys,
  stockAdjustmentKeys,
  useInventoryList,
  useInventorySummary,
  useInventoryValuation,
  useInventoryDetail,
  useInventoryLedger,
  useInventoryLedgerEntry,
  useProductLedger,
  useReferenceLedger,
  useStockAdjustmentList,
  useStockAdjustmentDetail,
  useCreateStockAdjustment,
  useUpdateStockAdjustment,
  useDeleteStockAdjustment,
  useSubmitStockAdjustment,
  useApproveStockAdjustment,
  useCancelStockAdjustment,
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
  LedgerReferenceType,
  LedgerPeriod,
  StockAdjustmentSummary,
  StockAdjustment,
  StockAdjustmentType,
  StockAdjustmentStatus,
  StockAdjustmentPeriod,
  StockAdjustmentCreatePayload,
  StockAdjustmentUpdatePayload,
  StockAdjustmentFilterParams,
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
  getLedgerReferenceTypeLabel,
  formatCurrency,
  formatQuantity,
} from "./utils/inventory-utils";
