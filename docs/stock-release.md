# Stock Release Management Module

## Overview

The **Stock Release Management** module in SIMS Lite handles the workflow for requesting, approving, executing, and auditing inventory releases from the single store. It ensures that inventory balances, dashboard KPIs, low-stock widgets, notifications, and reports remain synchronized via TanStack Query cache invalidations.

---

## Key Features

- **Store-Wide Stock Release Listing**: Display release number, release date, requested by, approved by, total items, total quantity released, status, and notes using the enterprise `DataTable`.
- **Dynamic Release Request Form**: Dynamic product item rows with live stock availability badges, release quantity inputs, duplicate product prevention, and unsaved changes warnings.
- **Workflow State Management**: Supports complete lifecycle: Draft -> Submitted -> Approved / Cancelled.
- **Role-Based Access Control**:
  - `ADMIN` / `SUPER_ADMIN`: Full access (Create, Edit Draft, Submit, Approve, Cancel, View).
  - `OFFICER` / `PROCUREMENT_OFFICER`: Create, Edit Draft, Submit, View.
  - `STORE_KEEPER` / `STOCK_CLERK`: Create, Submit, View.
  - `WAREHOUSE_MANAGER`: Create, Submit, Approve, View.
- **Automatic Cache Invalidation**: On approval, TanStack Query automatically invalidates `stock-releases`, `inventory`, `inventory-ledger`, `dashboard`, `notifications`, and `reports`.

---

## Directory Structure

```text
src/features/stock-release/
├── api/
│   └── stock-release-api.ts
├── components/
│   ├── release-table/
│   │   ├── ReleaseTable.tsx
│   │   └── ReleaseTableColumns.tsx
│   ├── release-form/
│   │   └── StockReleaseForm.tsx
│   ├── release-items/
│   │   └── ReleaseItemRow.tsx
│   ├── release-status/
│   │   └── StockReleaseStatusBadge.tsx
│   ├── release-history/
│   │   └── ReleaseTimeline.tsx
│   └── filters/
│       └── ReleaseFilterPanel.tsx
├── hooks/
│   ├── stock-release-keys.ts
│   └── use-stock-release.ts
├── pages/
│   ├── StockReleaseListPage.tsx
│   ├── CreateStockReleasePage.tsx
│   ├── EditStockReleasePage.tsx
│   └── StockReleaseDetailPage.tsx
├── schemas/
│   └── stock-release-schema.ts
├── types/
│   └── stock-release-types.ts
├── utils/
│   └── stock-release-utils.ts
└── index.ts
```

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/stock-releases` | Fetch paginated stock releases with search, status, and date filters |
| `GET` | `/api/v1/stock-releases/:id` | Fetch detailed stock release info including items and audit timeline |
| `POST` | `/api/v1/stock-releases` | Create a new stock release draft |
| `PUT` | `/api/v1/stock-releases/:id` | Update an existing draft release |
| `PATCH` | `/api/v1/stock-releases/:id/submit` | Submit draft release for approval |
| `PATCH` | `/api/v1/stock-releases/:id/approve` | Approve stock release and deduct inventory quantities |
| `PATCH` | `/api/v1/stock-releases/:id/cancel` | Cancel draft/submitted release request |

---

## Running Tests

Run feature tests with Vitest:

```bash
npm test
```
