# Dashboard Components

## KPI Cards

### `AdminKpiCards`

Eight metric tiles for the Admin dashboard.

```tsx
import { AdminKpiCards } from "@/features/dashboard/components/kpi-cards/AdminKpiCards";

<AdminKpiCards stats={dashboardStats} loading={isLoading} />
```

| Prop | Type | Description |
|---|---|---|
| `stats` | `DashboardStats` | KPI data from the API |
| `loading` | `boolean` | Shows skeleton when true |

Displayed metrics: Total Products, Total Suppliers, Inventory Items, Inventory Value, Pending POs, Pending GRNs, Pending Releases, Low Stock Items.

---

### `OfficerKpiCards`

Four metric tiles for procurement officers.

```tsx
<OfficerKpiCards stats={officerStats} loading={isLoading} />
```

Displayed metrics: Pending POs, Pending GRNs, Inventory Value, Low Stock Items.

---

### `StoreKeeperKpiCards`

Three metric tiles for store keepers / stock clerks.

```tsx
<StoreKeeperKpiCards stats={storeKeeperStats} loading={isLoading} />
```

Displayed metrics: Current Inventory, Low Stock Products, Today's Releases.

---

## Charts

All chart components are self-contained card wrappers around the shared Recharts wrappers in `src/app/components/charts/index.tsx`. Each card includes a title, description, loading skeleton, empty state, and error state.

### `InventoryValueTrendChart`

Area chart showing monthly inventory value.

```tsx
<InventoryValueTrendChart
  data={charts.inventory_value_trend}
  loading={isLoading}
  error={error}
  onRetry={refetch}
/>
```

### `MonthlyPurchaseOrdersChart`

Bar chart showing PO count per month.

### `MonthlyStockReleasesChart`

Line chart showing stock release volume per month.

### `TopReleasedProductsChart`

Bar chart of highest-volume released products.

### `LowStockDistributionChart`

Pie chart showing low stock items by category.

### `GrnTrendChart`

Line chart showing monthly GRN counts (Officer dashboard).

---

## Widgets

### `RecentActivitiesWidget`

| Prop | Type | Description |
|---|---|---|
| `activities` | `ActivityItem[]` | Items to display |
| `loading` | `boolean` | Loading skeleton |
| `error` | `unknown` | Error from TanStack Query |
| `onRetry` | `() => void` | Called on retry button click |

Each row shows the user name, action badge (colour-coded), reference number, description, and relative timestamp.

---

### `NotificationsWidget`

| Prop | Type | Description |
|---|---|---|
| `notifications` | `NotificationItem[]` | Notification items |
| `unreadCount` | `number` | Badge count |
| `loading` | `boolean` | |
| `error` | `unknown` | |
| `onRetry` | `() => void` | |

Unread items highlighted with a coloured left border and an unread dot. Links to `/notifications`.

---

### `PendingApprovalsWidget`

Displays purchase orders and stock releases awaiting approval. Each row has a Review button linking to the item detail page.

---

### `RecentPurchaseOrdersWidget`

Clickable rows linking to `/purchase-orders/:id`. Each row shows PO number, supplier, status badge, amount, and relative date.

Props: `orders`, `loading`, `error`, `onRetry`, `title` (optional, defaults to "Recent Purchase Orders").

---

### `RecentGRNsWidget`

Clickable rows linking to `/grn/:id`. Shows GRN number, linked PO number, supplier, status badge, and date.

Props: `grns`, `loading`, `error`, `onRetry`, `title` (optional).

---

### `LowStockWidget`

Each row includes a stock level progress bar showing current vs reorder level. Critical (0 stock) items use a destructive colour. Links to `/inventory?product=:id`.

---

### `InventoryAlertsWidget`

Severity-coded alert rows:

| Severity | Visual |
|---|---|
| `high` | Red left border |
| `medium` | Yellow/amber left border |
| `low` | Muted left border |

Alert types: `low_stock`, `out_of_stock`, `expiring_soon`, `overstock`.

---

### `PendingStockReleasesWidget`

Clickable rows linking to `/stock-release/:id`. Shows release number, status badge, requester, item count, and date.

---

### `RecentAdjustmentsWidget`

Each row shows adjustment direction (↑ increase in green, ↓ decrease in red), product name, quantity delta, reason, and who made the adjustment.

---

## Quick Actions

Three role-specific action grids. Each action card links to the relevant module route and is gated by `PermissionGuard`.

### `AdminQuickActions`

5 actions: Create Product, Create Supplier, Create Purchase Order, View Inventory, View Reports.

### `OfficerQuickActions`

3 actions: Create Purchase Order, Receive Goods, View Inventory.

### `StoreKeeperQuickActions`

3 actions: Stock Adjustment, Stock Release, View Inventory.

---

## DashboardFilters

Period selector and manual refresh button rendered in the `PageHeader` actions slot.

```tsx
<DashboardFilters
  period={period}
  onPeriodChange={setPeriod}
  onRefresh={handleRefresh}
  isRefreshing={isRefreshing}
/>
```

Period options: `7d`, `30d`, `90d`, `1y`.

---

## Accessibility Notes

- KPI card grids have `aria-label="Key performance indicators"`.
- Activity and notification lists have `aria-label` on the `<ul>` element.
- Notification list uses `aria-live="polite"` for dynamic updates.
- Inventory alerts use `aria-live="polite"`.
- Icons are `aria-hidden="true"` throughout.
- Loading regions use `aria-busy="true"` or `role="status"`.
- Chart wrappers use `role="img"` with `aria-label` (from the shared chart components).
- All interactive elements are keyboard navigable with visible focus rings.
- Quick action cards have descriptive `aria-label` attributes including both label and description.
