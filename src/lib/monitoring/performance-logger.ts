/**
 * Performance Logger & API Latency Monitor.
 *
 * Logs slow API requests, client rendering lags, and memory warnings.
 */

export interface ApiTimingInfo {
  url: string;
  method: string;
  durationMs: number;
  status: number;
}

const SLOW_API_THRESHOLD_MS = 800;

export function logApiPerformance(info: ApiTimingInfo): void {
  if (info.durationMs >= SLOW_API_THRESHOLD_MS) {
    console.warn(
      `[Slow API Request] ${info.method.toUpperCase()} ${info.url} took ${Math.round(info.durationMs)}ms (Status: ${info.status})`
    );
  }
}

/**
 * Monitors heap memory usage if supported by browser (e.g. Chrome/Edge performance.memory).
 */
export function checkMemoryUsage(): { usedJSHeapSize?: number; jsHeapSizeLimit?: number } | null {
  if (typeof window === "undefined" || !("performance" in window)) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const memory = (performance as any).memory;
  if (!memory) return null;

  const usedMB = Math.round(memory.usedJSHeapSize / (1024 * 1024));
  const limitMB = Math.round(memory.jsHeapSizeLimit / (1024 * 1024));

  if (usedMB / limitMB > 0.85) {
    console.warn(`[Memory Warning] High heap memory usage: ${usedMB}MB / ${limitMB}MB`);
  }

  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
  };
}
