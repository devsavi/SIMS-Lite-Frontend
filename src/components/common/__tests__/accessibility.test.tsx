import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "@/app/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PermissionDeniedPage } from "@/app/components/auth/PermissionDeniedPage";

describe("Accessibility Standards & ARIA Attributes", () => {
  it("renders buttons with accessible names and loading indicators", () => {
    render(<Button isLoading aria-label="Saving item">Save</Button>);
    const button = screen.getByRole("button", { name: /saving item/i });
    expect(button).toBeDisabled();
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  it("provides accessible status roles for empty states", () => {
    render(<EmptyState title="No items found" description="Try creating a new product." />);
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toHaveAttribute("aria-label", "No items found");
    expect(screen.getByText("No items found")).toBeInTheDocument();
  });

  it("provides alert roles and descriptions for error states", () => {
    render(<ErrorState title="Failed to load data" description="Server timed out." />);
    const alertRegion = screen.getByRole("alert");
    expect(alertRegion).toBeInTheDocument();
    expect(screen.getByText("Failed to load data")).toBeInTheDocument();
    expect(screen.getByText("Server timed out.")).toBeInTheDocument();
  });

  it("renders permission denied page with alert role and action links", () => {
    render(<PermissionDeniedPage requiredPermission="products.create" />);
    const alert = screen.getByRole("alert", { name: "Access Denied" });
    expect(alert).toBeInTheDocument();
    expect(screen.getByText("Required permission: products.create")).toBeInTheDocument();
  });
});
