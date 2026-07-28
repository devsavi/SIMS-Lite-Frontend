"use client";

import React from "react";
import { Mail } from "lucide-react";
import { PermissionGuard } from "../../shared/components/PermissionGuard";
import { AdminNavTabs } from "../../shared/components/AdminNavTabs";
import { EmailConfigForm } from "../components/EmailConfigForm";
import { TestConnectionModal } from "../components/TestConnectionModal";
import {
  useEmailConfig,
  useUpdateEmailConfig,
  useTestEmailConnection,
} from "../hooks/use-email-config";

export function EmailConfigPage() {
  const { data: config, isLoading } = useEmailConfig();
  const updateMutation = useUpdateEmailConfig();
  const testMutation = useTestEmailConnection();

  const [isTestModalOpen, setIsTestModalOpen] = React.useState(false);

  const handleSave = async (data: any) => {
    await updateMutation.mutateAsync(data);
  };

  const handleTestConnection = async (recipientEmail: string) => {
    return await testMutation.mutateAsync({ recipientEmail });
  };

  return (
    <PermissionGuard requiredPermission="settings.edit">
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <Mail className="h-6 w-6 text-primary" />
            Email & SMTP Gateway Configuration
          </h1>
          <p className="text-sm text-muted-foreground">
            Setup outgoing email credentials, encryption types, sender headers, and perform connectivity diagnostics.
          </p>
        </div>

        {/* Subnav Tabs */}
        <AdminNavTabs />

        {isLoading || !config ? (
          <div className="h-96 max-w-4xl animate-pulse rounded-lg bg-muted"></div>
        ) : (
          <EmailConfigForm
            config={config}
            onSave={handleSave}
            onOpenTestModal={() => setIsTestModalOpen(true)}
            isSubmitting={updateMutation.isPending}
          />
        )}

        <TestConnectionModal
          isOpen={isTestModalOpen}
          onClose={() => setIsTestModalOpen(false)}
          onTestConnection={handleTestConnection}
          isTesting={testMutation.isPending}
        />
      </div>
    </PermissionGuard>
  );
}
