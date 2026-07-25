import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmationDialog, DeleteDialog } from "../confirmation-dialog";

describe("ConfirmationDialog", () => {
  it("renders when open is true", () => {
    render(
      <ConfirmationDialog
        open
        onOpenChange={vi.fn()}
        title="Confirm Action"
        description="Are you sure?"
        onConfirm={vi.fn()}
      />
    );
    expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  it("does not render when open is false", () => {
    render(
      <ConfirmationDialog
        open={false}
        onOpenChange={vi.fn()}
        title="Hidden Dialog"
        description="Should not appear"
        onConfirm={vi.fn()}
      />
    );
    expect(screen.queryByText("Hidden Dialog")).not.toBeInTheDocument();
  });

  it("calls onConfirm when confirm button is clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <ConfirmationDialog
        open
        onOpenChange={onOpenChange}
        title="Test"
        description="Test description"
        onConfirm={onConfirm}
      />
    );

    await user.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onOpenChange(false) when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <ConfirmationDialog
        open
        onOpenChange={onOpenChange}
        title="Test"
        description="Description"
        onConfirm={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows custom confirm/cancel labels", () => {
    render(
      <ConfirmationDialog
        open
        onOpenChange={vi.fn()}
        title="Custom"
        description="Desc"
        onConfirm={vi.fn()}
        confirmLabel="Yes, proceed"
        cancelLabel="No, go back"
      />
    );
    expect(screen.getByRole("button", { name: "Yes, proceed" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "No, go back" })).toBeInTheDocument();
  });
});

describe("DeleteDialog", () => {
  it("renders delete title with item name", () => {
    render(
      <DeleteDialog
        open
        onOpenChange={vi.fn()}
        itemName="Product #123"
        onConfirm={vi.fn()}
      />
    );
    expect(screen.getByText(/Delete "Product #123"/)).toBeInTheDocument();
  });

  it("calls onConfirm when Delete button is clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <DeleteDialog
        open
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
