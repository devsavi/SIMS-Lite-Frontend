"use client";

import React from "react";
import { Mail } from "lucide-react";
import { PermissionGuard } from "../../shared/components/PermissionGuard";
import { AdminNavTabs } from "../../shared/components/AdminNavTabs";
import { EmailConfigForm } from "../components/EmailConfigForm";
import {
  useEmailConfig,
  useUpdateEmailConfig,
} from "../hooks/use-email-config";

export function EmailConfigPage() {
  const { data: config, isLoading } = useEmailConfig();
  const updateMutation = useUpdateEmailConfig();

  const handleSave = async (data: any) => {
    await updateMutation.mutateAsync(data);
  };

  return (
    <PermissionGuard requiredPermission="settings.edit">
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <Mail className="h-6 w-6 text-primary" />
            Email Configuration
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure the sender identity used for outgoing system emails and notifications.
          </p>
        </div>

        {/* Subnav Tabs */}
        <AdminNavTabs />

        {isLoading || !config ? (
          <div className="h-64 animate-pulse rounded-none bg-muted"></div>
        ) : (
          <EmailConfigForm
            config={config}
            onSave={handleSave}
            isSubmitting={updateMutation.isPending}
          />
        )}
      </div>
    </PermissionGuard>
  );
}
