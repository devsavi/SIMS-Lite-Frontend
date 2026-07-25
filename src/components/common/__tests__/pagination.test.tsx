import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "../pagination";

// Minimal select mock for Select component in pagination
vi.mock("@/app/components/ui/select", () => ({
  Select: ({ children, onValueChange, value }: { children: React.ReactNode; onValueChange?: (v: string) => void; value?: string }) => (
    <div data-testid="mock-select">{children}</div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: () => <span />,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <option value={value}>{children}</option>
  ),
}));

describe("Pagination", () => {
  const defaultProps = {
    totalRows: 200,
    page: 1,
    pageSize: 20,
    onPageChange: vi.fn(),
  };

  it("renders showing row range", () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByText(/Showing 1–20 of 200 results/)).toBeInTheDocument();
  });

  it("renders page X of Y", () => {
    render(<Pagination {...defaultProps} page={3} />);
    expect(screen.getByText("Page 3 of 10")).toBeInTheDocument();
  });

  it("disables first/prev on first page", () => {
    render(<Pagination {...defaultProps} page={1} />);
    expect(screen.getByRole("button", { name: "First page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
  });

  it("disables last/next on last page", () => {
    render(<Pagination {...defaultProps} page={10} />);
    expect(screen.getByRole("button", { name: "Last page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  it("calls onPageChange with next page when Next is clicked", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination {...defaultProps} onPageChange={onPageChange} />);
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("calls onPageChange with prev page when Prev is clicked", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination {...defaultProps} page={5} onPageChange={onPageChange} />);
    await user.click(screen.getByRole("button", { name: "Previous page" }));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("shows No results when totalRows is 0", () => {
    render(<Pagination {...defaultProps} totalRows={0} />);
    expect(screen.getByText("No results")).toBeInTheDocument();
  });
});
