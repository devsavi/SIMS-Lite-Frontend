"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bell, BellOff, Loader2, Monitor, Mail, Wifi } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/app/components/ui/form";
import { Switch } from "@/app/components/ui/switch";
import { Button } from "@/app/components/ui/button";
import { Separator } from "@/app/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  notificationPreferencesSchema,
  type NotificationPreferencesFormValues,
} from "../../schemas";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "../../hooks/use-notifications";
import {
  requestPermission,
  getCurrentPermission,
  isBrowserNotificationsSupported,
} from "../../utils/browser-notifications";

// ---------------------------------------------------------------------------
// Default preferences
// ---------------------------------------------------------------------------

const DEFAULT_PREFERENCES: NotificationPreferencesFormValues = {
  enable_websocket: true,
  enable_email: true,
  enable_system: true,
  mute_until: null,
};

// ---------------------------------------------------------------------------
// Browser permission banner
// ---------------------------------------------------------------------------

function BrowserPermissionBanner({
  permission,
  onRequest,
}: {
  permission: string;
  onRequest: () => void;
}) {
  if (!isBrowserNotificationsSupported() || permission === "granted") return null;

  if (permission === "denied") {
    return (
      <div className="flex items-start gap-3 rounded-none border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
        <BellOff className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
        <div>
          <p className="font-medium text-destructive">Browser notifications blocked</p>
          <p className="mt-0.5 text-muted-foreground">
            You&apos;ve blocked notifications for this site. Please allow them in
            your browser settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-none border border-border bg-muted/40 px-4 py-3">
      <Monitor className="h-4 w-4 shrink-0 text-muted-foreground" />
      <p className="flex-1 text-sm text-muted-foreground">
        Allow browser notifications to receive alerts when SIMS is in the
        background.
      </p>
      <Button size="sm" variant="outline" onClick={onRequest}>
        Allow
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Settings component
// ---------------------------------------------------------------------------

export function NotificationSettings() {
  const { data: serverPrefs, isLoading } = useNotificationPreferences();
  const { mutate: updatePrefs, isPending } = useUpdateNotificationPreferences();
  const [permission, setPermission] = React.useState(getCurrentPermission());

  const form = useForm<NotificationPreferencesFormValues>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues: DEFAULT_PREFERENCES,
  });

  // Populate form once server prefs load
  React.useEffect(() => {
    if (serverPrefs) {
      form.reset({
        enable_websocket: serverPrefs.enable_websocket,
        enable_email: serverPrefs.enable_email,
        enable_system: serverPrefs.enable_system,
        mute_until: serverPrefs.mute_until,
      });
    }
  }, [serverPrefs, form]);

  async function handleRequestPermission() {
    const result = await requestPermission();
    setPermission(result);
    if (result === "granted") {
      form.setValue("enable_system", true);
    }
  }

  function onSubmit(values: NotificationPreferencesFormValues) {
    updatePrefs({
      enable_websocket: values.enable_websocket,
      enable_email: values.enable_email,
      enable_system: values.enable_system,
      mute_until: values.mute_until,
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-4 w-40 animate-pulse rounded-none bg-muted" />
              <div className="h-3 w-64 animate-pulse rounded-none bg-muted" />
            </div>
            <div className="h-5 w-9 animate-pulse rounded-none bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Browser permission banner */}
        <BrowserPermissionBanner
          permission={permission}
          onRequest={handleRequestPermission}
        />

        {/* Global toggles */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Notification Channels</h3>

          <FormField
            control={form.control}
            name="enable_websocket"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <FormLabel className="flex items-center gap-2 text-sm font-normal">
                    <Wifi className="h-3.5 w-3.5 text-muted-foreground" />
                    Live WebSocket Notifications
                  </FormLabel>
                  <FormDescription className="text-xs">
                    Receive instant real-time notifications in-app when connected
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Enable live notifications"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enable_email"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <FormLabel className="flex items-center gap-2 text-sm font-normal">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    Email Notifications
                  </FormLabel>
                  <FormDescription className="text-xs">
                    Receive email digests and reports on system and inventory alerts
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Enable email notifications"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enable_system"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <FormLabel className="flex items-center gap-2 text-sm font-normal">
                    <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                    System Notifications
                  </FormLabel>
                  <FormDescription className="text-xs">
                    Receive browser desktop notifications when the app is in background
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      if (checked && permission !== "granted") {
                        handleRequestPermission();
                      } else {
                        field.onChange(checked);
                      }
                    }}
                    aria-label="Enable system notifications"
                    disabled={permission === "denied"}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Mute Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Silence Alerts</h3>
          
          <FormField
            control={form.control}
            name="mute_until"
            render={({ field }) => {
              let selectValue = "none";
              if (field.value) {
                const diff = new Date(field.value).getTime() - Date.now();
                if (diff <= 0) {
                  selectValue = "none";
                } else if (diff <= 65 * 60 * 1000) {
                  selectValue = "1h";
                } else if (diff <= 8.5 * 60 * 60 * 1000) {
                  selectValue = "8h";
                } else if (diff <= 24.5 * 60 * 60 * 1000) {
                  selectValue = "24h";
                } else {
                  selectValue = "7d";
                }
              }

              const handleMuteChange = (val: string) => {
                if (val === "none") {
                  field.onChange(null);
                } else {
                  let duration = 0;
                  if (val === "1h") duration = 60 * 60 * 1000;
                  else if (val === "8h") duration = 8 * 60 * 60 * 1000;
                  else if (val === "24h") duration = 24 * 60 * 60 * 1000;
                  else if (val === "7d") duration = 7 * 24 * 60 * 60 * 1000;
                  field.onChange(new Date(Date.now() + duration).toISOString());
                }
              };

              return (
                <div className="space-y-2">
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Mute Notifications
                    </FormLabel>
                    <Select value={selectValue} onValueChange={handleMuteChange}>
                      <FormControl>
                        <SelectTrigger className="rounded-none border-border">
                          <SelectValue placeholder="Select mute duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-none">
                        <SelectItem value="none">Don't mute (Receive all alerts)</SelectItem>
                        <SelectItem value="1h">Mute for 1 Hour</SelectItem>
                        <SelectItem value="8h">Mute for 8 Hours</SelectItem>
                        <SelectItem value="24h">Mute for 24 Hours</SelectItem>
                        <SelectItem value="7d">Mute for 7 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                  {field.value && new Date(field.value).getTime() > Date.now() && (
                    <p className="text-xs text-amber-500 font-medium">
                      All notifications are currently muted until: {new Date(field.value).toLocaleString()}
                    </p>
                  )}
                </div>
              );
            }}
          />
        </div>

        {/* Save */}
        <div className="flex justify-end pt-4 border-t border-border">
          <Button type="submit" disabled={isPending} className="rounded-none">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Saving…
              </>
            ) : (
              "Save Preferences"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
