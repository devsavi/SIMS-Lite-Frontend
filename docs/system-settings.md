# System Settings — SIMS Lite

> [!NOTE]
> System Settings are accessible at `/admin/settings`. Only `admin` and `super_admin` roles have access.

## Overview

The System Settings page provides administrators with a structured, section-based configuration panel for the five core operational domains of SIMS Lite.

---

## Settings Sections

### 1. General System
Controls system-level branding, support contact, session security, and timezone configuration.

| Setting | Type | Default |
|---------|------|---------|
| System Application Title | Text | "SIMS Lite — Smart Inventory System" |
| Support Email Address | Email | "support@simslite.io" |
| Session Inactivity Timeout | Number (minutes) | 60 |
| Default System Timezone | Select | UTC |
| System Display Date Format | Select | YYYY-MM-DD |
| Maintenance Mode | Toggle | false |

### 2. Inventory & Stock
Controls inventory behavior rules, stock reservations, negative balance policy, and barcode formats.

| Setting | Type | Default |
|---------|------|---------|
| Default Low Stock Reorder Threshold | Number | 10 |
| Stock Reservation Expiry | Number (hours) | 48 |
| Barcode Specification | Select (CODE128/EAN13/QR) | CODE128 |
| Enable Stock Reservations | Toggle | true |
| Auto Batch Tracking | Toggle | true |
| Allow Negative Stock | Toggle | false |

### 3. Procurement & PO
Controls purchase order approval thresholds, GRN rules, and supplier performance tracking.

| Setting | Type | Default |
|---------|------|---------|
| Auto-Approve PO Threshold ($) | Number | 500 |
| Default Payment Terms | Select | Net 30 |
| Max Over-Receiving Tolerance (%) | Number | 5 |
| Require GRN Inspection | Toggle | true |
| Enable Supplier Ratings | Toggle | true |

### 4. Notification Alerts
Controls system alert triggers, email notification channels, and digest delivery frequency.

| Setting | Type | Default |
|---------|------|---------|
| Email Digest Frequency | Select (REALTIME/DAILY/WEEKLY) | REALTIME |
| Email Alerts Enabled | Toggle | true |
| Stock Level Alerts | Toggle | true |
| PO Approval Alerts | Toggle | true |
| Security Alerts | Toggle | true |

### 5. Report & Exports
Controls default file generation format, PDF page sizes, and automated scheduling.

| Setting | Type | Default |
|---------|------|---------|
| Default Export Format | Select (excel/csv/pdf) | excel |
| PDF Page Size | Select (A4/LETTER) | A4 |
| Include Header Logo | Toggle | true |
| Scheduled Reports Enabled | Toggle | true |

---

## Unsaved Changes Guard

When a user modifies fields in any section and attempts to switch sections without saving, the `UnsavedChangesDialog` is triggered to confirm:
- **Stay & Keep Editing** — cancel navigation, stay on current form
- **Discard & Leave** — discard changes and switch section

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/admin/settings` | Fetch all settings sections |
| `PUT` | `/api/v1/admin/settings/:section` | Update a specific settings section |

Supported `section` values: `general`, `inventory`, `procurement`, `notifications`, `reports`

---

## Query Hooks

```typescript
const { data: config, isLoading } = useSystemSettings();

const { mutate: updateSection } = useUpdateSettingsSection();
// Example usage:
updateSection({ section: "inventory", data: { ...inventoryConfig, allowNegativeStock: true } });
```

---

## Module Location

```
src/features/admin/settings/
├── api/        settings-api.ts
├── components/ GeneralSettingsForm, InventorySettingsForm, ProcurementSettingsForm,
│               NotificationSettingsForm, ReportSettingsForm, UnsavedChangesDialog
├── hooks/      use-system-settings.ts
├── pages/      SystemSettingsPage.tsx
├── schemas/    settings.schema.ts
└── types/      index.ts
```
