/**
 * Web Vitals & Runtime Performance Monitoring for SIMS Lite Frontend.
 *
 * Captures Core Web Vitals (LCP, FID, CLS, TTFB, INP) and client-side performance marks.
 */

export interface Metric {
  id: string;
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  entries: PerformanceEntry[];
}

/**
 * Report Web Vitals metric to analytics or logger.
 * Can be hooked into Next.js reportWebVitals or custom observer.
 */
export function reportWebVitals(metric: Metric): void {
  if (process.env.NODE_ENV === "development") {
    const color =
      metric.rating === "good"
        ? "color: green"
        : metric.rating === "needs-improvement"
        ? "color: orange"
        : "color: red";

    console.log(
      `%c[Web Vitals] ${metric.name}: ${Math.round(metric.value * 100) / 100} (${metric.rating})`,
      color
    );
  }

  // Send to analytics endpoint if configured
  if (typeof window !== "undefined" && window.navigator?.sendBeacon) {
    const analyticsUrl = process.env.NEXT_PUBLIC_ANALYTICS_URL;
    if (analyticsUrl) {
      window.navigator.sendBeacon(
        analyticsUrl,
        JSON.stringify({
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          id: metric.id,
          page: window.location.pathname,
          timestamp: Date.now(),
        })
      );
    }
  }
}

/**
 * High-precision timer mark helper for benchmarking expensive operations.
 */
export function markPerformance(name: string): () => void {
  if (typeof performance === "undefined") return () => {};

  const markStart = `${name}-start`;
  const markEnd = `${name}-end`;
  performance.mark(markStart);

  return () => {
    try {
      performance.mark(markEnd);
      performance.measure(name, markStart, markEnd);
      const entries = performance.getEntriesByName(name, "measure");
      const lastEntry = entries[entries.length - 1];
      if (lastEntry && process.env.NODE_ENV === "development") {
        console.log(`[Perf Measure] ${name}: ${lastEntry.duration.toFixed(2)}ms`);
      }
      performance.clearMarks(markStart);
      performance.clearMarks(markEnd);
      performance.clearMeasures(name);
    } catch {
      // Ignore performance measurement errors
    }
  };
}
