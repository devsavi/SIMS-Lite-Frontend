"use client";

import React from "react";
import { X, User, Activity, Bell, Shield, Calendar, Mail, Phone, Building } from "lucide-react";
import type { UserItem } from "../types";
import { useUserDetail } from "../hooks/use-admin-users";
import { getRoleBadgeClass, getStatusBadgeClass, formatDateTime } from "../utils/user-helpers";
import { ROLE_LABELS } from "@/lib/auth";
import { cn } from "@/utils/cn";

interface UserDetailsModalProps {
  user: UserItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailsModal({ user, isOpen, onClose }: UserDetailsModalProps) {
  const [activeTab, setActiveTab] = React.useState<"general" | "activity" | "notifications">("general");

  const { data: userDetail, isLoading } = useUserDetail(isOpen && user ? user.id : null);

  if (!isOpen || !user) return null;

  const displayData = userDetail || {
    ...user,
    permissions: ["dashboard.view", "inventory.view", "products.view", "reports.view"],
    activities: [
      { id: "act-1", action: "System login", timestamp: user.lastLogin || new Date().toISOString(), ipAddress: "192.168.1.10" },
    ],
    notifications: [
      { id: "n-1", title: "Welcome", message: "Account created", createdAt: user.createdAt, read: true },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg border border-border bg-card shadow-lg text-foreground animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
              {user.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-semibold">{user.name}</h3>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close user details modal"
            className="rounded p-1 text-muted-foreground hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border bg-muted/30 px-6">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={cn(
              "flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-semibold transition-colors",
              activeTab === "general"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <User className="h-4 w-4" />
            General Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("activity")}
            className={cn(
              "flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-semibold transition-colors",
              activeTab === "activity"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Activity className="h-4 w-4" />
            Activity Log & Permissions
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("notifications")}
            className={cn(
              "flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-semibold transition-colors",
              activeTab === "notifications"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Bell className="h-4 w-4" />
            Notifications ({displayData.notifications?.length || 0})
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Loading details...
            </div>
          ) : activeTab === "general" ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" /> Assigned Role
                  </span>
                  <div>
                    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", getRoleBadgeClass(displayData.role))}>
                      {ROLE_LABELS[displayData.role] || displayData.role}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Account Status</span>
                  <div>
                    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", getStatusBadgeClass(displayData.status))}>
                      {displayData.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5" /> Department
                  </span>
                  <p className="text-sm font-medium">{displayData.department || "N/A"}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> Phone Number
                  </span>
                  <p className="text-sm font-medium">{displayData.phone || "N/A"}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Created Date
                  </span>
                  <p className="text-sm font-medium">{formatDateTime(displayData.createdAt)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Last Login
                  </span>
                  <p className="text-sm font-medium">{formatDateTime(displayData.lastLogin)}</p>
                </div>
              </div>
            </div>
          ) : activeTab === "activity" ? (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Assigned System Permissions
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {displayData.permissions?.map((perm) => (
                    <span
                      key={perm}
                      className="rounded bg-muted px-2 py-1 text-xs font-mono text-foreground border border-border"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Recent User Actions & Logins
                </h4>
                <div className="space-y-2">
                  {displayData.activities?.map((act) => (
                    <div
                      key={act.id}
                      className="flex items-center justify-between rounded-md border border-border p-2.5 text-xs"
                    >
                      <div>
                        <div className="font-medium text-foreground">{act.action}</div>
                        {act.ipAddress && (
                          <div className="text-muted-foreground font-mono">IP: {act.ipAddress}</div>
                        )}
                      </div>
                      <div className="text-muted-foreground">{formatDateTime(act.timestamp)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {displayData.notifications?.map((notif) => (
                <div key={notif.id} className="rounded-md border border-border p-3 text-xs">
                  <div className="font-semibold text-foreground">{notif.title}</div>
                  <p className="text-muted-foreground mt-0.5">{notif.message}</p>
                  <span className="text-[10px] text-muted-foreground mt-2 block">
                    {formatDateTime(notif.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-border px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
