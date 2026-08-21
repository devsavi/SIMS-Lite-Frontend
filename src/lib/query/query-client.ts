import {
  QueryClient,
  type QueryClientConfig,
} from "@tanstack/react-query";
import { isApiError } from "@/lib/api/client";

// ---------------------------------------------------------------------------
// Retry policy: do not retry on 4xx client errors
// ---------------------------------------------------------------------------

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (isApiError(error) && error.status >= 400 && error.status < 500) {
    return false;
  }
  return failureCount < 2;
}

/**
 * Standardised caching tiers for enterprise performance:
 * - MASTER_DATA: Static reference data (Categories, Brands, UOMs, Suppliers)
 * - DASHBOARD: Executive summaries & metrics
 * - LIVE_DATA: Inventory, releases, stock adjustments
 * - USER_PROFILE: Current user session, permissions
 */
export const QUERY_CACHE_TIMES = {
  MASTER_DATA: {
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 30,    // 30 minutes
    refetchOnMount: "always",   // Refetch on mount ONLY IF stale/invalidated
    refetchOnWindowFocus: true, // Refetch when tab regains focus if stale
  },
  DASHBOARD: {
    staleTime: 1000 * 60 * 5,  // 5 minutes
    gcTime: 1000 * 60 * 15,    // 15 minutes
    refetchOnMount: true,      // Refetch on mount if invalidated/stale
    refetchOnWindowFocus: true,
  },
  LIVE_DATA: {
    staleTime: 1000 * 60 * 2,  // 2 minutes
    gcTime: 1000 * 60 * 10,    // 10 minutes
    refetchOnMount: true,      // Refetch on mount if invalidated/stale
    refetchOnWindowFocus: true,
  },
  USER_PROFILE: {
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30,    // 30 minutes
    refetchOnMount: true,
  },
} as const;

// ---------------------------------------------------------------------------
// Default query / mutation options
// ---------------------------------------------------------------------------

const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: QUERY_CACHE_TIMES.LIVE_DATA.staleTime,
      gcTime: QUERY_CACHE_TIMES.LIVE_DATA.gcTime,
      retry: shouldRetry,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,     // Let stale/invalidated queries refetch on mount
    },
    mutations: {
      retry: false,
    },
  },
};

// ---------------------------------------------------------------------------
// Singleton factory (avoids re-creation on HMR in dev)
// ---------------------------------------------------------------------------

let _queryClient: QueryClient | null = null;

export function getQueryClient(): QueryClient {
  if (!_queryClient) {
    _queryClient = new QueryClient(queryClientConfig);
  }
  return _queryClient;
}

export function makeQueryClient(): QueryClient {
  return new QueryClient(queryClientConfig);
}
