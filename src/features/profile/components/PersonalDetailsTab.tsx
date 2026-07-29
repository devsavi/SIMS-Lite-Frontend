"use client";

import * as React from "react";
import { Save, User, Mail, Phone, Building2, Image as ImageIcon, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { useToast } from "@/app/components/ui/use-toast";
import { useUpdateProfile } from "../hooks/use-profile";
import type { UserProfile } from "../types";

interface PersonalDetailsTabProps {
  profile: UserProfile;
}

const PRESET_AVATARS = [
  "https://www.svgrepo.com/show/384674/account-avatar-profile-user-11.svg",
  "https://www.svgrepo.com/show/384682/account-avatar-profile-user-10.svg",
  "https://www.svgrepo.com/show/384670/account-avatar-profile-user.svg",
  "https://www.svgrepo.com/show/384671/account-avatar-profile-user-14.svg",
  "https://www.svgrepo.com/show/384683/account-avatar-profile-user-8.svg",
];

export function PersonalDetailsTab({ profile }: PersonalDetailsTabProps) {
  const { toast } = useToast();
  const updateProfileMutation = useUpdateProfile();

  const nameParts = (profile.name || "").trim().split(/\s+/);
  const defaultFirst = profile.firstName || nameParts[0] || "";
  const defaultLast = profile.lastName || nameParts.slice(1).join(" ") || "";

  const [firstName, setFirstName] = React.useState(defaultFirst);
  const [lastName, setLastName] = React.useState(defaultLast);
  const [email, setEmail] = React.useState(profile.email || "");
  const [phone, setPhone] = React.useState(profile.phone || "+94");
  const [department, setDepartment] = React.useState(profile.department || "");
  const [avatar, setAvatar] = React.useState(profile.avatar || "");
  const [bio, setBio] = React.useState(profile.bio || "");
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast({
        title: "Validation Error",
        description: "First name, last name, and email are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        firstName,
        lastName,
        email,
        phone,
        department,
        avatar,
        bio,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);

      toast({
        title: "Profile Updated",
        description: "Your personal details have been saved successfully.",
      });
    } catch {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-none border border-border bg-card">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Personal Information
          </CardTitle>
          <CardDescription className="text-xs">
            Manage your personal profile information, contact details, and public profile presence.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-xs font-medium">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  className="rounded-none border-border focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-xs font-medium">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  className="rounded-none border-border focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-medium flex items-center gap-1">
                  <Mail className="h-3 w-3" /> Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="rounded-none border-border focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-medium flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Phone Number
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="rounded-none border-border focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="text-xs font-medium flex items-center gap-1">
                <Building2 className="h-3 w-3" /> Department / Team
              </Label>
              <Input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Executive Management, Warehouse, Procurement"
                className="rounded-none border-border focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar" className="text-xs font-medium flex items-center gap-1">
                <ImageIcon className="h-3 w-3" /> Avatar URL
              </Label>
              <Input
                id="avatar"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://..."
                className="rounded-none border-border focus:ring-1 focus:ring-ring"
              />
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-muted-foreground">Preset avatars:</span>
                <div className="flex items-center gap-1.5">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(url)}
                      className={`h-7 w-7 overflow-hidden border transition-all ${
                        avatar === url ? "border-primary ring-2 ring-primary/20" : "border-border opacity-70 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Avatar option ${idx + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar("")}
                      className="text-[10px] text-muted-foreground hover:text-destructive underline ml-1"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-xs font-medium">
                Short Bio / Description
              </Label>
              <Textarea
                id="bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief summary of your role or background..."
                className="rounded-none border-border focus:ring-1 focus:ring-ring resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              {savedSuccess && (
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-fade-in">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Changes saved
                </span>
              )}
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="rounded-none gap-2 font-medium"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
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
