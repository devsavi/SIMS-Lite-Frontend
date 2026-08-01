"use client";

/**
 * RowActionsMenu — reusable MoreVertical dropdown for table rows.
 * Renders via a portal so it escapes overflow/scroll containers.
 *
 * Usage:
 *   <RowActionsMenu label="Actions for Foo">
 *     <RowActionsMenuItem icon={<Pencil />} onClick={...}>Edit</RowActionsMenuItem>
 *     <RowActionsMenuItem icon={<Trash2 />} onClick={...} destructive>Delete</RowActionsMenuItem>
 *   </RowActionsMenu>
 */

import * as React from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";
import { cn } from "@/utils/cn";

// ---------------------------------------------------------------------------
// Portal
// ---------------------------------------------------------------------------

function DropdownPortal({
  anchorRef,
  onClose,
  children,
}: {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [coords, setCoords] = React.useState<{ top: number; right: number } | null>(null);

  React.useLayoutEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
  }, [anchorRef]);

  React.useEffect(() => {
    const close = () => onClose();
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [onClose]);

  if (!coords) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 w-44 rounded-none border border-border bg-popover p-1 shadow-md text-popover-foreground text-xs"
        style={{ top: coords.top, right: coords.right }}
        role="menu"
        aria-orientation="vertical"
      >
        {children}
      </div>
    </>,
    document.body,
  );
}

// ---------------------------------------------------------------------------
// MenuItem
// ---------------------------------------------------------------------------

export interface RowActionsMenuItemProps {
  icon?: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

export function RowActionsMenuItem({
  icon,
  onClick,
  destructive,
  disabled,
  children,
}: RowActionsMenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-none px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
        destructive && "text-destructive hover:bg-destructive/10 hover:text-destructive",
      )}
    >
      {icon && <span className="h-3.5 w-3.5 shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Menu root
// ---------------------------------------------------------------------------

export interface RowActionsMenuProps {
  /** Accessible label for the trigger button, e.g. "Actions for Product Foo" */
  label: string;
  children: React.ReactNode;
}

export function RowActionsMenu({ label, children }: RowActionsMenuProps) {
  const [open, setOpen] = React.useState(false);
  const btnRef = React.useRef<HTMLButtonElement | null>(null);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-none p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <DropdownPortal anchorRef={btnRef} onClose={() => setOpen(false)}>
          {React.Children.map(children, (child) => {
            if (!React.isValidElement<RowActionsMenuItemProps>(child)) return child;
            // Wrap each item's onClick to also close the menu
            return React.cloneElement(child, {
              onClick: () => {
                setOpen(false);
                child.props.onClick();
              },
            });
          })}
        </DropdownPortal>
      )}
    </div>
  );
}
