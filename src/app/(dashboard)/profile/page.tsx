import * as React from "react";
import type { Metadata } from "next";
import { ProfileView } from "@/features/profile/components/ProfileView";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "User Profile | SIMS Lite",
  description: "View and manage your user account settings, profile information, security, and permissions.",
};

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground">User Profile</h1>
        <p className="text-xs text-muted-foreground">
          Manage your account profile, personal details, security settings, and permissions.
        </p>
      </div>

      <React.Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs font-medium">Loading profile...</span>
          </div>
        }
      >
        <ProfileView />
      </React.Suspense>
    </div>
  );
}
