"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sun, Moon, Monitor, ChevronRight, Clock, Calendar, Maximize, Minimize } from "lucide-react";
import Link from "next/link";
import { UserMenu } from "./UserMenu";
import { useAppTheme } from "@/hooks/use-theme";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { NotificationBell } from "@/features/notifications";
import { formatDate } from "@/utils/format";

const ROUTE_LABELS: Record<string, { parent?: string; title: string }> = {
  "/dashboard": { title: "Dashboard" },
  "/users": { title: "User Management" },
  "/products": { title: "Products" },
  "/categories": { title: "Categories" },
  "/brands": { title: "Brands" },
  "/suppliers": { title: "Suppliers" },
  "/procurement/purchase-orders": { parent: "Procurement", title: "Purchase Orders" },
  "/procurement/grns": { parent: "Procurement", title: "Goods Received Notes" },
  "/inventory": { title: "Inventory Management" },
  "/stock-release": { title: "Stock Release Requests" },
  "/notifications": { title: "Notification Center" },
  "/reports": { title: "Reports & Analytics" },
  "/profile": { title: "User Profile" },
  "/admin/company": { parent: "Administration", title: "Company Profile" },
  "/admin/settings": { parent: "Administration", title: "System Settings" },
  "/admin/email": { parent: "Administration", title: "Email Config" },
  "/admin/sequences": { parent: "Administration", title: "Numbering Sequences" },
  "/admin/activity": { parent: "Administration", title: "Activity Log" },
  "/admin/audit": { parent: "Administration", title: "Audit Trail" },
};

function ThemeToggle() {
  const { setTheme, resolvedTheme, mounted } = useAppTheme();

  if (!mounted) {
    return <div className="h-8 w-8" aria-hidden="true" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Toggle theme (current: ${resolvedTheme})`}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          {resolvedTheme === "dark" ? (
            <Moon className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Sun className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" aria-hidden="true" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" aria-hidden="true" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" aria-hidden="true" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FullscreenToggle() {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.error("Error attempting to toggle full-screen mode:", err);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleFullscreen}
      aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
      className="h-8 w-8 text-muted-foreground hover:text-foreground"
    >
      {isFullscreen ? (
        <Minimize className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Maximize className="h-4 w-4" aria-hidden="true" />
      )}
    </Button>
  );
}

function DateTimeShower() {
  const [time, setTime] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return null;

  const formattedTime = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return (
    <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground mr-3 bg-muted/40 border border-border/80 px-2.5 py-1">
      <div className="flex items-center gap-1.5 font-medium">
        <Calendar className="h-3.5 w-3.5 text-primary" />
        <span>{formatDate(time)}</span>
      </div>
      <div className="h-3 w-px bg-border" />
      <div className="flex items-center gap-1.5 font-mono font-medium">
        <Clock className="h-3.5 w-3.5 text-primary" />
        <span>{formattedTime}</span>
      </div>
    </div>
  );
}

export function AppHeader() {
  const pathname = usePathname();
  const safePathname = pathname || "/";
  const routeInfo = ROUTE_LABELS[safePathname] ?? {
    title: safePathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") ?? "Dashboard",
  };

  return (
    <header
      role="banner"
      aria-label="Application Header"
      className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/95 backdrop-blur-sm px-4 md:px-6 transition-colors"
    >
      {/* Left — Dynamic Breadcrumb / Page Title */}
      <div className="flex items-center gap-2 text-sm font-medium">
        <div className="hidden items-center gap-2 md:flex">
          {routeInfo.parent && (
            <>
              <span className="text-muted-foreground">{routeInfo.parent}</span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden="true" />
            </>
          )}
          <span className="font-semibold text-foreground">{routeInfo.title}</span>
        </div>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-1.5">
        <DateTimeShower />
        <FullscreenToggle />
        <ThemeToggle />
        <NotificationBell />
        <div className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
        <UserMenu />
      </div>
    </header>
  );
}

