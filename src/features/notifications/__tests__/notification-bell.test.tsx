/**
 * NotificationBell — unit tests.
 */

import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ---------------------------------------------------------------------------
// Mocks — must be hoisted before imports that consume them
// ---------------------------------------------------------------------------

vi.mock("@/features/notifications/hooks/use-notifications", () => ({
  useUnreadCount: vi.fn(() => ({ data: 0, isLoading: false })),
  useNotificationList: vi.fn(() => ({
    data: { data: [], unread_count: 0, pagination: { page: 1, size: 10, total: 0, pages: 0 } },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  })),
  useMarkAllAsRead: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useMarkAsRead: vi.fn(() => ({ mutate: vi.fn() })),
}));

vi.mock("@/features/notifications/websocket/use-ws-notifications", () => ({
  useWsNotifications: vi.fn(() => ({ status: "connected", isConnected: true })),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/utils/format", () => ({ formatRelative: () => "just now" }));

// ---------------------------------------------------------------------------
// Imports after mocks
// ---------------------------------------------------------------------------

import { NotificationBell } from "../components/notification-bell/NotificationBell";
import { useUnreadCount } from "../hooks/use-notifications";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("NotificationBell", () => {
  beforeEach(() => {
    vi.mocked(useUnreadCount).mockReturnValue({ data: 0, isLoading: false } as ReturnType<typeof useUnreadCount>);
  });

  it("renders the bell button", () => {
    render(<NotificationBell />);
    expect(
      screen.getByRole("button", { name: /notifications/i })
    ).toBeInTheDocument();
  });

  it("does not show badge when unread count is zero", () => {
    vi.mocked(useUnreadCount).mockReturnValue({ data: 0, isLoading: false } as ReturnType<typeof useUnreadCount>);
    render(<NotificationBell />);
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("shows badge with unread count when > 0", () => {
    vi.mocked(useUnreadCount).mockReturnValue({ data: 5, isLoading: false } as ReturnType<typeof useUnreadCount>);
    render(<NotificationBell />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows 99+ when unread count exceeds 99", () => {
    vi.mocked(useUnreadCount).mockReturnValue({ data: 150, isLoading: false } as ReturnType<typeof useUnreadCount>);
    render(<NotificationBell />);
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("opens notification panel on bell click", async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);
    const bell = screen.getByRole("button", { name: /notifications/i });
    await user.click(bell);
    // Panel should now be visible (has a heading "Notifications")
    expect(screen.getByRole("heading", { name: "Notifications" })).toBeInTheDocument();
  });

  it("has accessible aria-label including unread count", () => {
    vi.mocked(useUnreadCount).mockReturnValue({ data: 3, isLoading: false } as ReturnType<typeof useUnreadCount>);
    render(<NotificationBell />);
    const bell = screen.getByRole("button", { name: /3 unread/i });
    expect(bell).toBeInTheDocument();
  });
});
