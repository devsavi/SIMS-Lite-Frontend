/**
 * NotificationCard — unit tests.
 */

import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationCard } from "../components/notification-card/NotificationCard";
import type { Notification } from "../types";

// ---------------------------------------------------------------------------
// Mock next/link
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Mock format util
// ---------------------------------------------------------------------------

vi.mock("@/utils/format", () => ({
  formatRelative: () => "2 minutes ago",
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const baseNotification: Notification = {
  id: "notif-1",
  title: "Low Stock Alert",
  message: "Paracetamol 500mg is running low — only 5 units remaining.",
  type: "WARNING",
  category: "inventory",
  priority: "HIGH",
  is_read: false,
  sender: { id: "u1", full_name: "System", email: "system@example.com" },
  recipient_id: "u2",
  action_url: null,
  created_at: new Date(Date.now() - 120_000).toISOString(),
  read_at: null,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("NotificationCard", () => {
  it("renders the notification title and message", () => {
    render(<NotificationCard notification={baseNotification} />);
    expect(screen.getByText("Low Stock Alert")).toBeInTheDocument();
    expect(
      screen.getByText(/Paracetamol 500mg is running low/i)
    ).toBeInTheDocument();
  });

  it("shows unread indicator for unread notifications", () => {
    render(<NotificationCard notification={baseNotification} />);
    expect(screen.getByLabelText("Unread")).toBeInTheDocument();
  });

  it("does not show unread indicator for read notifications", () => {
    render(
      <NotificationCard
        notification={{ ...baseNotification, is_read: true }}
      />
    );
    expect(screen.queryByLabelText("Unread")).not.toBeInTheDocument();
  });

  it("shows relative time", () => {
    render(<NotificationCard notification={baseNotification} />);
    expect(screen.getByText("2 minutes ago")).toBeInTheDocument();
  });

  it("shows sender name", () => {
    render(<NotificationCard notification={baseNotification} />);
    expect(screen.getByText("System")).toBeInTheDocument();
  });

  it("calls onMarkAsRead when mark-as-read button is clicked for unread notification", async () => {
    const onMarkAsRead = vi.fn();
    const user = userEvent.setup();
    render(
      <NotificationCard
        notification={baseNotification}
        onMarkAsRead={onMarkAsRead}
      />
    );
    await user.click(screen.getByRole("button", { name: /mark as read/i }));
    expect(onMarkAsRead).toHaveBeenCalledWith("notif-1");
  });

  it("calls onMarkAsUnread when mark-as-unread is clicked for read notification", async () => {
    const onMarkAsUnread = vi.fn();
    const user = userEvent.setup();
    render(
      <NotificationCard
        notification={{ ...baseNotification, is_read: true }}
        onMarkAsUnread={onMarkAsUnread}
      />
    );
    await user.click(screen.getByRole("button", { name: /mark as unread/i }));
    expect(onMarkAsUnread).toHaveBeenCalledWith("notif-1");
  });

  it("calls onDelete when delete button is clicked", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(
      <NotificationCard
        notification={baseNotification}
        onDelete={onDelete}
      />
    );
    await user.click(screen.getByRole("button", { name: /delete notification/i }));
    expect(onDelete).toHaveBeenCalledWith("notif-1");
  });

  it("hides action buttons in compact mode", () => {
    render(<NotificationCard notification={baseNotification} compact />);
    expect(
      screen.queryByRole("button", { name: /mark as/i })
    ).not.toBeInTheDocument();
  });

  it("disables buttons when isLoading is true", () => {
    render(
      <NotificationCard
        notification={baseNotification}
        onMarkAsRead={vi.fn()}
        isLoading
      />
    );
    const btn = screen.getByRole("button", { name: /mark as read/i });
    expect(btn).toBeDisabled();
  });
});
