# SIMS Lite Frontend — Enterprise Deployment Security Guide

## 1. Environment Variable Protection

SIMS Lite Frontend isolates environment variables between client-exposed variables and server build variables.

* **Allowed Client Variables**: Only environment variables prefixed with `NEXT_PUBLIC_` are bundled into the client build.
* **Prohibited Secrets**: Never place private backend secrets (e.g. database credentials, private API keys, JWT signing keys) into `.env.production` or any `NEXT_PUBLIC_*` variable.

### Production Environment Schema (`.env.production`)

```ini
# Application Name
NEXT_PUBLIC_APP_NAME="SIMS Lite"

# Secure API Production Gateway (HTTPS Required)
NEXT_PUBLIC_API_URL="https://api.simslite.com/api/v1"

# Secure WebSocket Production Endpoint (WSS Required)
NEXT_PUBLIC_WS_URL="wss://api.simslite.com/api/v1/ws"
```

---

## 2. Reverse Proxy & Container Security Configuration

When deploying via Docker or behind an Nginx / AWS ALB / Cloudflare reverse proxy, configure the proxy to preserve or enforce HTTP security headers:

### Recommended Nginx Server Block Headers

```nginx
# Security Headers
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' ws: wss: http: https:; font-src 'self' data:; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';" always;
```

---

## 3. Production Build & Source Map Rules

In production deployment builds:
1. `reactStrictMode` must remain `true` in `next.config.ts`.
2. Debug tooling (such as `@tanstack/react-query-devtools`) is automatically excluded or gated behind production flags.
3. Verification commands (`npm run type-check`, `npm run lint`, `npm test`) must pass cleanly in CI/CD build pipelines before container deployment.
