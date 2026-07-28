"use client";

import React from "react";
import { Sliders, Settings, Archive, ShoppingCart, Bell, FileText } from "lucide-react";
import { PermissionGuard } from "../../shared/components/PermissionGuard";
import { AdminNavTabs } from "../../shared/components/AdminNavTabs";
import { GeneralSettingsForm } from "../components/GeneralSettingsForm";
import { InventorySettingsForm } from "../components/InventorySettingsForm";
import { ProcurementSettingsForm } from "../components/ProcurementSettingsForm";
import { NotificationSettingsForm } from "../components/NotificationSettingsForm";
import { ReportSettingsForm } from "../components/ReportSettingsForm";
import { UnsavedChangesDialog } from "../components/UnsavedChangesDialog";
import { useSystemSettings, useUpdateSettingsSection } from "../hooks/use-system-settings";
import { cn } from "@/utils/cn";

type SettingsSection = "general" | "inventory" | "procurement" | "notifications" | "reports";

export function SystemSettingsPage() {
  const { data: config, isLoading } = useSystemSettings();
  const updateSectionMutation = useUpdateSettingsSection();

  const [activeSection, setActiveSection] = React.useState<SettingsSection>("general");
  const [isDirty, setIsDirty] = React.useState(false);

  // Unsaved changes dialog state
  const [pendingSection, setPendingSection] = React.useState<SettingsSection | null>(null);

  const handleSectionClick = (section: SettingsSection) => {
    if (section === activeSection) return;
    if (isDirty) {
      setPendingSection(section);
    } else {
      setActiveSection(section);
    }
  };

  const handleConfirmLeave = () => {
    if (pendingSection) {
      setIsDirty(false);
      setActiveSection(pendingSection);
      setPendingSection(null);
    }
  };

  const handleSaveSection = async (section: SettingsSection, data: any) => {
    await updateSectionMutation.mutateAsync({ section, data });
  };

  return (
    <PermissionGuard requiredPermission="settings.view">
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <Sliders className="h-6 w-6 text-primary" />
            System Settings & Parameters
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure global operating rules, inventory thresholds, procurement limits, and system parameters.
          </p>
        </div>

        {/* Subnav Tabs */}
        <AdminNavTabs />

        {isLoading || !config ? (
          <div className="h-96 animate-pulse rounded-none bg-muted"></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Section Sidebar Navigation */}
            <div className="space-y-1 rounded-none border border-border bg-card p-2 shadow-sm h-fit">
              <button
                type="button"
                onClick={() => handleSectionClick("general")}
                className={cn(
                  "flex w-full items-center gap-3 rounded-none px-3 py-2.5 text-xs font-semibold transition-colors text-left",
                  activeSection === "general"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Settings className="h-4 w-4 shrink-0" />
                General System
              </button>

              <button
                type="button"
                onClick={() => handleSectionClick("inventory")}
                className={cn(
                  "flex w-full items-center gap-3 rounded-none px-3 py-2.5 text-xs font-semibold transition-colors text-left",
                  activeSection === "inventory"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Archive className="h-4 w-4 shrink-0" />
                Inventory & Stock
              </button>

              <button
                type="button"
                onClick={() => handleSectionClick("procurement")}
                className={cn(
                  "flex w-full items-center gap-3 rounded-none px-3 py-2.5 text-xs font-semibold transition-colors text-left",
                  activeSection === "procurement"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <ShoppingCart className="h-4 w-4 shrink-0" />
                Procurement & PO
              </button>

              <button
                type="button"
                onClick={() => handleSectionClick("notifications")}
                className={cn(
                  "flex w-full items-center gap-3 rounded-none px-3 py-2.5 text-xs font-semibold transition-colors text-left",
                  activeSection === "notifications"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Bell className="h-4 w-4 shrink-0" />
                Notification Alerts
              </button>

              <button
                type="button"
                onClick={() => handleSectionClick("reports")}
                className={cn(
                  "flex w-full items-center gap-3 rounded-none px-3 py-2.5 text-xs font-semibold transition-colors text-left",
                  activeSection === "reports"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <FileText className="h-4 w-4 shrink-0" />
                Report & Exports
              </button>
            </div>

            {/* Main Form Content */}
            <div className="lg:col-span-3">
              {activeSection === "general" && (
                <GeneralSettingsForm
                  settings={config.general}
                  onSave={(data) => handleSaveSection("general", data)}
                  isSubmitting={updateSectionMutation.isPending}
                  onDirtyChange={setIsDirty}
                />
              )}

              {activeSection === "inventory" && (
                <InventorySettingsForm
                  settings={config.inventory}
                  onSave={(data) => handleSaveSection("inventory", data)}
                  isSubmitting={updateSectionMutation.isPending}
                  onDirtyChange={setIsDirty}
                />
              )}

              {activeSection === "procurement" && (
                <ProcurementSettingsForm
                  settings={config.procurement}
                  onSave={(data) => handleSaveSection("procurement", data)}
                  isSubmitting={updateSectionMutation.isPending}
                  onDirtyChange={setIsDirty}
                />
              )}

              {activeSection === "notifications" && (
                <NotificationSettingsForm
                  settings={config.notifications}
                  onSave={(data) => handleSaveSection("notifications", data)}
                  isSubmitting={updateSectionMutation.isPending}
                  onDirtyChange={setIsDirty}
                />
              )}

              {activeSection === "reports" && (
                <ReportSettingsForm
                  settings={config.reports}
                  onSave={(data) => handleSaveSection("reports", data)}
                  isSubmitting={updateSectionMutation.isPending}
                  onDirtyChange={setIsDirty}
                />
              )}
            </div>
          </div>
        )}

        <UnsavedChangesDialog
          isOpen={!!pendingSection}
          onConfirmLeave={handleConfirmLeave}
          onCancel={() => setPendingSection(null)}
        />
      </div>
    </PermissionGuard>
  );
}
