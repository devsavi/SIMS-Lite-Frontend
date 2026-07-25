/**
 * RegisterForm — validation tests
 */

import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RegisterForm } from "../components/RegisterForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/register",
}));

vi.mock("../hooks/use-auth", () => ({
  useRegister: () => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  }),
}));

function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
}

describe("RegisterForm — validation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders all required fields", () => {
    renderWithQuery(<RegisterForm />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Min. 8 characters")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Repeat your password")).toBeInTheDocument();
  });

  it("shows error when name is too short", async () => {
    renderWithQuery(<RegisterForm />);
    await userEvent.type(screen.getByLabelText(/full name/i), "A");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument();
    });
  });

  it("shows error for mismatched passwords", async () => {
    renderWithQuery(<RegisterForm />);
    await userEvent.type(screen.getByLabelText(/full name/i), "Jane Smith");
    await userEvent.type(screen.getByLabelText(/^email$/i), "jane@example.com");
    await userEvent.type(screen.getByPlaceholderText("Min. 8 characters"), "SecurePass1!");
    await userEvent.type(screen.getByPlaceholderText("Repeat your password"), "DifferentPass1!");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it("shows password length error", async () => {
    renderWithQuery(<RegisterForm />);
    await userEvent.type(screen.getByPlaceholderText("Min. 8 characters"), "short");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it("has a sign-in link", () => {
    renderWithQuery(<RegisterForm />);
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/login");
  });
});
