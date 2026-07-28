# System Administration — SIMS Lite Phase 10

> [!IMPORTANT]
> The Administration module is restricted to users with `admin` or `super_admin` roles. Non-admin users attempting to access these routes will see an access-restricted error screen.

## Overview

The System Administration module provides a centralized area for all administrative configuration and system governance in SIMS Lite. It is accessible from the collapsible **Administration** section in the sidebar.

---

## Administration Module Architecture

```mermaid
graph TD
    Sidebar[AppSidebar — Administration Group] --> UN[/admin/users]
    Sidebar --> CP[/admin/company]
    Sidebar --> SS[/admin/settings]
    Sidebar --> EC[/admin/email]
    Sidebar --> NS[/admin/sequences]
    Sidebar --> AL[/admin/activity]
    Sidebar --> AT[/admin/audit]

    UN --> PG1[PermissionGuard: users.view]
    CP --> PG2[PermissionGuard: settings.edit]
    SS --> PG3[PermissionGuard: settings.view]
    EC --> PG4[PermissionGuard: settings.edit]
    NS --> PG5[PermissionGuard: settings.edit]
    AL --> PG6[PermissionGuard: settings.view]
    AT --> PG7[PermissionGuard: settings.view]

    PG1 --> UsersPage
    PG2 --> CompanyProfilePage
    PG3 --> SystemSettingsPage
    PG4 --> EmailConfigPage
    PG5 --> NumberingSequencesPage
    PG6 --> ActivityLogPage
    PG7 --> AuditTrailPage
```

---

## Sub-module Summary

| Module | Route | Permission Required | Description |
|--------|-------|---------------------|-------------|
| User Management | `/admin/users` | `users.view` | CRUD users, role assignment, activation |
| Company Profile | `/admin/company` | `settings.edit` | Organization branding and identity |
| System Settings | `/admin/settings` | `settings.view` | Global system configuration |
| Email Config | `/admin/email` | `settings.edit` | SMTP gateway and sender settings |
| Numbering Sequences | `/admin/sequences` | `settings.edit` | Document auto-numbering rules |
| Activity Log | `/admin/activity` | `settings.view` | Immutable system event audit log |
| Audit Trail | `/admin/audit` | `settings.view` | Field-level diff history |

---

## Administration Navigation

The sidebar renders an **Administration** section for users with `settings.view` permission. It includes a collapsible group with all sub-modules listed as indented links.

In **collapsed mode**, the section is represented by a single shield icon that routes to `/admin/users`.

---

## PermissionGuard Component

All administration pages are wrapped in a `<PermissionGuard>` component that evaluates the current user's role before rendering content:

```tsx
<PermissionGuard requiredPermission="settings.view">
  <SystemSettingsPage />
</PermissionGuard>
```

If unauthorized, a styled access-restricted screen is shown with a link back to Dashboard.

---

## Feature Module Locations

```
src/features/admin/
├── shared/
│   └── components/   AdminNavTabs.tsx, PermissionGuard.tsx
├── users/            User CRUD, role assignment, password reset
├── company/          Company profile, logo upload
├── settings/         5 section settings forms + unsaved changes guard
├── email/            SMTP configuration + test connection
├── sequences/        PO, GRN, Release numbering rules
├── activity/         Activity log viewer with filters
└── audit/            Immutable audit trail with diff viewer
```

---

## Route Aliases

For backwards compatibility, two legacy routes redirect to admin sub-modules:
- `/users` → redirects to `/admin/users`
- `/settings` → redirects to `/admin/settings`

---

## TanStack Query Cache Keys

| Feature | Query Key |
|---------|-----------|
| Users List | `["admin-users", "list", filters]` |
| User Detail | `["admin-users", "detail", id]` |
| Company Profile | `["company-profile"]` |
| System Settings | `["system-settings"]` |
| Email Config | `["email-config"]` |
| Sequences | `["numbering-sequences"]` |
| Activity Log | `["activity-logs", "list", filters]` |
| Audit Trail | `["audit-trail", "list", filters]` |
