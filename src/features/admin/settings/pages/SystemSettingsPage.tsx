"use client";

import React from "react";
import { Sliders, Settings, Archive, Hash } from "lucide-react";
import { PermissionGuard } from "../../shared/components/PermissionGuard";
import { AdminNavTabs } from "../../shared/components/AdminNavTabs";
import { GeneralSettingsForm } from "../components/GeneralSettingsForm";
import { InventorySettingsForm } from "../components/InventorySettingsForm";
import { NumberingSettingsForm } from "../components/NumberingSettingsForm";
import { UnsavedChangesDialog } from "../components/UnsavedChangesDialog";
import { useSystemSettings, useUpdateSystemSettings } from "../hooks/use-system-settings";
import type { GeneralSettings, InventorySettings, NumberingSettings } from "../types";
import { cn } from "@/utils/cn";

type SettingsSection = "general" | "inventory" | "numbering";

export function SystemSettingsPage() {
  const { data: config, isLoading } = useSystemSettings();
  const updateMutation = useUpdateSystemSettings();

  const [activeSection, setActiveSection] = React.useState<SettingsSection>("general");
  const [isDirty, setIsDirty] = React.useState(false);
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

  const handleSaveGeneral = async (data: GeneralSettings) => {
    await updateMutation.mutateAsync({ general: data });
  };

  const handleSaveInventory = async (data: InventorySettings) => {
    await updateMutation.mutateAsync({ inventory: data });
  };

  const handleSaveNumbering = async (data: NumberingSettings) => {
    await updateMutation.mutateAsync({ numbering: data });
  };

  return (
    <PermissionGuard requiredPermission="settings.view">
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <Sliders className="h-6 w-6 text-primary" />
            System Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure global operating rules, inventory thresholds, and document numbering sequences.
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
                General Settings
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
                Inventory Settings
              </button>

              <button
                type="button"
                onClick={() => handleSectionClick("numbering")}
                className={cn(
                  "flex w-full items-center gap-3 rounded-none px-3 py-2.5 text-xs font-semibold transition-colors text-left",
                  activeSection === "numbering"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Hash className="h-4 w-4 shrink-0" />
                Numbering Sequence
              </button>
            </div>

            {/* Main Form Content */}
            <div className="lg:col-span-3">
              {activeSection === "general" && (
                <GeneralSettingsForm
                  settings={config.general}
                  onSave={handleSaveGeneral}
                  isSubmitting={updateMutation.isPending}
                  onDirtyChange={setIsDirty}
                />
              )}

              {activeSection === "inventory" && (
                <InventorySettingsForm
                  settings={config.inventory}
                  onSave={handleSaveInventory}
                  isSubmitting={updateMutation.isPending}
                  onDirtyChange={setIsDirty}
                />
              )}

              {activeSection === "numbering" && (
                <NumberingSettingsForm
                  settings={config.numbering}
                  onSave={handleSaveNumbering}
                  isSubmitting={updateMutation.isPending}
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
