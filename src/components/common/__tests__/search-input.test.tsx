import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchInput } from "../search-input";

describe("SearchInput", () => {
  it("renders with placeholder", () => {
    render(<SearchInput placeholder="Search products…" />);
    expect(
      screen.getByRole("searchbox", { name: "Search products…" })
    ).toBeInTheDocument();
  });

  it("shows clear button when there is input", async () => {
    const user = userEvent.setup();
    render(<SearchInput />);
    const input = screen.getByRole("searchbox");

    await user.type(input, "hello");
    expect(screen.getByRole("button", { name: "Clear search" })).toBeInTheDocument();
  });

  it("clears the input when clear button is clicked", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchInput onSearch={onSearch} debounceMs={0} />);
    const input = screen.getByRole("searchbox");

    await user.type(input, "hello");
    const clearBtn = screen.getByRole("button", { name: "Clear search" });
    await user.click(clearBtn);

    expect((input as HTMLInputElement).value).toBe("");
  });

  it("calls onSearch with debounced value", async () => {
    const onSearch = vi.fn();
    render(<SearchInput onSearch={onSearch} debounceMs={0} />);
    const input = screen.getByRole("searchbox");

    fireEvent.change(input, { target: { value: "inv" } });

    // Wait for the debounce (0ms) to fire
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith("inv");
    });
  });

  it("renders as disabled", () => {
    render(<SearchInput disabled />);
    expect(screen.getByRole("searchbox")).toBeDisabled();
  });
});
