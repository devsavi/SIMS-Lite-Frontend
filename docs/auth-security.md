# SIMS Lite Frontend — Authentication & Authorization Security

## 1. Authentication Lifecycle & Token Management

SIMS Lite Frontend implements a dual-token authentication pattern (Short-lived Access Token + Rotation-enabled Refresh Token).

### Token Storage Strategy

* **Access Token**: Kept **exclusively in memory** inside `token.ts`. It is never stored in `localStorage` or standard cookies, protecting it from persistent XSS extraction.
* **Refresh Token**: Kept in `localStorage` under a non-obvious key (`__sims_rt__`). Used only during automatic token rotation and initial app hydration in `SessionProvider`.

---

## 2. Authentication Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant App as SessionProvider / React App
    participant Store as Auth Store (Zustand)
    participant Client as Axios API Client
    participant API as Backend Auth API

    User->>App: Submits Login Form
    App->>API: POST /api/v1/auth/login
    API-->>App: Returns { access_token, refresh_token, user }
    App->>Store: login(user, tokens)
    Note over Store: Stores Access Token in Memory<br/>Stores Refresh Token in localStorage
    App->>User: Redirects to /dashboard

    Note over Client: Periodic or 401 Interception
    Client->>API: POST /api/v1/auth/refresh
    API-->>Client: Returns new { access_token, refresh_token }
    Client->>Store: Updates access token in memory & rotated refresh token
```

---

## 3. Authorization & RBAC Matrix

Permissions follow a domain-action model (`domain.action`). Roles are mapped explicitly in `src/lib/auth/permissions.ts`:

| Permission Domain | `super_admin` / `admin` | `warehouse_manager` | `procurement_officer` | `stock_clerk` | `viewer` |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Dashboard** (`dashboard.view`) | ✓ | ✓ | ✓ | ✓ | ✓ |
| **User Admin** (`users.*`) | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Products** (`products.*`) | ✓ | ✓ (view) | ✓ (view) | ✓ (view) | ✓ (view) |
| **Purchase Orders** (`purchase_orders.*`) | ✓ | ✓ (view) | ✓ (create/edit) | ✓ (view) | ✗ |
| **GRN** (`grn.*`) | ✓ | ✓ (create/edit) | ✓ (create/edit) | ✓ (create/edit) | ✗ |
| **Inventory Adjustments** (`inventory.adjust`) | ✓ | ✓ | ✗ | ✓ | ✗ |
| **Stock Release Approval** (`stock_release.approve`) | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Reports Export** (`reports.export`) | ✓ | ✗ | ✓ | ✗ | ✗ |
| **System Settings** (`settings.*`) | ✓ | ✗ | ✗ | ✗ | ✗ |

---

## 4. Multi-Tab Session Synchronization Sequence

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant TabA as Browser Tab A
    participant Storage as localStorage (__sims_rt__)
    participant TabB as Browser Tab B

    User->>TabA: Clicks Logout
    TabA->>Storage: removeItem("__sims_rt__")
    TabA->>TabA: Clears memory, React-Query cache & redirects to /login
    Storage-->>TabB: Fires window "storage" event
    TabB->>TabB: Detects empty refresh token
    TabB->>TabB: Calls clearSession() & redirects to /login
```
