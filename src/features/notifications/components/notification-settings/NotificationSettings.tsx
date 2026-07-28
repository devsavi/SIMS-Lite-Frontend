"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bell, BellOff, Loader2, Monitor } from "lucide-react";
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
import { cn } from "@/utils/cn";
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
import type { NotificationCategory } from "../../types";

// ---------------------------------------------------------------------------
// Category config
// ---------------------------------------------------------------------------

const CATEGORIES: { key: NotificationCategory; label: string; description: string }[] = [
  {
    key: "inventory",
    label: "Inventory",
    description: "Low stock alerts, adjustments, and stock changes",
  },
  {
    key: "procurement",
    label: "Procurement",
    description: "Purchase order and GRN status updates",
  },
  {
    key: "stock_release",
    label: "Stock Release",
    description: "Approvals and rejections of stock release requests",
  },
  {
    key: "administration",
    label: "Administration",
    description: "User management and role changes",
  },
  {
    key: "system",
    label: "System",
    description: "Maintenance notices and broadcast messages",
  },
  {
    key: "general",
    label: "General",
    description: "Other notifications",
  },
];

// ---------------------------------------------------------------------------
// Default preferences
// ---------------------------------------------------------------------------

const DEFAULT_PREFERENCES: NotificationPreferencesFormValues = {
  browser_notifications_enabled: false,
  in_app_notifications_enabled: true,
  categories: {
    inventory: true,
    procurement: true,
    stock_release: true,
    administration: true,
    system: true,
    general: true,
  },
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
      <div className="flex items-start gap-3 rounded-sm border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
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
    <div className="flex items-center gap-3 rounded-sm border border-border bg-muted/40 px-4 py-3">
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
        browser_notifications_enabled: serverPrefs.browser_notifications_enabled,
        in_app_notifications_enabled: serverPrefs.in_app_notifications_enabled,
        categories: serverPrefs.categories as NotificationPreferencesFormValues["categories"],
      });
    }
  }, [serverPrefs, form]);

  async function handleRequestPermission() {
    const result = await requestPermission();
    setPermission(result);
    if (result === "granted") {
      form.setValue("browser_notifications_enabled", true);
    }
  }

  function onSubmit(values: NotificationPreferencesFormValues) {
    updatePrefs({
      browser_notifications_enabled: values.browser_notifications_enabled,
      in_app_notifications_enabled: values.in_app_notifications_enabled,
      categories: values.categories,
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-4 w-40 animate-pulse rounded bg-muted" />
              <div className="h-3 w-64 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-5 w-9 animate-pulse rounded-full bg-muted" />
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
            name="browser_notifications_enabled"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <FormLabel className="flex items-center gap-2 text-sm font-normal">
                    <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                    Browser Notifications
                  </FormLabel>
                  <FormDescription className="text-xs">
                    Show desktop notifications when SIMS is in the background
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
                    aria-label="Enable browser notifications"
                    disabled={permission === "denied"}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="in_app_notifications_enabled"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <FormLabel className="flex items-center gap-2 text-sm font-normal">
                    <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                    In-App Notifications
                  </FormLabel>
                  <FormDescription className="text-xs">
                    Show toast notifications and the bell badge
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Enable in-app notifications"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Per-category toggles */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Notification Categories</h3>
          <div className="space-y-3">
            {CATEGORIES.map((cat) => (
              <FormField
                key={cat.key}
                control={form.control}
                name={`categories.${cat.key}`}
                render={({ field }) => (
                  <FormItem
                    className={cn(
                      "flex items-center justify-between gap-4 rounded-sm p-3",
                      "border border-border hover:bg-muted/30 transition-colors"
                    )}
                  >
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-normal">
                        {cat.label}
                      </FormLabel>
                      <FormDescription className="text-xs">
                        {cat.description}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-label={`Enable ${cat.label} notifications`}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
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
