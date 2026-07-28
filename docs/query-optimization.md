# TanStack Query Optimization — SIMS Lite Frontend

---

## 1. Cache Tier Strategy

Different data types have different staleness requirements. Using a single global `staleTime` wastes bandwidth for slow-changing data and risks stale views for fast-changing data.

```ts
// src/lib/query/query-client.ts
export const QUERY_CACHE_TIMES = {
  MASTER_DATA: {
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime:    1000 * 60 * 30, // 30 minutes
  },
  DASHBOARD: {
    staleTime: 1000 * 60 * 5,  // 5 minutes
    gcTime:    1000 * 60 * 15, // 15 minutes
  },
  LIVE_DATA: {
    staleTime: 1000 * 60 * 2,  // 2 minutes
    gcTime:    1000 * 60 * 10, // 10 minutes
  },
  USER_PROFILE: {
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime:    1000 * 60 * 30, // 30 minutes
  },
};
```

| Tier | Data Types | Rationale |
|---|---|---|
| `MASTER_DATA` | Categories, Brands, UOMs, Suppliers, Products | Rarely change; safe to keep cached for 15 minutes |
| `DASHBOARD` | KPI stats, chart data, activity feeds | Changes every few minutes; refresh on window focus |
| `LIVE_DATA` | Inventory items, Stock Releases, Purchase Orders, GRNs | Changes frequently; 2-min stale protects against rapid nav |
| `USER_PROFILE` | Current user, permissions | Session-lifetime; 10 min stale is safe |

---

## 2. Global Query Defaults

```ts
const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: QUERY_CACHE_TIMES.LIVE_DATA.staleTime, // 2 min default
      gcTime:    QUERY_CACHE_TIMES.LIVE_DATA.gcTime,    // 10 min default
      retry: shouldRetry,              // Never retry 4xx errors
      refetchOnWindowFocus: false,     // Explicit manual control
      refetchOnReconnect: true,        // Refresh when connection returns
      refetchOnMount: false,           // Use cache when navigating back
    },
    mutations: {
      retry: false,                    // Never auto-retry mutations
    },
  },
};
```

### Key Decision: `refetchOnMount: false`

Setting `refetchOnMount: false` means when a user navigates back to a page they already visited, the cached data is shown immediately without a background re-fetch (unless the data is stale). This dramatically improves perceived navigation speed for frequently-visited routes.

---

## 3. Retry Policy

```ts
function shouldRetry(failureCount: number, error: unknown): boolean {
  // Never retry 4xx client errors (auth, validation, not found)
  if (isApiError(error) && error.status >= 400 && error.status < 500) {
    return false;
  }
  // Retry up to 2 times for server errors / network failures
  return failureCount < 2;
}
```

---

## 4. Mutation → Invalidation Pattern

After every mutation, the relevant query is invalidated to refresh the list:

```ts
// Example: useCreateCategory
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
  queryClient.setQueryData(categoryKeys.detail(id), updatedData); // Optimistic detail update
}
```

This avoids a full refetch of list data while immediately reflecting the change in both list and detail views.

---

## 5. Query Deduplication

TanStack Query v5 automatically deduplicates concurrent queries with the same key. If two components mount simultaneously and call `useCategories()`, only **one** HTTP request fires. Both components receive the result.

This is critical in the dashboard which mounts multiple widgets simultaneously.

---

## 6. Dashboard Background Refresh

Dashboard queries use `refetchInterval` to keep metrics fresh without manual refresh:

```ts
export function useDashboard() {
  return useQuery({
    staleTime: QUERY_CACHE_TIMES.DASHBOARD.staleTime, // 5 min
    gcTime:    QUERY_CACHE_TIMES.DASHBOARD.gcTime,    // 15 min
    refetchInterval: 1000 * 60 * 5,                  // Background refresh every 5 min
    refetchOnWindowFocus: true,                       // Refresh when user returns to tab
  });
}
```

---

## 7. Query Key Hierarchy

All features use a structured query key factory pattern:

```ts
export const categoryKeys = {
  all:    ["categories"] as const,
  lists:  () => [...categoryKeys.all, "list"] as const,
  list:   (params) => [...categoryKeys.lists(), params] as const,
  detail: (id) => [...categoryKeys.all, "detail", id] as const,
};
```

This allows surgical invalidation (`invalidateQueries({ queryKey: categoryKeys.lists() })`) that affects all list queries (with any params) without touching detail queries.
