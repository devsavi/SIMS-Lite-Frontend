# Reports & Analytics Module Documentation

## Overview

The Reports & Analytics module of SIMS Lite Frontend delivers real-time, production-ready operational reporting, filtering, visualizations, and binary data exports across inventory, procurement, and master data domains.

## Supported Reports

1. **Inventory Report**: Stock quantities, minimum stock thresholds, supplier assignments, category breakdown, valuation.
2. **Low Stock Report**: Dedicated critical stock list for items below reorder points.
3. **Purchase Order Report**: PO totals, supplier status, approval timelines, amounts.
4. **GRN Report**: Goods Received Notes history, quantities received, receiving status, suppliers.
5. **Stock Release Report**: Approved stock releases, total items, issuing storekeeper history.
6. **Inventory Movement Report**: Chronological stock inflows, outflows, adjustments, transfers, and balances.
7. **Supplier Report**: Supplier PO counts, GRN history, and aggregate spend analysis.
8. **Product Report**: Master product catalog with SKUs, categories, brands, and active statuses.

## Role-Based Permissions

- **ADMIN / SUPER_ADMIN**: Access to all 8 reports & export capability.
- **OFFICER**: Access to operational reports (PO, GRN, Stock Release, Supplier, Product, Movement) & export.
- **STORE_KEEPER**: Access to inventory-related reports (Inventory, Low Stock, Product, Movement).

## Report Generation Flow

```mermaid
sequenceDocument
participant User
participant ReportsPage as Reports Landing Page
participant ReportDetail as Report Detail Page
participant QueryHook as TanStack Query
participant API as Reports API
participant Backend as Backend Service

User->>ReportsPage: Select Report Card (e.g. Inventory Report)
ReportsPage->>ReportDetail: Navigate to /reports/inventory
ReportDetail->>QueryHook: Trigger useReportData & useReportSummary
QueryHook->>API: getReportData('inventory', filters)
API->>Backend: GET /api/v1/reports/inventory?start_date=...
Backend-->>API: Return Paginated Report Data
API-->>QueryHook: Return Response Data
QueryHook-->>ReportDetail: Render ReportTable, SummaryCards, and Charts
```

## Folder Architecture

```text
src/features/reports/
├── api/                  # API client methods & mock fallbacks
├── components/           # UI components
│   ├── charts/           # Recharts visualisations
│   ├── export-dialog/    # Export modal dialog
│   ├── print-preview/    # Print preview modal
│   ├── report-cards/     # Landing page cards
│   ├── report-filters/   # Search, date range & status filters
│   ├── report-summary/   # KPI metric summary cards
│   └── report-table/     # Dynamic table for 8 report types
├── hooks/                # TanStack query hooks & export mutation
├── pages/                # Landing and Detail page components
├── schemas/              # Zod validation schemas
├── types/                # TypeScript interfaces
└── utils/                # Blob download & print utilities
```
