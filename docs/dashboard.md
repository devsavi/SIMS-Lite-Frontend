# Dashboard Module

## Overview

The SIMS Lite Dashboard provides a role-aware landing experience that surfaces the most relevant metrics, charts, widgets, and quick actions for each user role. All data is fetched from the backend Dashboard & Analytics API using TanStack Query with caching, background refresh, and manual invalidation.

## Role-Based Dashboards

| Role | Dashboard | Description |
|---|---|---|
| `admin` / `super_admin` | `AdminDashboard` | Full system overview — KPIs, charts, pending approvals, recent POs/GRNs, activity feed |
| `procurement_officer` / `warehouse_manager` | `OfficerDashboard` | Procurement focus — PO/GRN stats, purchase charts, assigned orders |
| `stock_clerk` | `StoreKeeperDashboard` | Warehouse focus — inventory alerts, pending releases, adjustments |
| `viewer` | `AdminDashboard` (read-only) | Read-only KPIs (permission guards hide write actions) |

The `DashboardRouter` component selects the correct view based on the authenticated user's Zustand store role:

```tsx
// src/app/(dashboard)/dashboard/page.tsx
import { DashboardRouter } from "@/features/dashboard";

export default function DashboardPage() {
  return <DashboardRouter />;
}
```

## Module Structure

```
src/features/dashboard/
├── api/
│   └── dashboard-api.ts       # All API call functions
├── components/
│   ├── charts/
│   │   └── DashboardCharts.tsx  # Chart card wrappers
│   ├── filters/
│   │   └── DashboardFilters.tsx # Period selector + refresh button
│   ├── kpi-cards/
│   │   ├── AdminKpiCards.tsx
│   │   ├── OfficerKpiCards.tsx
│   │   └── StoreKeeperKpiCards.tsx
│   └── widgets/
│       ├── InventoryAlertsWidget.tsx
│       ├── LowStockWidget.tsx
│       ├── NotificationsWidget.tsx
│       ├── PendingApprovalsWidget.tsx
│       ├── PendingStockReleasesWidget.tsx
│       ├── QuickActions.tsx
│       ├── RecentActivitiesWidget.tsx
│       ├── RecentAdjustmentsWidget.tsx
│       ├── RecentGRNsWidget.tsx
│       └── RecentPurchaseOrdersWidget.tsx
├── hooks/
│   └── use-dashboard.ts         # TanStack Query hooks
├── pages/
│   ├── AdminDashboard.tsx
│   ├── DashboardRouter.tsx
│   ├── OfficerDashboard.tsx
│   └── StoreKeeperDashboard.tsx
├── types/
│   └── index.ts                 # All TypeScript types
├── __tests__/                   # Vitest test suite
└── index.ts                     # Public barrel export
```

## Backend Endpoints

All requests go to `NEXT_PUBLIC_API_URL/dashboard/...`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard/stats` | KPI statistics |
| `GET` | `/dashboard/charts` | Chart datasets |
| `GET` | `/dashboard/activities` | Recent system activity |
| `GET` | `/dashboard/notifications` | User notifications |
| `GET` | `/dashboard/pending-approvals` | Items pending approval |
| `GET` | `/dashboard/recent-purchase-orders` | Latest POs |
| `GET` | `/dashboard/recent-grns` | Latest GRNs |
| `GET` | `/dashboard/low-stock` | Low stock products |
| `GET` | `/dashboard/inventory-alerts` | Active inventory alerts |
| `GET` | `/dashboard/recent-adjustments` | Inventory adjustments |
| `GET` | `/dashboard/pending-stock-releases` | Pending release requests |

All endpoints accept an optional `period` query param (`7d` | `30d` | `90d` | `1y`).

All responses follow the standard envelope: `{ status: "success", data: T }`.

## Query Caching

| Setting | Value |
|---|---|
| Stale time | 2 minutes |
| GC time | 10 minutes (inherited from global config) |
| Background refetch interval | 5 minutes |
| Refetch on window focus | Enabled for stats and notifications |

Queries are invalidated manually via the refresh button, which calls:
```ts
queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
```

## Responsive Layout

Each dashboard uses `PageContainer` with adaptive CSS grids:

| Breakpoint | Grid columns |
|---|---|
| Mobile (`< sm`) | 1 column |
| Tablet (`sm`) | 2 columns (KPI cards) |
| Desktop (`lg`) | 2 columns (charts / widgets) |
| Wide Desktop (`xl`) | 3 columns (admin chart row 2) |

## Adding a New Widget

1. Create the component in `src/features/dashboard/components/widgets/`
2. Add the required type to `src/features/dashboard/types/index.ts`
3. Add the API call to `src/features/dashboard/api/dashboard-api.ts`
4. Add the TanStack Query hook to `src/features/dashboard/hooks/use-dashboard.ts`
5. Import and place the widget in the relevant dashboard page

## Running Tests

```bash
npm test -- src/features/dashboard
```
