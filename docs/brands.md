# Brands

## Overview

Brands represent the manufacturers or labels associated with products.

## Routes

| Route      | Component     | Description         |
|------------|---------------|---------------------|
| `/brands`  | `BrandsPage`  | Brand list + CRUD   |

## Entity Structure

```typescript
interface Brand {
  id: string;
  name: string;           // Required
  slug: string;           // Auto-generated
  description?: string;   // Optional
  logo_url?: string;      // Optional URL
  website_url?: string;   // Optional URL (shown as external link)
  is_active: boolean;
  product_count?: number;
  createdAt: string;
  updatedAt: string;
}
```

## API Endpoints

| Method   | Endpoint                | Description   |
|----------|-------------------------|---------------|
| `GET`    | `/brands`               | List brands   |
| `GET`    | `/brands/:id`           | Get brand     |
| `POST`   | `/brands`               | Create brand  |
| `PATCH`  | `/brands/:id`           | Update brand  |
| `DELETE` | `/brands/:id`           | Soft-delete   |
| `POST`   | `/brands/:id/restore`   | Restore       |

## Features

- Brand name with optional website link (external link icon)
- Logo URL for future image integration
- Active/inactive filtering

## Permissions

```typescript
"brands.view"   // Read
"brands.create" // Create
"brands.edit"   // Update + restore
"brands.delete" // Soft delete
```

Only `ADMIN` / `SUPER_ADMIN` roles have write access.
