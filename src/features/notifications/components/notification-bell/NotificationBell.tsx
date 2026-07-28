"use client";

import * as React from "react";
import { Bell, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { cn } from "@/utils/cn";
import { NotificationPanel } from "../notification-panel/NotificationPanel";
import { useUnreadCount } from "../../hooks/use-notifications";
import { useWsNotifications } from "../../websocket/use-ws-notifications";

// ---------------------------------------------------------------------------
// Connection status dot
// ---------------------------------------------------------------------------

function ConnectionDot({ isConnected }: { isConnected: boolean }) {
  return (
    <span
      className={cn(
        "absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full ring-1 ring-background",
        isConnected ? "bg-emerald-500" : "bg-muted-foreground/50"
      )}
      aria-label={isConnected ? "Real-time connected" : "Real-time disconnected"}
      title={isConnected ? "Live updates active" : "Live updates unavailable"}
    />
  );
}

// ---------------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------------

function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      aria-label={`${count} unread notification${count !== 1 ? "s" : ""}`}
      className={cn(
        "absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center",
        "rounded-full bg-destructive px-1 text-[9px] font-bold leading-none text-white",
        "animate-in zoom-in-50 duration-200"
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

// ---------------------------------------------------------------------------
// NotificationBell
// ---------------------------------------------------------------------------

export function NotificationBell() {
  const [open, setOpen] = React.useState(false);
  const { data: unreadCount = 0 } = useUnreadCount();
  const { isConnected } = useWsNotifications();

  // Announce new notifications to screen readers
  const prevCount = React.useRef(unreadCount);
  const [announcement, setAnnouncement] = React.useState("");

  React.useEffect(() => {
    if (unreadCount > prevCount.current) {
      const diff = unreadCount - prevCount.current;
      setAnnouncement(
        `${diff} new notification${diff !== 1 ? "s" : ""} received.`
      );
    }
    prevCount.current = unreadCount;
  }, [unreadCount]);

  return (
    <>
      {/* Live region for screen readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="notification-bell"
            variant="ghost"
            size="icon"
            className="relative h-8 w-8"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
            aria-haspopup="dialog"
            aria-expanded={open}
          >
            <Bell
              className={cn(
                "h-4 w-4 transition-transform",
                open && "scale-110"
              )}
            />
            <UnreadBadge count={unreadCount} />
            <ConnectionDot isConnected={isConnected} />
            {/* Screen-reader-only status */}
            <span className="sr-only">
              {isConnected ? (
                <Wifi className="h-0 w-0" />
              ) : (
                <WifiOff className="h-0 w-0" />
              )}
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={8}
          className="p-0 shadow-xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <NotificationPanel onClose={() => setOpen(false)} />
        </PopoverContent>
      </Popover>
    </>
  );
}
