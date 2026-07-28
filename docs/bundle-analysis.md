# Bundle Analysis — SIMS Lite Frontend

---

## Technology Stack Impact

| Package | Role | Optimization Applied |
|---|---|---|
| `next` 16 | Framework | App Router auto code-splitting per route |
| `recharts` | Charts | `optimizePackageImports` + `React.memo` on all chart components |
| `lucide-react` | Icons | `optimizePackageImports` — only imported icons are bundled |
| `@radix-ui/*` (13 packages) | Headless UI | `optimizePackageImports` — tree-shaken per component |
| `@tanstack/react-query` | Data fetching | Deduplication + tiered cache — reduces re-fetches |
| `@tanstack/react-table` | Tables | Server-side pagination — only current page data loaded |
| `date-fns` | Date formatting | `optimizePackageImports` — function-level imports |
| `zod` | Validation | No change needed — already tree-shakeable |
| `zustand` | State management | Minimal overhead, no optimization needed |
| `axios` | HTTP | No change — already small |

---

## Code Splitting Strategy

Next.js App Router automatically splits bundles at **route segment boundaries**. Each `page.tsx` inside a route group becomes its own chunk:

```
src/app/
├── (auth)/login/page.tsx          → auth bundle
├── (dashboard)/
│   ├── dashboard/page.tsx         → dashboard bundle
│   ├── inventory/page.tsx         → inventory bundle
│   ├── products/page.tsx          → products bundle
│   ├── reports/page.tsx           → reports bundle  (heaviest: recharts)
│   ├── admin/page.tsx             → admin bundle
│   └── notifications/page.tsx    → notifications bundle
```

### Shared Chunks

The following are extracted into shared chunks by Next.js automatically:
- `@tanstack/react-query` (used in every route)
- `@radix-ui/*` primitives (used in layout)
- `lucide-react` (used in layout and UI)

---

## optimizePackageImports Effect

`experimental.optimizePackageImports` in `next.config.ts` tells the bundler to analyze individual named imports from these packages and only include what's actually used:

```ts
experimental: {
  optimizePackageImports: [
    "lucide-react",
    "recharts",
    "date-fns",
    "@radix-ui/react-avatar",
    // ... all 13 @radix-ui/* packages
  ],
},
```

**Expected savings:**
- `lucide-react`: ~800 icons available, only ~40 used → significant reduction
- `recharts`: ~30 chart types available, ~5 used
- `date-fns`: ~200 functions available, ~15 used

---

## Static Asset Caching

Next.js automatically serves all production static build output (`/_next/static/**`) with immutable long-term caching headers (`Cache-Control: public, max-age=31536000, immutable`). Content-hashed chunk names ensure new deployments automatically generate distinct filenames for instant cache invalidation without requiring custom header rules.

---

## Bundle Baseline

> Run `npm run build` and inspect the Route output table to see per-route JS sizes.
> Use `ANALYZE=true npm run build` with `@next/bundle-analyzer` for visual treemaps.

### Adding Bundle Analyzer (Optional)

```bash
npm install --save-dev @next/bundle-analyzer
```

```ts
// next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
export default withBundleAnalyzer(nextConfig);
```
