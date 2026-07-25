import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../status-badge";

describe("StatusBadge", () => {
  it("renders with default variant", () => {
    render(<StatusBadge variant="default" />);
    expect(screen.getByText("Default")).toBeInTheDocument();
  });

  it("renders the correct label for a given variant", () => {
    render(<StatusBadge variant="active" />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders a custom label", () => {
    render(<StatusBadge variant="pending" label="Awaiting Review" />);
    expect(screen.getByText("Awaiting Review")).toBeInTheDocument();
  });

  it("renders a dot indicator when dot prop is true", () => {
    const { container } = render(<StatusBadge variant="active" dot />);
    // The dot is a span with aria-hidden=true
    const dot = container.querySelector('[aria-hidden="true"]');
    expect(dot).not.toBeNull();
  });

  it("renders out-of-stock badge with formatted label", () => {
    render(<StatusBadge variant="out-of-stock" />);
    expect(screen.getByText("Out Of Stock")).toBeInTheDocument();
  });

  it("renders low-stock badge", () => {
    render(<StatusBadge variant="low-stock" />);
    expect(screen.getByText("Low Stock")).toBeInTheDocument();
  });

  it("renders in-stock badge", () => {
    render(<StatusBadge variant="in-stock" />);
    expect(screen.getByText("In Stock")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <StatusBadge variant="active" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
