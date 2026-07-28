"use client";

import React from "react";
import { Building2 } from "lucide-react";
import { PermissionGuard } from "../../shared/components/PermissionGuard";
import { AdminNavTabs } from "../../shared/components/AdminNavTabs";
import { LogoUploader } from "../components/LogoUploader";
import { CompanyProfileForm } from "../components/CompanyProfileForm";
import {
  useCompanyProfile,
  useUpdateCompanyProfile,
  useUploadCompanyLogo,
} from "../hooks/use-company-profile";

export function CompanyProfilePage() {
  const { data: profile, isLoading } = useCompanyProfile();
  const updateMutation = useUpdateCompanyProfile();
  const uploadLogoMutation = useUploadCompanyLogo();

  const handleSaveProfile = async (data: any) => {
    await updateMutation.mutateAsync(data);
  };

  const handleUploadLogo = async (file: File) => {
    await uploadLogoMutation.mutateAsync(file);
  };

  return (
    <PermissionGuard requiredPermission="settings.edit">
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <Building2 className="h-6 w-6 text-primary" />
            Company Profile
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure organization branding, official contact details, tax details, and base currency.
          </p>
        </div>

        {/* Subnav Tabs */}
        <AdminNavTabs />

        {isLoading || !profile ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-32 rounded-lg bg-muted"></div>
            <div className="h-96 rounded-lg bg-muted"></div>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl">
            <LogoUploader
              currentLogoUrl={profile.logoUrl}
              onUploadLogo={handleUploadLogo}
              isUploading={uploadLogoMutation.isPending}
            />

            <CompanyProfileForm
              profile={profile}
              onSave={handleSaveProfile}
              isSubmitting={updateMutation.isPending}
            />
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
