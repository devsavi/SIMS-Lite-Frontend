# Development Setup

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | 20+ |
| npm | 10+ |
| Git | Any recent version |

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd sims-lite-frontend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your backend URLs:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=SIMS Lite
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

### 3. Run the development server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

> **Note:** The dev server must be started manually in your terminal. Do not use
> watch commands inside scripts.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server (Next.js with HMR) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint with zero-warning policy |
| `npm run format` | Prettier format all source files |
| `npm run format:check` | Check formatting without writing |
| `npm run type-check` | TypeScript strict type checking |

## Environment Variables

All `NEXT_PUBLIC_*` variables are embedded at build time and exposed to the browser.
Never put secrets in `NEXT_PUBLIC_` variables.

The application validates required variables at startup via `src/lib/env.ts` and will
throw a descriptive error if any are missing, rather than silently failing.

## Code Quality

### ESLint

The project uses a flat ESLint config (`eslint.config.mjs`) with:
- `next/core-web-vitals` ruleset
- TypeScript-specific rules
- Zero-warning policy in CI (`--max-warnings 0`)

### Prettier

Configured in `.prettierrc` with `prettier-plugin-tailwindcss` for automatic
Tailwind class sorting.

### TypeScript

Strict mode is enabled in `tsconfig.json`. All code must pass `tsc --noEmit` before
merging.

## Adding shadcn/ui Components

```bash
npx shadcn add <component-name>
```

Components are placed in `src/app/components/ui/` per `components.json`.

## Production Build

```bash
npm run type-check   # Must pass
npm run lint         # Must pass with zero warnings
npm run build        # Must succeed
```
