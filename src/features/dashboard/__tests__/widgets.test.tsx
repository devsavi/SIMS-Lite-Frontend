/**
 * Dashboard widgets — unit tests
 * Covers loading states, empty states, error states, and data rendering.
 */

import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecentActivitiesWidget } from "../components/widgets/RecentActivitiesWidget";
import { NotificationsWidget } from "../components/widgets/NotificationsWidget";
import { LowStockWidget } from "../components/widgets/LowStockWidget";
import { PendingApprovalsWidget } from "../components/widgets/PendingApprovalsWidget";
import { RecentPurchaseOrdersWidget } from "../components/widgets/RecentPurchaseOrdersWidget";
import { RecentGRNsWidget } from "../components/widgets/RecentGRNsWidget";
import type {
  ActivityItem,
  NotificationItem,
  LowStockItem,
  PendingApproval,
  RecentPurchaseOrder,
  RecentGRN,
} from "../types";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const activities: ActivityItem[] = [
  {
    id: "1",
    type: "purchase_order",
    action: "created",
    description: "Purchase order PO-001 was created",
    user_name: "Alice Smith",
    created_at: new Date(Date.now() - 60_000).toISOString(),
    reference: "PO-001",
  },
  {
    id: "2",
    type: "grn",
    action: "approved",
    description: "GRN-005 has been verified",
    user_name: "Bob Jones",
    created_at: new Date(Date.now() - 120_000).toISOString(),
    reference: "GRN-005",
  },
];

const notifications: NotificationItem[] = [
  {
    id: "n1",
    type: "warning",
    title: "Low stock alert",
    message: "Product A is below reorder level",
    is_read: false,
    created_at: new Date(Date.now() - 300_000).toISOString(),
  },
  {
    id: "n2",
    type: "info",
    title: "PO Approved",
    message: "Your purchase order PO-002 was approved",
    is_read: true,
    created_at: new Date(Date.now() - 600_000).toISOString(),
  },
];

const lowStockItems: LowStockItem[] = [
  {
    id: "ls1",
    product_name: "Paracetamol 500mg",
    product_code: "MED-001",
    current_quantity: 5,
    reorder_level: 50,
    unit: "pcs",
  },
  {
    id: "ls2",
    product_name: "Surgical Gloves L",
    product_code: "MED-042",
    current_quantity: 0,
    reorder_level: 100,
    unit: "boxes",
  },
];

const pendingApprovals: PendingApproval[] = [
  {
    id: "pa1",
    type: "purchase_order",
    reference: "PO-010",
    description: "Office supplies order",
    requested_by: "Carol White",
    requested_at: new Date(Date.now() - 3600_000).toISOString(),
    amount: 1250.00,
  },
];

const purchaseOrders: RecentPurchaseOrder[] = [
  {
    id: "po1",
    po_number: "PO-001",
    supplier_name: "Global Supplies Ltd",
    status: "pending",
    total_amount: 4500.00,
    created_at: new Date(Date.now() - 86400_000).toISOString(),
  },
];

const grns: RecentGRN[] = [
  {
    id: "grn1",
    grn_number: "GRN-001",
    po_number: "PO-001",
    supplier_name: "Global Supplies Ltd",
    status: "pending",
    received_at: new Date(Date.now() - 43200_000).toISOString(),
  },
];

// ---------------------------------------------------------------------------
// RecentActivitiesWidget
// ---------------------------------------------------------------------------

describe("RecentActivitiesWidget", () => {
  it("renders activity items", () => {
    render(<RecentActivitiesWidget activities={activities} />);
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
    expect(screen.getByText("PO-001")).toBeInTheDocument();
  });

  it("shows empty state when no activities", () => {
    render(<RecentActivitiesWidget activities={[]} />);
    expect(screen.getByText("No recent activities")).toBeInTheDocument();
  });

  it("shows loading skeleton", () => {
    const { container } = render(<RecentActivitiesWidget loading />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("shows error state with retry button", async () => {
    const onRetry = vi.fn();
    render(
      <RecentActivitiesWidget
        error={new Error("Network error")}
        onRetry={onRetry}
      />
    );
    const retryBtn = screen.getByRole("button", { name: /try again/i });
    await userEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledOnce();
  });
});

// ---------------------------------------------------------------------------
// NotificationsWidget
// ---------------------------------------------------------------------------

describe("NotificationsWidget", () => {
  it("renders notification items", () => {
    render(<NotificationsWidget notifications={notifications} unreadCount={1} />);
    expect(screen.getByText("Low stock alert")).toBeInTheDocument();
    expect(screen.getByText("PO Approved")).toBeInTheDocument();
  });

  it("shows unread badge when unread count > 0", () => {
    render(<NotificationsWidget notifications={notifications} unreadCount={3} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows empty state for zero notifications", () => {
    render(<NotificationsWidget notifications={[]} unreadCount={0} />);
    expect(screen.getByText("No notifications")).toBeInTheDocument();
  });

  it("shows loading skeleton", () => {
    const { container } = render(<NotificationsWidget loading />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("has a link to view all notifications", () => {
    render(<NotificationsWidget notifications={[]} />);
    expect(screen.getByRole("link", { name: /view all notifications/i })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// LowStockWidget
// ---------------------------------------------------------------------------

describe("LowStockWidget", () => {
  it("renders low stock products", () => {
    render(<LowStockWidget items={lowStockItems} />);
    expect(screen.getByText("Paracetamol 500mg")).toBeInTheDocument();
    expect(screen.getByText("Surgical Gloves L")).toBeInTheDocument();
  });

  it("shows count badge when items present", () => {
    render(<LowStockWidget items={lowStockItems} />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows healthy state when no low stock items", () => {
    render(<LowStockWidget items={[]} />);
    expect(screen.getByText("All stock levels are healthy")).toBeInTheDocument();
  });

  it("shows loading skeleton", () => {
    const { container } = render(<LowStockWidget loading />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// PendingApprovalsWidget
// ---------------------------------------------------------------------------

describe("PendingApprovalsWidget", () => {
  it("renders pending approvals", () => {
    render(<PendingApprovalsWidget approvals={pendingApprovals} />);
    expect(screen.getByText("PO-010")).toBeInTheDocument();
    // "By Carol White" is rendered as "By " + "Carol White" in adjacent text nodes
    expect(screen.getByText(/carol white/i)).toBeInTheDocument();
  });

  it("renders Review button for each item", () => {
    render(<PendingApprovalsWidget approvals={pendingApprovals} />);
    expect(screen.getByRole("link", { name: /review po-010/i })).toBeInTheDocument();
  });

  it("shows empty state when no approvals", () => {
    render(<PendingApprovalsWidget approvals={[]} />);
    expect(screen.getByText("No pending approvals")).toBeInTheDocument();
  });

  it("shows loading skeleton", () => {
    const { container } = render(<PendingApprovalsWidget loading />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// RecentPurchaseOrdersWidget
// ---------------------------------------------------------------------------

describe("RecentPurchaseOrdersWidget", () => {
  it("renders purchase order rows", () => {
    render(<RecentPurchaseOrdersWidget orders={purchaseOrders} />);
    expect(screen.getByText("PO-001")).toBeInTheDocument();
    expect(screen.getByText("Global Supplies Ltd")).toBeInTheDocument();
  });

  it("links each row to the PO detail page", () => {
    render(<RecentPurchaseOrdersWidget orders={purchaseOrders} />);
    expect(screen.getByRole("link", { name: /purchase order po-001/i })).toBeInTheDocument();
  });

  it("shows empty state when no orders", () => {
    render(<RecentPurchaseOrdersWidget orders={[]} />);
    expect(screen.getByText("No purchase orders")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// RecentGRNsWidget
// ---------------------------------------------------------------------------

describe("RecentGRNsWidget", () => {
  it("renders GRN rows", () => {
    render(<RecentGRNsWidget grns={grns} />);
    expect(screen.getByText("GRN-001")).toBeInTheDocument();
    expect(screen.getByText("Global Supplies Ltd")).toBeInTheDocument();
  });

  it("shows empty state when no GRNs", () => {
    render(<RecentGRNsWidget grns={[]} />);
    expect(screen.getByText("No GRNs found")).toBeInTheDocument();
  });

  it("shows loading skeleton", () => {
    const { container } = render(<RecentGRNsWidget loading />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });
});
