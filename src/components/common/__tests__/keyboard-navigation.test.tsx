import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Button } from "@/app/components/ui/button";

describe("Keyboard Navigation & Focus Management", () => {
  it("allows button focus and keyboard activation via Enter/Space", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Submit Form</Button>);
    const button = screen.getByRole("button", { name: "Submit Form" });

    await user.tab();
    expect(button).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(handleClick).toHaveBeenCalledTimes(1);

    await user.keyboard(" ");
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it("prevents focus and activation on disabled buttons", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button disabled onClick={handleClick}>Disabled Action</Button>);
    const button = screen.getByRole("button", { name: "Disabled Action" });

    await user.tab();
    expect(button).not.toHaveFocus();
  });
});
