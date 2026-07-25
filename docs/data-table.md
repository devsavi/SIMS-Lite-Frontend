# SIMS Lite — DataTable

## Overview

The `DataTable` component is built on **TanStack Table v8** and provides a full-featured, type-safe enterprise table.

## Features

| Feature | Client-side | Server-side |
|---|---|---|
| Pagination | ✓ | ✓ |
| Sorting | ✓ | ✓ (passes state) |
| Multi-sort | ✓ | ✓ |
| Column filters | ✓ | ✗ |
| Column visibility | ✓ | ✓ |
| Row selection | ✓ | ✓ |
| Bulk actions | ✓ | ✓ |
| Loading state | ✓ | ✓ |
| Empty state | ✓ | ✓ |
| Error state | ✓ | ✓ |
| Sticky header | CSS-level | CSS-level |

## Basic Usage

```tsx
import { DataTable, type ColumnDef } from "@/components/common"

interface Product {
  id: string
  name: string
  sku: string
  stock: number
}

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "sku",
    header: "SKU",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => (
      <StatusBadge variant={row.original.stock === 0 ? "out-of-stock" : "in-stock"} />
    ),
  },
]

function ProductsTable() {
  return (
    <DataTable
      columns={columns}
      data={products}
      loading={isLoading}
      error={error}
      onRetry={refetch}
      emptyTitle="No products"
      emptyDescription="Add your first product to get started."
    />
  )
}
```

## Server-Side Pagination

```tsx
const [page, setPage] = React.useState(1)
const [pageSize, setPageSize] = React.useState(20)
const [sorting, setSorting] = React.useState<SortingState>([])

const { data, isLoading, error, refetch } = useProducts({
  page,
  pageSize,
  ordering: sorting.map(s => `${s.desc ? "-" : ""}${s.id}`).join(","),
})

<DataTable
  columns={columns}
  data={data?.results ?? []}
  loading={isLoading}
  error={error}
  onRetry={refetch}
  serverSide
  totalRows={data?.count ?? 0}
  page={page}
  pageSize={pageSize}
  pageSizeOptions={[10, 20, 50, 100]}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
  sorting={sorting}
  onSortingChange={setSorting}
/>
```

## Row Selection + Bulk Actions

```tsx
const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

<DataTable
  columns={columns}
  data={products}
  rowSelection={rowSelection}
  onRowSelectionChange={setRowSelection}
  bulkActions={(selectedRows) => (
    <>
      <Button variant="outline" onClick={() => bulkActivate(selectedRows.map(r => r.original.id))}>
        Activate
      </Button>
      <Button variant="destructive" onClick={() => bulkDelete(selectedRows.map(r => r.original.id))}>
        Delete
      </Button>
    </>
  )}
/>
```

## Column Visibility Toggle

```tsx
<DataTable
  columns={columns}
  data={products}
  showColumnToggle  // renders the Columns button above the table
/>
```

## Column Definitions

```tsx
const columns: ColumnDef<Product>[] = [
  // Basic accessor
  { accessorKey: "name", header: "Name" },

  // Custom header
  {
    accessorKey: "price",
    header: ({ column }) => (
      <button onClick={() => column.toggleSorting()}>Price</button>
    ),
  },

  // Custom cell
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => <ProductActions product={row.original} />,
  },
]
```

## Props Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `columns` | `ColumnDef<T>[]` | required | Column definitions |
| `data` | `T[]` | required | Row data |
| `loading` | `boolean` | `false` | Shows skeleton rows |
| `error` | `unknown` | — | Shows error state |
| `onRetry` | `() => void` | — | Retry button callback |
| `serverSide` | `boolean` | `false` | Enable server-side ops |
| `totalRows` | `number` | — | Total rows (server-side) |
| `page` | `number` | `1` | Current page (1-indexed) |
| `pageSize` | `number` | `20` | Rows per page |
| `onPageChange` | `(page) => void` | — | Page change handler |
| `onPageSizeChange` | `(size) => void` | — | Page size change handler |
| `sorting` | `SortingState` | — | External sorting state |
| `onSortingChange` | `OnChangeFn<SortingState>` | — | Sorting change handler |
| `multiSort` | `boolean` | `true` | Allow multi-column sort |
| `rowSelection` | `RowSelectionState` | — | External selection state |
| `onRowSelectionChange` | `OnChangeFn<RowSelectionState>` | — | Selection change handler |
| `bulkActions` | `(rows) => ReactNode` | — | Bulk action toolbar |
| `showColumnToggle` | `boolean` | `false` | Show column visibility toggle |
| `skeletonRows` | `number` | `5` | Number of skeleton rows |
| `emptyTitle` | `string` | `"No results"` | Empty state title |
| `emptyDescription` | `string` | — | Empty state description |
| `emptyAction` | `ReactNode` | — | Empty state CTA |
