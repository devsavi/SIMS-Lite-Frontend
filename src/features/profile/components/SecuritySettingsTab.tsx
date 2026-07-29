"use client";

import * as React from "react";
import { Lock, Key, ShieldAlert, Smartphone, Monitor, Globe, Check, AlertTriangle, Loader2, LogOut, Eye, EyeOff } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { useToast } from "@/app/components/ui/use-toast";
import { useChangePassword, useSessions, useRevokeOtherSessions } from "../hooks/use-profile";
import type { UserProfile } from "../types";

interface SecuritySettingsTabProps {
  profile: UserProfile;
}

export function SecuritySettingsTab({ profile }: SecuritySettingsTabProps) {
  const { toast } = useToast();
  const changePasswordMutation = useChangePassword();
  const { data: sessions, isLoading: sessionsLoading } = useSessions();
  const revokeSessionsMutation = useRevokeOtherSessions();

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [tfaEnabled, setTfaEnabled] = React.useState(profile.twoFactorEnabled ?? true);

  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthScore = getPasswordStrength(newPassword);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast({
        title: "Current Password Required",
        description: "Please enter your current password to proceed.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "New password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Do Not Match",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast({
        title: "Password Changed",
        description: "Your account password has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error?.message || "Could not update password. Check your current password and try again.",
        variant: "destructive",
      });
    }
  };

  const handleRevokeOtherSessions = async () => {
    try {
      await revokeSessionsMutation.mutateAsync();
      toast({
        title: "Sessions Revoked",
        description: "All other active login sessions have been terminated.",
      });
    } catch {
      toast({
        title: "Action Failed",
        description: "Failed to revoke sessions. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Change Password Card */}
      <Card className="rounded-none border border-border bg-card">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            Change Password
          </CardTitle>
          <CardDescription className="text-xs">
            Ensure your account uses a strong, unique password to prevent unauthorized access.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-xs font-medium">
                Current Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="rounded-none border-border focus:ring-1 focus:ring-ring pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowCurrentPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-xs font-medium">
                New Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="rounded-none border-border focus:ring-1 focus:ring-ring pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {newPassword && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Password strength:</span>
                    <span className="font-medium">
                      {strengthScore <= 1 && "Weak"}
                      {strengthScore === 2 && "Fair"}
                      {strengthScore === 3 && "Good"}
                      {strengthScore === 4 && "Strong"}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 h-1.5 w-full bg-muted">
                    <div className={`h-full ${strengthScore >= 1 ? "bg-red-500" : ""}`} />
                    <div className={`h-full ${strengthScore >= 2 ? "bg-amber-500" : ""}`} />
                    <div className={`h-full ${strengthScore >= 3 ? "bg-blue-500" : ""}`} />
                    <div className={`h-full ${strengthScore >= 4 ? "bg-emerald-500" : ""}`} />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs font-medium">
                Confirm New Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="rounded-none border-border focus:ring-1 focus:ring-ring pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Password Rules checklist */}
            <div className="border border-border bg-muted/20 p-3 text-xs space-y-1.5">
              <p className="font-semibold text-foreground text-[11px] uppercase tracking-wider">Password Requirements:</p>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <span className={`flex items-center gap-1.5 ${newPassword.length >= 8 ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}`}>
                  <Check className="h-3 w-3" /> Minimum 8 characters
                </span>
                <span className={`flex items-center gap-1.5 ${/[A-Z]/.test(newPassword) ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}`}>
                  <Check className="h-3 w-3" /> One uppercase letter
                </span>
                <span className={`flex items-center gap-1.5 ${/[0-9]/.test(newPassword) ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}`}>
                  <Check className="h-3 w-3" /> One number (0-9)
                </span>
                <span className={`flex items-center gap-1.5 ${/[^A-Za-z0-9]/.test(newPassword) ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}`}>
                  <Check className="h-3 w-3" /> Special character
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="rounded-none gap-2"
              >
                {changePasswordMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4" />
                    Update Password
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
