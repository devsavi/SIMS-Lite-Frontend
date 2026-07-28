import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

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

describe("Theme Toggle Component", () => {
  it("renders theme toggle button in header", () => {
    render(<AppHeader />);
    const toggleBtn = screen.getByRole("button", { name: /toggle theme/i });
    expect(toggleBtn).toBeInTheDocument();
  });
});
