import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmptyState } from "../empty-state";

describe("EmptyState", () => {
  it("renders default title", () => {
    render(<EmptyState />);
    expect(screen.getByText("No data")).toBeInTheDocument();
  });

  it("renders custom title and description", () => {
    render(
      <EmptyState
        title="No products found"
        description="Try adjusting your filters."
      />
    );
    expect(screen.getByText("No products found")).toBeInTheDocument();
    expect(screen.getByText("Try adjusting your filters.")).toBeInTheDocument();
  });

  it("renders action slot", () => {
    render(
      <EmptyState
        title="No items"
        action={<button>Add Item</button>}
      />
    );
    expect(screen.getByRole("button", { name: "Add Item" })).toBeInTheDocument();
  });

  it("has a role of status for screen readers", () => {
    render(<EmptyState title="Nothing here" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders custom icon", () => {
    render(
      <EmptyState
        title="Empty"
        icon={<span data-testid="custom-icon" />}
      />
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });
});
