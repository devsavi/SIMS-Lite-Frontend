# Folder Structure

```
sims-lite-frontend/
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn/ui primitives
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── form.tsx
│   │   │   │   ├── skeleton.tsx
│   │   │   │   ├── avatar.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── toaster.tsx
│   │   │   │   └── use-toast.ts
│   │   │   ├── common/               # Shared patterns (DataTable, PageHeader...)
│   │   │   ├── layout/               # Layout wrappers
│   │   │   │   ├── providers.tsx     # Theme + Query providers
│   │   │   │   ├── app-layout.tsx    # Sidebar + header shell
│   │   │   │   └── auth-layout.tsx   # Centred auth wrapper
│   │   │   └── charts/               # Recharts wrappers (Phase 2)
│   │   ├── layout.tsx                # Root layout (fonts, metadata)
│   │   ├── page.tsx                  # Landing / checklist page
│   │   └── globals.css               # Design tokens + base styles
│   │
│   ├── features/                     # Feature modules (vertical slices)
│   │   ├── auth/                     # Phase 1
│   │   ├── dashboard/                # Phase 2
│   │   ├── users/                    # Phase 3
│   │   ├── products/                 # Phase 4
│   │   ├── suppliers/                # Phase 5
│   │   ├── procurement/              # Phase 6
│   │   ├── inventory/                # Phase 7
│   │   ├── stock-release/            # Phase 8
│   │   ├── notifications/            # Phase 9
│   │   └── reports/                  # Phase 10
│   │
│   ├── hooks/                        # Shared custom hooks
│   │   ├── use-theme.ts              # Theme utility
│   │   ├── use-debounce.ts           # Search debouncing
│   │   └── use-local-storage.ts      # Persistent state
│   │
│   ├── lib/                          # Core infrastructure
│   │   ├── api/
│   │   │   └── client.ts             # Axios + interceptors
│   │   ├── auth/
│   │   │   └── index.ts              # Role types + helpers
│   │   ├── query/
│   │   │   └── query-client.ts       # TanStack Query config
│   │   ├── websocket/
│   │   │   └── ws-client.ts          # WebSocket client
│   │   └── env.ts                    # Environment validation
│   │
│   ├── stores/                       # Zustand stores
│   │   ├── theme.store.ts
│   │   ├── session.store.ts
│   │   ├── sidebar.store.ts
│   │   ├── notifications.store.ts
│   │   └── index.ts
│   │
│   ├── types/
│   │   └── index.ts                  # Shared TypeScript types
│   │
│   ├── schemas/
│   │   └── index.ts                  # Shared Zod schemas
│   │
│   └── utils/
│       ├── cn.ts                     # Tailwind class merge
│       ├── format.ts                 # Date, currency, string helpers
│       └── index.ts
│
├── docs/
│   ├── frontend-architecture.md
│   ├── development-setup.md
│   └── folder-structure.md           # This file
│
├── public/                           # Static assets
├── .env.local                        # Local environment (gitignored)
├── .env.example                      # Environment template
├── .prettierrc                       # Prettier config
├── .prettierignore
├── components.json                   # shadcn/ui config
├── eslint.config.mjs                 # ESLint flat config
├── next.config.ts                    # Next.js config
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

## Naming Conventions

| Entity | Convention | Example |
|---|---|---|
| Components | PascalCase | `UserCard.tsx` |
| Hooks | camelCase with `use` prefix | `useDebounce.ts` |
| Stores | camelCase with `.store` suffix | `session.store.ts` |
| Utilities | camelCase | `format.ts` |
| Types | PascalCase | `AuthUser` |
| Constants | SCREAMING_SNAKE_CASE | `ROLE_LABELS` |
| CSS classes | Tailwind utilities only | `bg-background text-foreground` |

## Import Alias

All imports use the `@/` alias pointing to `src/`:

```typescript
import { Button } from "@/app/components/ui/button";
import { cn } from "@/utils/cn";
import { useSessionStore } from "@/stores";
```
