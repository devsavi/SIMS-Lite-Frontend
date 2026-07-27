# Inventory Module Documentation

## Overview

The Inventory Management module provides complete store-wide real-time visibility into inventory stock levels, valuations, and movements. It is the central module in SIMS Lite for tracking what products are available in the warehouse, detecting low or out-of-stock conditions, and performing stock adjustments.

## Architecture

```mermaid
graph LR
  subgraph "Backend API"
    A1["/api/v1/inventory/"] 
    A2["/api/v1/inventory/summary"]
    A3["/api/v1/inventory/{product_id}"]
    A4["/api/v1/inventory-ledger/"]
    A5["/api/v1/stock-adjustments/"]
  end

  subgraph "Hooks (TanStack Query)"
    H1["useInventoryList"]
    H2["useInventorySummary"]
    H3["useInventoryDetail"]
    H4["useInventoryLedger"]
    H5["useCreateStockAdjustment"]
  end

  subgraph "Components"
    C1["InventoryTable"]
    C2["InventorySummaryCards"]
    C3["StockAdjustmentDialog"]
    C4["InventoryHistoryTable"]
    C5["StockStatusBadge"]
  end

  subgraph "Pages"
    P1["InventoryListPage"]
    P2["InventoryDetailPage"]
    P3["InventoryHistoryPage"]
  end

  A1 --> H1
  A2 --> H2
  A3 --> H3
  A4 --> H4
  A5 --> H5

  H1 --> C1 --> P1
  H2 --> C2 --> P1
  H3 --> P2
  H4 --> C4 --> P3
```

## Inventory Lifecycle

```mermaid
stateDiagram-v2
  [*] --> InitialStock: Product Created / GRN Approved

  InitialStock --> InStock: QOH > Reorder Level

  InStock --> LowStock: QOH <= Reorder Level
  InStock --> GRNReceipt: Goods Received Note Approved
  InStock --> StockRelease: Stock Issued / Released
  InStock --> AdjustedIncrease: Manual Increase Adjustment
  InStock --> AdjustedDecrease: Manual Decrease Adjustment

  LowStock --> InStock: Restocked via GRN
  LowStock --> OutOfStock: Further depleted

  OutOfStock --> InStock: Emergency restock

  GRNReceipt --> InStock
  StockRelease --> InStock
  StockRelease --> LowStock
  StockRelease --> OutOfStock

  AdjustedIncrease --> InStock
  AdjustedDecrease --> LowStock
  AdjustedDecrease --> OutOfStock
```

## Module Structure

```
src/features/inventory/
├── api/
│   └── inventory-api.ts         # Axios API client for all inventory endpoints
├── components/
│   ├── inventory-table/
│   │   └── InventoryTable.tsx   # Enterprise DataTable with sorting + pagination
│   ├── inventory-summary/
│   │   └── InventorySummaryCards.tsx  # KPI stat cards
│   ├── adjustment-dialog/
│   │   └── StockAdjustmentDialog.tsx # Modal for stock adjustments
│   ├── stock-status/
│   │   └── StockStatusBadge.tsx  # Reusable status indicator badge
│   ├── inventory-history/
│   │   └── InventoryHistoryTable.tsx # Audit ledger table
│   └── filters/
│       ├── InventoryFilters.tsx # Top filter bar for overview page
│       └── LedgerFilters.tsx    # Filter bar for history page
├── hooks/
│   └── use-inventory.ts         # TanStack Query hooks
├── pages/
│   ├── InventoryListPage.tsx    # Main overview page
│   ├── InventoryDetailPage.tsx  # Per-product detail page
│   └── InventoryHistoryPage.tsx # Full movement ledger
├── schemas/
│   └── index.ts                 # Zod validation schemas
├── types/
│   └── index.ts                 # TypeScript interfaces
└── utils/
    └── inventory-utils.ts       # Utility helpers
```

## Routes

| Route | Component | Description |
|---|---|---|
| `/inventory` | `InventoryListPage` | Store-wide inventory overview |
| `/inventory/:productId` | `InventoryDetailPage` | Per-product inventory detail |
| `/inventory/history` | `InventoryHistoryPage` | Full movement ledger/audit trail |

## Stock Status Logic

Stock status is determined by comparing `quantity_on_hand` with the product's `reorder_level`:

| Status | Condition |
|---|---|
| `out_of_stock` | `quantity_on_hand <= 0` |
| `low_stock` | `0 < quantity_on_hand <= reorder_level` |
| `in_stock` | `quantity_on_hand > reorder_level` |

## API Endpoints

### GET `/api/v1/inventory/`
Returns paginated current stock list.

**Query parameters:**
- `page`, `size` — Pagination
- `search` — Search by product name, SKU, or barcode
- `category_id` — Filter by product category
- `supplier_id` — Filter by supplier
- `low_stock_only` — Show only low stock items
- `out_of_stock_only` — Show only out of stock items

### GET `/api/v1/inventory/summary`
Returns aggregate inventory summary KPIs.

### GET `/api/v1/inventory/{product_id}`
Returns current stock for a single product.

### GET `/api/v1/inventory-ledger/`
Returns paginated inventory movement ledger.

### GET `/api/v1/inventory-ledger/product/{product_id}`
Returns movements for a specific product.

## Role-Based Access

| Permission | Admin | Officer | Store Keeper |
|---|:---:|:---:|:---:|
| View inventory | ✅ | ✅ | ✅ |
| Perform adjustments | ✅ | ❌ | ✅ |

The `Adjust` button and `StockAdjustmentDialog` are only shown to users with roles: `admin`, `super_admin`, `store_keeper`, `warehouse_manager`.

## Query Keys

All inventory query keys are organized under the `inventoryKeys` factory:

```typescript
inventoryKeys.all              // ["inventory"]
inventoryKeys.lists()          // ["inventory", "list"]
inventoryKeys.list(params)     // ["inventory", "list", { ...params }]
inventoryKeys.summary()        // ["inventory", "summary"]
inventoryKeys.detail(id)       // ["inventory", "detail", id]
inventoryKeys.ledger(params)   // ["inventory", "ledger", { ...params }]
```

Successful stock adjustments invalidate all inventory queries and dashboard queries automatically.
