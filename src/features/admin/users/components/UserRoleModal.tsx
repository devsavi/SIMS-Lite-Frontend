"use client";

import React from "react";
import { X, Shield } from "lucide-react";
import type { UserItem } from "../types";
import { ROLE_LABELS, type UserRole } from "@/lib/auth";

interface UserRoleModalProps {
  user: UserItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAssignRole: (userId: string, role: UserRole, reason?: string) => Promise<void>;
  isSubmitting: boolean;
}

export function UserRoleModal({
  user,
  isOpen,
  onClose,
  onAssignRole,
  isSubmitting,
}: UserRoleModalProps) {
  const [selectedRole, setSelectedRole] = React.useState<UserRole>("procurement_officer");
  const [reason, setReason] = React.useState("");

  React.useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
      setReason("");
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAssignRole(user.id, selectedRole, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-none border border-border bg-card shadow-lg text-foreground animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <Shield className="h-5 w-5 text-primary" />
            Assign Role — {user.name}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-none p-1 text-muted-foreground hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          <div>
            <label className="block font-medium mb-1">Select New Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="warehouse_manager">Warehouse Manager</option>
              <option value="procurement_officer">Procurement Officer</option>
              <option value="stock_clerk">Stock Clerk</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Reason for Role Change (Optional)</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Promotion or department transfer..."
              className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-none border border-input bg-background px-4 py-2 font-medium hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-none bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? "Updating..." : "Update Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
