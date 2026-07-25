/**
 * LoginForm — validation tests
 */

import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoginForm } from "../components/LoginForm";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/login",
}));

// Mock the auth hook
vi.mock("../hooks/use-auth", () => ({
  useLogin: () => ({
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

describe("LoginForm — validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all fields", () => {
    renderWithQuery(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows validation error when email is empty", async () => {
    renderWithQuery(<LoginForm />);
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it("shows validation error for invalid email", async () => {
    renderWithQuery(<LoginForm />);
    await userEvent.type(screen.getByLabelText(/email/i), "not-an-email");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it("shows validation error when password is empty", async () => {
    renderWithQuery(<LoginForm />);
    await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it("toggles password visibility", async () => {
    renderWithQuery(<LoginForm />);
    const passwordInput = screen.getByPlaceholderText("••••••••");
    expect(passwordInput).toHaveAttribute("type", "password");
    await userEvent.click(screen.getByLabelText(/show password/i));
    expect(passwordInput).toHaveAttribute("type", "text");
    await userEvent.click(screen.getByLabelText(/hide password/i));
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("shows forgot password link", () => {
    renderWithQuery(<LoginForm />);
    expect(screen.getByRole("link", { name: /forgot password/i })).toHaveAttribute(
      "href",
      "/forgot-password"
    );
  });

  it("shows register link", () => {
    renderWithQuery(<LoginForm />);
    expect(screen.getByRole("link", { name: /create one/i })).toHaveAttribute(
      "href",
      "/register"
    );
  });
});
