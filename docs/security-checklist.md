# SIMS Lite Frontend — Production Security Checklist

Prior to promoting SIMS Lite Frontend to production, verify each requirement in this deployment checklist:

## 1. Network & HTTPS Security
- [x] **HTTPS Enforcement**: Ensure all traffic is served over TLS 1.3/1.2 with strict HTTP to HTTPS redirection.
- [x] **Strict Transport Security (HSTS)**: Header configured with `max-age=63072000; includeSubDomains; preload`.
- [x] **WebSocket TLS**: Ensure `NEXT_PUBLIC_WS_URL` uses secure WebSocket protocol (`wss://`).

## 2. Browser & Header Protections
- [x] **Frame Embedding**: `X-Frame-Options: DENY` and CSP `frame-ancestors 'none'` active to prevent clickjacking.
- [x] **Content-Type Sniffing**: `X-Content-Type-Options: nosniff` enabled.
- [x] **Referrer Policy**: Set to `strict-origin-when-cross-origin`.
- [x] **Permissions Policy**: Restricted sensitive web APIs (`camera=(), microphone=(), geolocation=(), payment=()`).
- [x] **XSS Protection Header**: `X-XSS-Protection: 1; mode=block`.

## 3. Token & Storage Handling
- [x] **Access Token In-Memory**: Access tokens reside exclusively in memory.
- [x] **Complete Logout Purge**: Logout action clears memory, `localStorage` (`__sims_rt__`, `sims-session`), `sessionStorage`, and React Query cache.
- [x] **Multi-Tab Logout Sync**: Active storage listener immediately terminates all open tabs on session logout.

## 4. Input & File Upload Safety
- [x] **XSS Escaping**: User-rendered dynamic text nodes use standard React JSX escaping or `escapeHtml()`.
- [x] **Zero Unsanitized HTML**: No usages of `dangerouslySetInnerHTML`.
- [x] **File Extension & MIME Validation**: Upload components restrict accepted file extensions and enforce max size caps (2MB for logos, 10MB for documents).
- [x] **Path Traversal Prevention**: Filenames sanitized via `sanitizeFilename()`.

## 5. Logging & Diagnostics
- [x] **Sensitive Data Redaction**: Production logger redacts tokens, passwords, and sensitive keys.
- [x] **Environment Validation**: `env.ts` enforces non-empty `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL`.
- [x] **Clean Error Boundaries**: Fallback error UI prevents stack trace disclosure in production.
