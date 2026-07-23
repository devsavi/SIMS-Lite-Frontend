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

// ---------------------------------------------------------------------------
// Default query / mutation options
// ---------------------------------------------------------------------------

const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10,   // 10 minutes (formerly cacheTime)
      retry: shouldRetry,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
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
