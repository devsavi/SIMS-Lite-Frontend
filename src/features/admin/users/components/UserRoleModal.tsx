"use client";

import React from "react";
import { X, Shield } from "lucide-react";
import type { UserItem } from "../types";
import { ROLE_LABELS, type UserRole } from "@/lib/auth";
import { useRolesList } from "../hooks/use-admin-users";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

interface UserRoleModalProps {
  user: UserItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAssignRole: (userId: string, roleIds: string[]) => Promise<void>;
  isSubmitting: boolean;
}

export function UserRoleModal({
  user,
  isOpen,
  onClose,
  onAssignRole,
  isSubmitting,
}: UserRoleModalProps) {
  const { data: roles, isLoading: isLoadingRoles } = useRolesList();
  const [selectedRoleId, setSelectedRoleId] = React.useState("");

  React.useEffect(() => {
    if (user && roles) {
      const userRole = roles.find((r) => r.name.toLowerCase() === user.role.toLowerCase());
      setSelectedRoleId(userRole?.id || roles[0]?.id || "");
    }
  }, [user, roles, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRoleId) {
      await onAssignRole(user.id, [selectedRoleId]);
      onClose();
    }
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
            <Select
              value={selectedRoleId}
              onValueChange={setSelectedRoleId}
              disabled={isLoadingRoles}
            >
              <SelectTrigger className="w-full h-[38px] text-sm rounded-none border border-input bg-background px-3 py-2">
                <SelectValue placeholder={isLoadingRoles ? "Loading roles..." : "Select new role"} />
              </SelectTrigger>
              <SelectContent>
                {roles?.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {ROLE_LABELS[r.name.toLowerCase() as UserRole] || r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              disabled={isSubmitting || !selectedRoleId}
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

