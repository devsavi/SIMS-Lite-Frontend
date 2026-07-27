import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { StockStatusBadge } from "../components/stock-status/StockStatusBadge";

describe("StockStatusBadge", () => {
  it("renders 'In Stock' when quantity is above reorder level", () => {
    render(<StockStatusBadge quantityOnHand={50} reorderLevel={10} />);
    expect(screen.getByText("In Stock")).toBeInTheDocument();
  });

  it("renders 'Low Stock' when quantity is at or below reorder level", () => {
    render(<StockStatusBadge quantityOnHand={10} reorderLevel={10} />);
    expect(screen.getByText("Low Stock")).toBeInTheDocument();
  });

  it("renders 'Out of Stock' when quantity is zero", () => {
    render(<StockStatusBadge quantityOnHand={0} reorderLevel={5} />);
    expect(screen.getByText("Out of Stock")).toBeInTheDocument();
  });

  it("uses explicit status prop when provided", () => {
    render(<StockStatusBadge status="low_stock" />);
    expect(screen.getByText("Low Stock")).toBeInTheDocument();
  });

  it("has accessible aria-label containing the stock status", () => {
    const { container } = render(
      <StockStatusBadge quantityOnHand={100} reorderLevel={10} />
    );
    const labelledEl = container.querySelector("[aria-label]");
    expect(labelledEl).not.toBeNull();
    expect(labelledEl?.getAttribute("aria-label")).toContain("In Stock");
  });

  it("renders the status text even when showIcon is false", () => {
    render(
      <StockStatusBadge quantityOnHand={100} reorderLevel={10} showIcon={false} />
    );
    expect(screen.getByText("In Stock")).toBeInTheDocument();
  });

  it("defaults reorderLevel to 0 when not provided", () => {
    // quantity 5 > 0 reorder level → in stock
    render(<StockStatusBadge quantityOnHand={5} />);
    expect(screen.getByText("In Stock")).toBeInTheDocument();
  });
});
