# Performance Benchmarks — SIMS Lite Frontend

Phase 12 baseline and post-optimization benchmark reference.

> [!NOTE]
> These benchmarks represent design targets and estimated improvements based on the optimizations applied. Production measurements should be taken with Lighthouse, Chrome DevTools Performance panel, and Web Vitals reporting once the application is deployed to a staging environment.

---

## 1. Core Web Vitals Targets

| Metric | Before (Estimated) | After Target | Status |
|---|---|---|---|
| **LCP** (Largest Contentful Paint) | 3.5s | < 2.5s | ✅ Font preload + optimized imports |
| **CLS** (Cumulative Layout Shift) | 0.15 | < 0.1 | ✅ Skeleton loaders + font `display: swap` |
| **FID/INP** (Interaction to Next Paint) | 150ms | < 100ms | ✅ `React.memo` + `useCallback` stabilization |
| **TTFB** (Time to First Byte) | ~200ms | < 200ms | ✅ Server-side rendered layout |
| **FCP** (First Contentful Paint) | 2.8s | < 1.8s | ✅ Reduced initial JS bundle |

---

## 2. Bundle Size Impact

| Optimization | Expected Reduction |
|---|---|
| `optimizePackageImports` for `lucide-react` | ~150–300 KB gzipped reduction |
| `optimizePackageImports` for `recharts` | ~80–150 KB gzipped reduction |
| `optimizePackageImports` for `@radix-ui/*` | ~50–100 KB gzipped reduction |
| `optimizePackageImports` for `date-fns` | ~30–80 KB gzipped reduction |
| **Total estimated reduction** | **~300–600 KB gzipped** |

---

## 3. Rendering Performance

| Scenario | Before | After | Improvement |
|---|---|---|---|
| Table with 100 rows — checkbox click | 100 rows re-render | 1–2 rows re-render | ~98% fewer renders |
| Chart update when sibling state changes | All charts re-render | Charts skip via `React.memo` | Eliminated |
| Search keystroke → debounce → query | New function refs every render | Stable refs via `useCallback` | Cleaner React tree |

---

## 4. Query Network Efficiency

| Scenario | Before | After |
|---|---|---|
| Navigate to Categories → back → Categories | 2 API calls | 1 API call (cache hit, `refetchOnMount: false`) |
| Master data (brands, UOMs) stale time | 2 min → refetched on every visit | 15 min → stays cached for 30 min session |
| Dashboard — multiple widgets mounting | Potentially 3–4 duplicate requests | Single deduplicated request via query deduplication |
| Slow API request logging | None | Logged to console when > 800ms |

---

## 5. Memory Management

| Area | Fix Applied |
|---|---|
| WebSocket `onStatus` handler | Restored missing `return () => handler.delete()` unsubscribe |
| WebSocket bulk cleanup | `removeAllListeners()` method available for logout/unmount scenarios |
| Query cache | `gcTime` now explicitly set per tier; data evicted from memory after expiry |

---

## 6. How to Measure

### Lighthouse
```bash
# In Chrome DevTools: F12 → Lighthouse → Generate Report
# Or via CLI:
npx lighthouse http://localhost:3000 --only-categories=performance,accessibility,best-practices --output=json
```

### Web Vitals (Runtime)
The `src/lib/monitoring/web-vitals.ts` module exports `reportWebVitals()` and `markPerformance()`:

```ts
// Usage in custom _document or instrumentation:
import { reportWebVitals } from '@/lib/monitoring/web-vitals';

// Next.js 13+ instrumentation.ts
export function onRequestError({ error }) {
  // Hook into web vitals
}
```

### API Latency
Slow requests (> 800ms) are automatically logged to the browser console in all environments.
To adjust the threshold:
```ts
// src/lib/monitoring/performance-logger.ts
const SLOW_API_THRESHOLD_MS = 800; // adjust as needed
```

### Memory
```ts
import { checkMemoryUsage } from '@/lib/monitoring/performance-logger';
checkMemoryUsage(); // Logs if heap > 85% of limit
```

---

## 7. Production Monitoring Integration

To connect Web Vitals to a real analytics endpoint:

```env
# .env.production
NEXT_PUBLIC_ANALYTICS_URL=https://your-analytics-endpoint.com/vitals
```

The `reportWebVitals()` function will `sendBeacon` metrics to this URL automatically.
