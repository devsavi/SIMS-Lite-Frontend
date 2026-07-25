# Dashboard Data Flow

## Architecture Overview

```mermaid
graph TB
    subgraph NextJS["Next.js App Router"]
        Page["DashboardPage\n/app/(dashboard)/dashboard/page.tsx"]
        Router["DashboardRouter\n(role-based switch)"]
        AdminD["AdminDashboard"]
        OfficerD["OfficerDashboard"]
        StoreD["StoreKeeperDashboard"]
    end

    subgraph Hooks["TanStack Query Hooks"]
        useStats["useDashboardStats()"]
        useCharts["useDashboardCharts()"]
        useActivities["useRecentActivities()"]
        useNotifs["useDashboardNotifications()"]
        useApprovals["usePendingApprovals()"]
        usePOs["useRecentPurchaseOrders()"]
        useGRNs["useRecentGRNs()"]
        useLowStock["useLowStockItems()"]
        useAlerts["useInventoryAlerts()"]
        useAdjust["useRecentAdjustments()"]
        useReleases["usePendingStockReleases()"]
    end

    subgraph API["API Layer"]
        dashboardApi["dashboardApi\n(dashboard-api.ts)"]
        axiosClient["Axios Client\n(lib/api/client.ts)"]
    end

    subgraph Auth["Auth Layer"]
        AuthStore["useAuthStore\n(Zustand)"]
        TokenStore["Token Storage\n(in-memory / localStorage)"]
    end

    subgraph Backend["Backend (Django REST)"]
        stats["GET /dashboard/stats"]
        charts["GET /dashboard/charts"]
        activities["GET /dashboard/activities"]
        notifications["GET /dashboard/notifications"]
        approvals["GET /dashboard/pending-approvals"]
        pos["GET /dashboard/recent-purchase-orders"]
        grns["GET /dashboard/recent-grns"]
        lowstock["GET /dashboard/low-stock"]
        alerts["GET /dashboard/inventory-alerts"]
        adjustments["GET /dashboard/recent-adjustments"]
        releases["GET /dashboard/pending-stock-releases"]
    end

    Page --> Router
    Router --> AuthStore
    Router --> AdminD & OfficerD & StoreD

    AdminD --> useStats & useCharts & useActivities & useNotifs & useApprovals & usePOs & useGRNs & useLowStock
    OfficerD --> useStats & useCharts & useNotifs & usePOs & useGRNs
    StoreD --> useStats & useNotifs & useAlerts & useReleases & useAdjust

    useStats --> dashboardApi
    useCharts --> dashboardApi
    useActivities --> dashboardApi
    useNotifs --> dashboardApi
    useApprovals --> dashboardApi
    usePOs --> dashboardApi
    useGRNs --> dashboardApi
    useLowStock --> dashboardApi
    useAlerts --> dashboardApi
    useAdjust --> dashboardApi
    useReleases --> dashboardApi

    dashboardApi --> axiosClient
    axiosClient --> TokenStore
    axiosClient --> stats & charts & activities & notifications & approvals & pos & grns & lowstock & alerts & adjustments & releases
```

## Request Lifecycle

```mermaid
sequenceDiagram
    participant Component
    participant QueryHook as TanStack Query Hook
    participant QueryCache as Query Cache
    participant API as dashboardApi
    participant Axios as Axios Client
    participant Server as Django Backend

    Component->>QueryHook: Mounts / period changes
    QueryHook->>QueryCache: Check cache (key + params)

    alt Cache is fresh (< 2 min stale)
        QueryCache-->>Component: Return cached data
        Note over Component: Renders immediately with cached data
    else Cache is stale or empty
        QueryCache-->>Component: Return stale/undefined (isLoading or isFetching)
        Component->>Component: Render skeleton/loading state
        QueryHook->>API: Call dashboardApi function
        API->>Axios: GET /dashboard/... with params
        Axios->>Axios: Attach Bearer token from in-memory store
        Axios->>Server: HTTP request
        Server-->>Axios: { status: "success", data: T }
        Axios-->>API: Response data
        API-->>QueryHook: Unwrapped data (res.data)
        QueryHook->>QueryCache: Update cache
        QueryCache-->>Component: Re-render with fresh data
    end
```

## Cache Invalidation

```mermaid
flowchart LR
    RefreshBtn["Refresh Button click"] --> Invalidate
    PeriodChange["Period selector change"] --> NewQueryKey["New query key\n(different params)"] --> AutoFetch["Auto-fetch on new key"]
    BackgroundTimer["Background timer\n(every 5 min)"] --> Refetch["silently refetch"]
    WindowFocus["Window regains focus"] --> Refetch

    Invalidate["queryClient.invalidateQueries\n(dashboardKeys.all)"] --> RefetchAll["All dashboard queries\nmark stale + refetch"]
```

## Widget Data Flow

```mermaid
graph LR
    subgraph AdminDashboard
        KPICards["AdminKpiCards"]
        Charts["DashboardCharts\n(5 chart cards)"]
        Approvals["PendingApprovalsWidget"]
        LowStock["LowStockWidget"]
        POWidget["RecentPurchaseOrdersWidget"]
        GRNWidget["RecentGRNsWidget"]
        ActivityWidget["RecentActivitiesWidget"]
        NotifWidget["NotificationsWidget"]
        QuickAct["AdminQuickActions"]
    end

    subgraph Queries
        statsQ["useDashboardStats"]
        chartsQ["useDashboardCharts"]
        approvalsQ["usePendingApprovals"]
        lowStockQ["useLowStockItems"]
        posQ["useRecentPurchaseOrders"]
        grnsQ["useRecentGRNs"]
        actQ["useRecentActivities"]
        notifQ["useDashboardNotifications"]
    end

    statsQ --> KPICards
    chartsQ --> Charts
    approvalsQ --> Approvals
    lowStockQ --> LowStock
    posQ --> POWidget
    grnsQ --> GRNWidget
    actQ --> ActivityWidget
    notifQ --> NotifWidget
    QuickAct -.->|"PermissionGuard\n(hides by role)"| QuickAct
```

## Role Selection Flow

```mermaid
flowchart TD
    A["/dashboard page loads"] --> B["DashboardRouter mounts"]
    B --> C["Read role from useAuthStore"]
    C --> D{role?}
    D -- admin / super_admin --> E["Render AdminDashboard\n8 KPI cards · 5 charts · 7 widgets"]
    D -- procurement_officer\nwarehouse_manager --> F["Render OfficerDashboard\n4 KPI cards · 2 charts · 4 widgets"]
    D -- stock_clerk --> G["Render StoreKeeperDashboard\n3 KPI cards · 4 widgets"]
    D -- viewer / unknown --> E
```

## Query Key Hierarchy

All dashboard query keys are namespaced under `["dashboard"]` for targeted invalidation:

```
["dashboard"]                          ← dashboardKeys.all
["dashboard", "stats", {period}]       ← dashboardKeys.stats(params)
["dashboard", "charts", {period}]      ← dashboardKeys.charts(params)
["dashboard", "activities", limit]     ← dashboardKeys.activities(limit)
["dashboard", "notifications", limit]  ← dashboardKeys.notifications(limit)
["dashboard", "pending-approvals"]     ← dashboardKeys.pendingApprovals()
["dashboard", "recent-purchase-orders", limit]
["dashboard", "recent-grns", limit]
["dashboard", "low-stock", limit]
["dashboard", "inventory-alerts"]
["dashboard", "recent-adjustments", limit]
["dashboard", "pending-stock-releases"]
```

Calling `queryClient.invalidateQueries({ queryKey: ["dashboard"] })` marks every query in this namespace as stale and triggers a background refetch.

## Error Handling

Each widget and chart card independently handles its own error state:
- On error, renders `ErrorState` with the API error message and a "Try Again" button
- The retry button calls the hook's `.refetch()` method
- Other widgets continue loading independently — one failure doesn't block the page
- The axios interceptor handles 401 → token refresh → request retry automatically
