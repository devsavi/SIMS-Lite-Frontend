import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  LoadingState,
  InlineLoader,
  Spinner,
  TableSkeleton,
  CardSkeleton,
} from "../loading-state";

describe("LoadingState", () => {
  it("renders with default text", () => {
    render(<LoadingState />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("renders with custom text", () => {
    render(<LoadingState text="Fetching data…" />);
    expect(screen.getByText("Fetching data…")).toBeInTheDocument();
  });
});

describe("InlineLoader", () => {
  it("renders with default text", () => {
    render(<InlineLoader />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders with custom text", () => {
    render(<InlineLoader text="Saving…" />);
    expect(screen.getByText("Saving…")).toBeInTheDocument();
  });
});

describe("Spinner", () => {
  it("renders without crashing", () => {
    const { container } = render(<Spinner />);
    expect(container.firstChild).not.toBeNull();
  });
});

describe("TableSkeleton", () => {
  it("renders with aria-busy", () => {
    const { container } = render(<TableSkeleton />);
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
  });
});

describe("CardSkeleton", () => {
  it("renders with aria-busy", () => {
    const { container } = render(<CardSkeleton />);
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
  });
});
