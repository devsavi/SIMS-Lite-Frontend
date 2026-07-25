# Units of Measure (UoMs)

## Overview

Units of Measure define how product quantities are counted — e.g. Kilogram, Piece, Litre.

## Routes

| Route    | Component   | Description        |
|----------|-------------|--------------------|
| `/uoms`  | `UomsPage`  | UoM list + CRUD    |

## Entity Structure

```typescript
interface UnitOfMeasure {
  id: string;
  name: string;         // Required, e.g. "Kilogram"
  symbol: string;       // Required, e.g. "kg"
  description?: string; // Optional
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## API Endpoints

| Method   | Endpoint              | Description    |
|----------|-----------------------|----------------|
| `GET`    | `/uoms`               | List UoMs      |
| `GET`    | `/uoms/:id`           | Get UoM        |
| `POST`   | `/uoms`               | Create UoM     |
| `PATCH`  | `/uoms/:id`           | Update UoM     |
| `DELETE` | `/uoms/:id`           | Soft-delete    |
| `POST`   | `/uoms/:id/restore`   | Restore        |

## Display

The **Symbol** field is displayed in a monospace code style (`kg`, `pcs`, `L`) throughout the application, including:
- UoMs list table
- Product form dropdown (e.g. "Kilogram (kg)")
- Product detail page
- Inventory tables

## Permissions

Only `ADMIN` / `SUPER_ADMIN` roles have write access. UoMs use the `products.*` permissions since they are part of the product domain:

```typescript
"products.view"   // View UoMs
"products.create" // Create UoMs
"products.edit"   // Update + restore
"products.delete" // Soft delete
```
