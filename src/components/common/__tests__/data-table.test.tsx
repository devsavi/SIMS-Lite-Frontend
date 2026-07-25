import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable, type ColumnDef } from "../data-table";

// Mock Pagination since it uses Select component
vi.mock("@/components/common/pagination", () => ({
  Pagination: ({ totalRows }: { totalRows: number }) => (
    <div data-testid="pagination">Total: {totalRows}</div>
  ),
}));

interface TestRow {
  id: string;
  name: string;
  status: string;
}

const columns: ColumnDef<TestRow>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "status", header: "Status" },
];

const data: TestRow[] = [
  { id: "1", name: "Product A", status: "active" },
  { id: "2", name: "Product B", status: "inactive" },
  { id: "3", name: "Product C", status: "pending" },
];

describe("DataTable", () => {
  it("renders column headers", () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("renders all rows", () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText("Product A")).toBeInTheDocument();
    expect(screen.getByText("Product B")).toBeInTheDocument();
    expect(screen.getByText("Product C")).toBeInTheDocument();
  });

  it("shows empty state when data is empty", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        emptyTitle="No products"
        emptyDescription="Add a product to get started."
      />
    );
    expect(screen.getByText("No products")).toBeInTheDocument();
    expect(screen.getByText("Add a product to get started.")).toBeInTheDocument();
  });

  it("shows skeleton rows when loading", () => {
    const { container } = render(
      <DataTable columns={columns} data={[]} loading skeletonRows={3} />
    );
    // Skeleton elements exist (animate-pulse class)
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows error state when error is provided", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        error={new Error("Fetch failed")}
      />
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Fetch failed")).toBeInTheDocument();
  });

  it("shows retry button in error state when onRetry provided", () => {
    const onRetry = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={[]}
        error={new Error("Oops")}
        onRetry={onRetry}
      />
    );
    expect(screen.getByRole("button", { name: "Try Again" })).toBeInTheDocument();
  });

  it("adds select column when onRowSelectionChange is provided", () => {
    const { container } = render(
      <DataTable
        columns={columns}
        data={data}
        rowSelection={{}}
        onRowSelectionChange={vi.fn()}
      />
    );
    const checkboxes = container.querySelectorAll('[role="checkbox"]');
    // Header checkbox + 3 row checkboxes
    expect(checkboxes.length).toBe(4);
  });

  it("shows bulk actions toolbar when rows are selected", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        rowSelection={{ "0": true, "1": true }}
        onRowSelectionChange={vi.fn()}
        bulkActions={(rows) => (
          <span data-testid="bulk-actions">
            {rows.length} selected
          </span>
        )}
      />
    );
    expect(screen.getByTestId("bulk-actions")).toBeInTheDocument();
  });
});
