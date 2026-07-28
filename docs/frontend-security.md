# SIMS Lite Frontend — Enterprise Security Architecture & Threat Model

## 1. Overview & Threat Model

SIMS Lite Frontend is built following defense-in-depth security principles. The client architecture assumes the browser environment is fundamentally untrusted. Client-side state, local storage, and rendering logic are hardened to mitigate common web security attack vectors.

### Primary Threat Vectors & Mitigations

| Threat | Risk Level | Primary Defense / Mitigation Strategy |
| :--- | :--- | :--- |
| **XSS (Cross-Site Scripting)** | High | React auto-escaping, strict CSP headers, zero `dangerouslySetInnerHTML`, input sanitization via `escapeHtml()`. |
| **Session Hijacking / Token Theft** | High | In-memory Access Token storage, HttpOnly strategy for Refresh Tokens, short token lifespan (15m). |
| **Unauthorized Action Execution** | High | Multi-layered RBAC (`PermissionGuard`, `can()` helpers, route-level `ProtectedRoute`). |
| **Path Traversal / Overwrite** | Medium | Filename sanitization (`sanitizeFilename()`), MIME type and extension validation in uploaders. |
| **Sensitive Data Exposure** | Medium | Log redaction (`redactSensitiveData()`), suppression of debug logs in production builds. |
| **Frame Embedding / Clickjacking** | Medium | HTTP `X-Frame-Options: DENY` and CSP `frame-ancestors 'none'`. |

---

## 2. Client-Server Trust Boundary

```mermaid
graph TD
    subgraph Browser Client (Untrusted Boundary)
        UI[React UI Components]
        Guard[PermissionGuard / ProtectedRoute]
        AuthStore[Zustand Auth Store]
        ClientApi[Axios API Client]
    end

    subgraph Security Layer
        CSP[CSP / HSTS Headers]
        Sanitizer[Sanitizer / Logger]
    end

    subgraph Backend Server (Authoritative Boundary)
        Gateway[API Gateway / CORS]
        AuthSvc[Backend Auth Service]
        RBACSvc[Backend Permission Enforcer]
        DB[(Database)]
    end

    UI --> Guard
    Guard --> AuthStore
    AuthStore --> ClientApi
    ClientApi --> Security Layer
    Security Layer --> Gateway
    Gateway --> AuthSvc
    AuthSvc --> RBACSvc
    RBACSvc --> DB
```

> [!IMPORTANT]
> The frontend UI and route guards provide a smooth user experience by hiding unauthorized actions. However, **the backend server is always the authoritative trust boundary** and performs strict token validation and permission checks on every API request.

---

## 3. Defense-in-Depth Measures

1. **Strict Content Security Policy (CSP)**: Restricts scripts, frames, and dynamic code execution (`object-src 'none'`, `frame-ancestors 'none'`).
2. **Multi-Tab Session Sync**: Storage event listeners ensure immediate session invalidation across all open tabs upon logout.
3. **Data Redaction**: Sensitive objects (passwords, JWTs, keys) are stripped before diagnostic logging.
4. **File Input Safety**: Uploaded files undergo MIME type verification, extension validation, file size enforcement (<=2MB for logos), and filename sanitization.
