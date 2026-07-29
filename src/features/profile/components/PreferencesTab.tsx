"use client";

import * as React from "react";
import { Settings, Bell, Sliders, Save, Loader2, Mail, Wifi } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Switch } from "@/app/components/ui/switch";
import { Button } from "@/app/components/ui/button";
import { useToast } from "@/app/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { useNotificationPreferences, useUpdateNotificationPreferences } from "@/features/notifications/hooks/use-notifications";

export function PreferencesTab() {
  const { toast } = useToast();
  
  // Notification preferences (from notifications API)
  const { data: notifPrefs, isLoading: isNotifLoading } = useNotificationPreferences();
  const updateNotifPrefsMutation = useUpdateNotificationPreferences();

  // Local state for compact density (no API backing)
  const [compactDensity, setCompactDensity] = React.useState(false);
  const [displaySaved, setDisplaySaved] = React.useState(false);

  // Local state for notification preferences
  const [notifState, setNotifState] = React.useState({
    enable_websocket: true,
    enable_email: true,
    enable_system: true,
    mute_until: null as string | null,
  });

  React.useEffect(() => {
    if (notifPrefs) {
      setNotifState({
        enable_websocket: notifPrefs.enable_websocket,
        enable_email: notifPrefs.enable_email,
        enable_system: notifPrefs.enable_system,
        mute_until: notifPrefs.mute_until,
      });
    }
  }, [notifPrefs]);

  const handleSaveNotifications = async () => {
    try {
      await updateNotifPrefsMutation.mutateAsync(notifState);
      toast({
        title: "Notification Preferences Saved",
        description: "Your notification channels and silence settings have been updated.",
      });
    } catch {
      toast({
        title: "Save Failed",
        description: "Could not save notification preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveDisplay = () => {
    setDisplaySaved(true);
    toast({
      title: "Display Preferences Saved",
      description: "Your interface layout density preference has been updated.",
    });
    setTimeout(() => setDisplaySaved(false), 2000);
  };

  if (isNotifLoading) {
    return (
      <Card className="rounded-none border border-border bg-card">
        <CardContent className="p-8 flex items-center justify-center text-xs text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading preferences...
        </CardContent>
      </Card>
    );
  }

  // Calculate mute select value from local state
  let muteSelectValue = "none";
  if (notifState.mute_until) {
    const diff = new Date(notifState.mute_until).getTime() - Date.now();
    if (diff <= 0) {
      muteSelectValue = "none";
    } else if (diff <= 65 * 60 * 1000) {
      muteSelectValue = "1h";
    } else if (diff <= 8.5 * 60 * 60 * 1000) {
      muteSelectValue = "8h";
    } else if (diff <= 24.5 * 60 * 60 * 1000) {
      muteSelectValue = "24h";
    } else {
      muteSelectValue = "7d";
    }
  }

  const handleMuteChange = (val: string) => {
    if (val === "none") {
      setNotifState((prev) => ({ ...prev, mute_until: null }));
    } else {
      let duration = 0;
      if (val === "1h") duration = 60 * 60 * 1000;
      else if (val === "8h") duration = 8 * 60 * 60 * 1000;
      else if (val === "24h") duration = 24 * 60 * 60 * 1000;
      else if (val === "7d") duration = 7 * 24 * 60 * 60 * 1000;
      setNotifState((prev) => ({
        ...prev,
        mute_until: new Date(Date.now() + duration).toISOString(),
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Email & System Notifications Card */}
      <Card className="rounded-none border border-border bg-card">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Notification Preferences
          </CardTitle>
          <CardDescription className="text-xs">
            Choose which alert channels you enable and customize silence durations.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-5">
          <div className="flex items-center justify-between p-3 border border-border bg-muted/20">
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Wifi className="h-3.5 w-3.5 text-muted-foreground" />
                Live WebSocket Notifications
              </span>
              <p className="text-xs text-muted-foreground">Receive instant real-time notifications in-app when connected.</p>
            </div>
            <Switch
              checked={notifState.enable_websocket}
              onCheckedChange={(checked) =>
                setNotifState((prev) => ({ ...prev, enable_websocket: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 border border-border bg-muted/20">
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Email Notifications
              </span>
              <p className="text-xs text-muted-foreground">Receive email digests and reports on system and inventory alerts.</p>
            </div>
            <Switch
              checked={notifState.enable_email}
              onCheckedChange={(checked) =>
                setNotifState((prev) => ({ ...prev, enable_email: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 border border-border bg-muted/20">
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                System Notifications
              </span>
              <p className="text-xs text-muted-foreground">Receive browser desktop notifications when the app is in background.</p>
            </div>
            <Switch
              checked={notifState.enable_system}
              onCheckedChange={(checked) =>
                setNotifState((prev) => ({ ...prev, enable_system: checked }))
              }
            />
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider text-muted-foreground">
              Mute Notifications
            </label>
            <div className="flex flex-col gap-2 p-3 border border-border">
              <Select value={muteSelectValue} onValueChange={handleMuteChange}>
                <SelectTrigger className="rounded-none border-border">
                  <SelectValue placeholder="Select mute duration" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="none">Don't mute (Receive all alerts)</SelectItem>
                  <SelectItem value="1h">Mute for 1 Hour</SelectItem>
                  <SelectItem value="8h">Mute for 8 Hours</SelectItem>
                  <SelectItem value="24h">Mute for 24 Hours</SelectItem>
                  <SelectItem value="7d">Mute for 7 Days</SelectItem>
                </SelectContent>
              </Select>
              {notifState.mute_until && new Date(notifState.mute_until).getTime() > Date.now() && (
                <p className="text-xs text-amber-500 font-medium pt-1">
                  All notifications are currently muted until: {new Date(notifState.mute_until).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button
              type="button"
              onClick={handleSaveNotifications}
              disabled={updateNotifPrefsMutation.isPending}
              className="rounded-none gap-2"
            >
              {updateNotifPrefsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Notifications Preferences
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Interface Display Preferences Card */}
      <Card className="rounded-none border border-border bg-card">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sliders className="h-4 w-4 text-primary" />
            Interface & Display Preferences
          </CardTitle>
          <CardDescription className="text-xs">
            Customize layout density and table display options across SIMS Lite.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between p-3 border border-border">
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-foreground">Compact Data Table Density</span>
              <p className="text-xs text-muted-foreground">Use tighter row padding for data tables to fit more information on screen.</p>
            </div>
            <Switch
              checked={compactDensity}
              onCheckedChange={(checked) => setCompactDensity(checked)}
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button
              type="button"
              onClick={handleSaveDisplay}
              className="rounded-none gap-2"
            >
              <Save className="h-4 w-4" />
              {displaySaved ? "Saved!" : "Save Display Preferences"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
