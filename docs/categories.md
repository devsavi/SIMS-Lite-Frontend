# Categories

## Overview

Categories organise products into a hierarchy. They support parent/child relationships for a tree structure.

## Routes

| Route          | Component         | Description            |
|----------------|-------------------|------------------------|
| `/categories`  | `CategoriesPage`  | Category list + CRUD   |

## Entity Structure

```typescript
interface Category {
  id: string;
  name: string;          // Required
  slug: string;          // Auto-generated
  description?: string;  // Optional
  parent_id?: string;    // FK → Category (self-referential)
  parent?: CategorySummary;
  is_active: boolean;
  product_count?: number;
  createdAt: string;
  updatedAt: string;
}
```

## API Endpoints

| Method   | Endpoint                   | Description            |
|----------|----------------------------|------------------------|
| `GET`    | `/categories`              | List categories        |
| `GET`    | `/categories/:id`          | Get category           |
| `POST`   | `/categories`              | Create category        |
| `PATCH`  | `/categories/:id`          | Update category        |
| `DELETE` | `/categories/:id`          | Soft-delete            |
| `POST`   | `/categories/:id/restore`  | Restore                |

## Hierarchy Support

Categories support a parent/child hierarchy:
- Select a **parent category** or leave blank for a top-level category
- Editing a category excludes itself from the parent options (prevents circular refs)
- Parent category name is shown in the list table

## Permissions

```typescript
"categories.view"   // Read
"categories.create" // Create
"categories.edit"   // Update + restore
"categories.delete" // Soft delete
```

Only `ADMIN` / `SUPER_ADMIN` roles have write access.
