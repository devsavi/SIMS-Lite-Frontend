import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FullPageLoader, LoadingState, TableSkeleton } from "@/components/common/loading-state";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState, NetworkErrorState } from "@/components/common/error-state";

describe("Loading, Empty & Error UI States", () => {
  it("renders full page loading overlay with accessible status role", () => {
    render(<FullPageLoader text="Loading dashboard..." />);
    const loader = screen.getByRole("status");
    expect(loader).toHaveAttribute("aria-label", "Loading dashboard...");
    expect(screen.getByText("Loading dashboard...")).toBeInTheDocument();
  });

  it("renders loading state section with spinner and label", () => {
    render(<LoadingState text="Fetching records..." />);
    expect(screen.getByText("Fetching records...")).toBeInTheDocument();
  });

  it("renders table skeleton with correct rows and busy status", () => {
    render(<TableSkeleton rows={4} columns={3} />);
    const skeleton = screen.getByLabelText("Loading table data");
    expect(skeleton).toHaveAttribute("aria-busy", "true");
  });

  it("renders empty state with icon and action button", () => {
    render(
      <EmptyState
        title="No purchase orders"
        description="Create your first PO to get started."
        action={<button>New PO</button>}
      />
    );
    expect(screen.getByText("No purchase orders")).toBeInTheDocument();
    expect(screen.getByText("New PO")).toBeInTheDocument();
  });

  it("renders network error state with retry callback", () => {
    render(<NetworkErrorState onRetry={() => {}} />);
    expect(screen.getByText("No connection")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });
});
