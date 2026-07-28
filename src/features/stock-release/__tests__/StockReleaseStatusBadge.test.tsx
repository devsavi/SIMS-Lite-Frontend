import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { StockReleaseStatusBadge } from "../components/release-status/StockReleaseStatusBadge";

describe("StockReleaseStatusBadge", () => {
  it("renders draft status badge correctly", () => {
    render(<StockReleaseStatusBadge status="draft" />);
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });

  it("renders submitted status badge correctly", () => {
    render(<StockReleaseStatusBadge status="submitted" />);
    expect(screen.getByText("Submitted")).toBeInTheDocument();
  });

  it("renders approved status badge correctly", () => {
    render(<StockReleaseStatusBadge status="approved" />);
    expect(screen.getByText("Approved")).toBeInTheDocument();
  });

  it("renders cancelled status badge correctly", () => {
    render(<StockReleaseStatusBadge status="cancelled" />);
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
  });

  it("handles case-insensitive uppercase input", () => {
    render(<StockReleaseStatusBadge status="APPROVED" />);
    expect(screen.getByText("Approved")).toBeInTheDocument();
  });
});
