"use client";

import React from "react";
import { X, UserPlus, Save, Eye, EyeOff } from "lucide-react";
import type { UserItem, CreateUserDTO, UpdateUserDTO } from "../types";
import { ROLE_LABELS, type UserRole } from "@/lib/auth";
import { useRolesList } from "../hooks/use-admin-users";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

interface UserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserItem | null;
  onSubmitCreate: (data: CreateUserDTO) => Promise<void>;
  onSubmitUpdate: (id: string, data: UpdateUserDTO) => Promise<void>;
  isSubmitting: boolean;
}

export function UserFormDialog({
  isOpen,
  onClose,
  user,
  onSubmitCreate,
  onSubmitUpdate,
  isSubmitting,
}: UserFormDialogProps) {
  const isEdit = !!user;

  const { data: roles, isLoading: isLoadingRoles } = useRolesList();

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
    role: "officer" as UserRole,
    phone: "+94",
    sendInviteEmail: true,
  });

  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
        phone: user.phone || "+94",
        sendInviteEmail: false,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "officer",
        phone: "+94",
        sendInviteEmail: true,
      });
    }
    setErrors({});
    setShowPassword(false);
  }, [user, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Name is required";
    if (!formData.email.trim()) {
      errs.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = "Invalid email format";
    }

    if (!isEdit) {
      if (!formData.password) {
        errs.password = "Password is required";
      } else {
        const hasUpper = /[A-Z]/.test(formData.password);
        const hasLower = /[a-z]/.test(formData.password);
        const hasNumber = /[0-9]/.test(formData.password);
        const hasSpecial = /[^A-Za-z0-9]/.test(formData.password);
        if (formData.password.length < 8) {
          errs.password = "Password must be at least 8 characters long";
        } else if (!(hasUpper && hasLower && hasNumber && hasSpecial)) {
          errs.password = "Password must contain uppercase, lowercase, number, and special character";
        }
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const parts = formData.name.trim().split(/\s+/);
    const first_name = parts[0] || "";
    const last_name = parts.slice(1).join(" ") || "";

    if (isEdit && user) {
      await onSubmitUpdate(user.id, {
        first_name,
        last_name,
        phone: formData.phone,
        is_active: user.status === "ACTIVE",
        is_verified: true,
      });
    } else {
      const selectedRoleObj = roles?.find(r => r.name.toLowerCase() === formData.role.toLowerCase());
      const role_ids = selectedRoleObj ? [selectedRoleObj.id] : [];

      await onSubmitCreate({
        email: formData.email,
        password: formData.password,
        first_name,
        last_name,
        phone: formData.phone,
        is_active: true,
        is_verified: false,
        role_ids,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-none border border-border bg-card shadow-lg text-foreground animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            {isEdit ? <Save className="h-5 w-5 text-primary" /> : <UserPlus className="h-5 w-5 text-primary" />}
            {isEdit ? "Edit User Account" : "Create New User"}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="e.g. Sarah Jenkins"
            />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email Address *</label>
            <input
              type="email"
              value={formData.email}
              disabled={isEdit}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              placeholder="e.g. sarah.j@company.com"
            />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
          </div>

          {!isEdit && (
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-none border border-input bg-background pl-3 pr-10 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Create password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password ? (
                <p className="mt-1 text-xs text-destructive">{errors.password}</p>
              ) : (
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Must be at least 8 characters with 1 uppercase, 1 lowercase, 1 digit, and 1 special character.
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">System Role *</label>
              <Select
                value={formData.role}
                onValueChange={(v) => setFormData({ ...formData, role: v as UserRole })}
                disabled={isLoadingRoles}
              >
                <SelectTrigger className="w-full h-[38px] text-sm rounded-none border border-input bg-background px-3 py-2">
                  <SelectValue placeholder={isLoadingRoles ? "Loading roles..." : "Select system role"} />
                </SelectTrigger>
                <SelectContent>
                  {roles?.map((r) => (
                    <SelectItem key={r.id} value={r.name.toLowerCase()}>
                      {ROLE_LABELS[r.name.toLowerCase() as UserRole] || r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="e.g. +1 555-0199"
              />
            </div>
          </div>

          {!isEdit && (
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="sendInviteEmail"
                checked={formData.sendInviteEmail}
                onChange={(e) => setFormData({ ...formData, sendInviteEmail: e.target.checked })}
                className="h-4 w-4 rounded-none border-input text-primary focus:ring-ring"
              />
              <label htmlFor="sendInviteEmail" className="text-xs text-muted-foreground">
                Send welcome email with account setup link
              </label>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-none border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-none bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

