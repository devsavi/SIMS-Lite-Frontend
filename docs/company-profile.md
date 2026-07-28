# Company Profile — SIMS Lite

> [!NOTE]
> The Company Profile page is accessible at `/admin/company`. It requires `settings.edit` permission (admin or super_admin role).

## Overview

The Company Profile page allows administrators to configure official organization information that appears on purchase orders, GRNs, reports, and print documents.

---

## Configurable Fields

| Field | Required | Description |
|-------|----------|-------------|
| Company Legal Name | ✅ | Full registered business name |
| Business Registration No. | ✅ | Official company BRN/CRN |
| Tax Registration No. | ❌ | VAT number, TIN, or GST |
| Official Email | ✅ | Primary contact email address |
| Contact Phone | ✅ | Business phone number |
| Website URL | ❌ | Company web address (https:// format) |
| Street Address | ✅ | Physical address line |
| City | ✅ | City of operations |
| State / Province | ✅ | State or province |
| Postal Code | ✅ | ZIP or postal code |
| Country | ✅ | Country of registration |
| Base Currency | ✅ | System currency code (USD, EUR, LKR, etc.) |
| Company Logo | ❌ | Uploaded via file service |

---

## Logo Upload

The `LogoUploader` component provides drag-and-drop image upload functionality with the following constraints:
- Accepted formats: PNG, JPEG, SVG, WebP
- Max recommended resolution: high-res (the component does not enforce size)
- Backend endpoint: `POST /api/v1/admin/company/logo` (falls back to `URL.createObjectURL` in mock mode)

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/admin/company` | Fetch current company profile |
| `PUT` | `/api/v1/admin/company` | Save updated company profile |
| `POST` | `/api/v1/admin/company/logo` | Upload company logo file |

---

## Query Hooks

```typescript
const { data: profile, isLoading } = useCompanyProfile();
const { mutate: updateProfile, isPending } = useUpdateCompanyProfile();
const { mutate: uploadLogo } = useUploadCompanyLogo();
```

---

## Module Location

```
src/features/admin/company/
├── api/        company-api.ts
├── components/ CompanyProfileForm.tsx, LogoUploader.tsx
├── hooks/      use-company-profile.ts
├── pages/      CompanyProfilePage.tsx
├── schemas/    company.schema.ts
└── types/      index.ts
```
