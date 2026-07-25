"use client";

import * as React from "react";
import { Bell, Sun, Moon, Monitor } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { useNotificationsStore } from "@/stores/notifications.store";
import { useAppTheme } from "@/hooks/use-theme";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

function ThemeToggle() {
  const { setTheme, resolvedTheme, mounted } = useAppTheme();

  if (!mounted) {
    return (
      <div className="h-8 w-8" aria-hidden="true" />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          className="h-8 w-8"
        >
          {resolvedTheme === "dark" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationBell() {
  const unreadCount = useNotificationsStore((s) => s.unreadCount);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      className="relative h-8 w-8"
      // onClick to open notifications panel — Phase 9
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span
          aria-hidden="true"
          className="absolute right-1.5 top-1.5 flex h-2 w-2 items-center justify-center bg-destructive"
        />
      )}
    </Button>
  );
}

export function AppHeader() {
  return (
    <header
      role="banner"
      className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-6"
    >
      {/* Left — page title placeholder (filled per-page via context/slot) */}
      <div className="flex items-center gap-3">
        {/* Empty on mobile (hamburger is absolutely positioned by AppSidebar) */}
        <div className="hidden md:block" />
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <NotificationBell />
        <div className="ml-1 h-5 w-px bg-border" aria-hidden="true" />
        <UserMenu />
      </div>
    </header>
  );
}
