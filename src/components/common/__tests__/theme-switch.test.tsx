import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/dashboard",
}));

// Mock theme hook for UI testing
vi.mock("@/hooks/use-theme", () => ({
  useAppTheme: () => ({
    theme: "dark",
    resolvedTheme: "dark",
    setTheme: vi.fn(),
    mounted: true,
  }),
}));

import { AppHeader } from "@/app/components/layout/AppHeader";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

describe("Theme Toggle Component", () => {
  it("renders theme toggle button in header", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AppHeader />
      </QueryClientProvider>
    );
    const toggleBtn = screen.getByRole("button", { name: /toggle theme/i });
    expect(toggleBtn).toBeInTheDocument();
  });
});
