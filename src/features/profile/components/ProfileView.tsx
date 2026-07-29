"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { User, Lock, ShieldCheck, Activity, Settings, Loader2 } from "lucide-react";
import { ProfileHeaderCard } from "./ProfileHeaderCard";
import { PersonalDetailsTab } from "./PersonalDetailsTab";
import { SecuritySettingsTab } from "./SecuritySettingsTab";
import { PermissionsTab } from "./PermissionsTab";
import { ActivityLogTab } from "./ActivityLogTab";
import { PreferencesTab } from "./PreferencesTab";
import { useProfile } from "../hooks/use-profile";

type ProfileTabKey = "personal" | "security" | "permissions" | "activity" | "preferences";

const TABS: { key: ProfileTabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "personal", label: "Personal Details", icon: User },
  { key: "security", label: "Security & Password", icon: Lock },
  { key: "permissions", label: "Role & Permissions", icon: ShieldCheck },
  { key: "activity", label: "Activity Log", icon: Activity },
  { key: "preferences", label: "Preferences", icon: Settings },
];

export function ProfileView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTabParam = (searchParams.get("tab") as ProfileTabKey) || "personal";

  const [activeTab, setActiveTab] = React.useState<ProfileTabKey>(activeTabParam);
  const { data: profile, isLoading, isError } = useProfile();

  React.useEffect(() => {
    if (activeTabParam && TABS.some((t) => t.key === activeTabParam)) {
      setActiveTab(activeTabParam);
    }
  }, [activeTabParam]);

  const handleTabChange = (tabKey: ProfileTabKey) => {
    setActiveTab(tabKey);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabKey);
    router.replace(`/profile?${params.toString()}`, { scroll: false });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-xs font-medium">Loading user profile...</span>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-destructive border border-destructive/20 bg-destructive/5 p-6 text-center">
        <span className="text-sm font-semibold">Failed to load profile data</span>
        <p className="text-xs text-muted-foreground max-w-md">
          There was an issue fetching your account profile. Please refresh the page or contact your administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Overview Header Card */}
      <ProfileHeaderCard profile={profile} />

      {/* Tab Navigation Strip */}
      <div className="border-b border-border bg-card">
        <nav className="flex w-full overflow-x-auto" aria-label="Profile Sections">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabChange(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-primary text-primary font-semibold bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Active Tab Panel */}
      <div className="pt-2">
        {activeTab === "personal" && <PersonalDetailsTab profile={profile} />}
        {activeTab === "security" && <SecuritySettingsTab profile={profile} />}
        {activeTab === "permissions" && <PermissionsTab profile={profile} />}
        {activeTab === "activity" && <ActivityLogTab />}
        {activeTab === "preferences" && <PreferencesTab />}
      </div>
    </div>
  );
}
