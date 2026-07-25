/**
 * ProtectedRoute and GuestRoute — route protection tests
 */

import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProtectedRoute } from "../ProtectedRoute";
import { GuestRoute } from "../GuestRoute";
import { useAuthStore } from "@/stores/auth.store";

// useAuthStore is called as a selector: useAuthStore((s) => s.isAuthenticated)
// Mock it to call the selector with a fake state object.
vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

const mockUseAuthStore = vi.mocked(useAuthStore);

function mockAuth(isAuthenticated: boolean) {
  // The components call useAuthStore((s) => s.isAuthenticated)
  // So the mock must invoke the selector with the fake state
  mockUseAuthStore.mockImplementation((selector: unknown) => {
    if (typeof selector === "function") {
      return selector({ isAuthenticated });
    }
    return { isAuthenticated };
  });
}

describe("ProtectedRoute", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders children when authenticated", () => {
    mockAuth(true);
    render(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>
    );
    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });

  it("renders nothing when not authenticated", () => {
    mockAuth(false);
    render(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>
    );
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("redirects to /login when unauthenticated", () => {
    const replaceSpy = vi.fn();
    Object.defineProperty(window, "location", {
      value: { replace: replaceSpy },
      writable: true,
    });
    mockAuth(false);
    render(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>
    );
    expect(replaceSpy).toHaveBeenCalledWith("/login");
  });
});

describe("GuestRoute", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders children when not authenticated", () => {
    mockAuth(false);
    render(
      <GuestRoute>
        <div>Login form</div>
      </GuestRoute>
    );
    expect(screen.getByText("Login form")).toBeInTheDocument();
  });

  it("renders children while redirect fires when authenticated", () => {
    const replaceSpy = vi.fn();
    Object.defineProperty(window, "location", {
      value: { replace: replaceSpy },
      writable: true,
    });
    mockAuth(true);
    render(
      <GuestRoute>
        <div>Login form</div>
      </GuestRoute>
    );
    expect(replaceSpy).toHaveBeenCalledWith("/dashboard");
    // Children stay visible during the redirect transition (no blank screen)
    expect(screen.getByText("Login form")).toBeInTheDocument();
  });
});
