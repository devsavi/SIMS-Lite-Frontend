"use client";

import * as React from "react";
import { ShieldCheck, Mail, Phone, Building2, Calendar, Clock, CheckCircle2, Key, Camera } from "lucide-react";
import { ROLE_LABELS, type UserRole } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent } from "@/app/components/ui/card";
import type { UserProfile } from "../types";

function getInitials(name: string | undefined | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("") || "?";
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "Jan 1, 2026";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Jan 1, 2026";
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dateStr?: string | null): string {
  if (!dateStr) return "Active now";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Active now";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

interface ProfileHeaderCardProps {
  profile: UserProfile;
  onAvatarChange?: (url: string) => void;
}

export function ProfileHeaderCard({ profile }: ProfileHeaderCardProps) {
  const roleLabel = ROLE_LABELS[profile.role as UserRole] || profile.role || "User";

  return (
    <Card className="rounded-none border border-border bg-card shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Main User Info */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative group">
              <Avatar className="h-20 w-20 rounded-none border border-border">
                {profile.avatar ? (
                  <AvatarImage src={profile.avatar} alt={profile.name} className="object-cover" />
                ) : null}
                <AvatarFallback className="rounded-none bg-primary/10 text-xl font-bold text-primary">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer">
                <Camera className="h-5 w-5 text-white" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{profile.name}</h1>
                <Badge variant="outline" className="rounded-none bg-primary/10 text-primary border-primary/20 font-semibold px-2.5 py-0.5">
                  <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                  {roleLabel}
                </Badge>
                <Badge variant="outline" className="rounded-none bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-medium px-2 py-0.5 dark:text-emerald-400">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  {profile.status}
                </Badge>
              </div>

              {profile.bio && (
                <p className="text-sm text-muted-foreground max-w-2xl">{profile.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-foreground/60" />
                  {profile.email}
                </span>
                {profile.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-foreground/60" />
                    {profile.phone}
                  </span>
                )}
                {profile.department && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-foreground/60" />
                    {profile.department}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics & Info Box */}
          <div className="grid grid-cols-2 gap-3 border-t border-border pt-4 md:border-t-0 md:border-l md:pl-6 md:pt-0 shrink-0">
            <div className="flex flex-col gap-0.5 border border-border bg-muted/30 p-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Joined
              </span>
              <span className="text-xs font-medium text-foreground">
                {formatDate(profile.createdAt)}
              </span>
            </div>

            <div className="flex flex-col gap-0.5 border border-border bg-muted/30 p-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> Last Login
              </span>
              <span className="text-xs font-medium text-foreground">
                {formatTime(profile.lastLogin)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
