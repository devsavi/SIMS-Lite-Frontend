import * as React from "react";
import { cn } from "@/utils/cn";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AvatarGroupItem {
  id: string;
  name: string;
  src?: string;
}

export interface AvatarGroupProps {
  /** Array of user objects to display */
  users: AvatarGroupItem[];
  /** Maximum number of avatars shown before showing overflow. Defaults to 4 */
  max?: number;
  /** Avatar size (controls width/height) */
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-11 w-11 text-base",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

/**
 * AvatarGroup — overlapping avatar stack for displaying collaborators or assignees.
 *
 * @example
 * <AvatarGroup users={members} max={3} />
 */
export function AvatarGroup({
  users,
  max = 4,
  size = "md",
  className,
}: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <div
      className={cn("flex items-center -space-x-2", className)}
      aria-label={`${users.length} user${users.length === 1 ? "" : "s"}`}
      role="group"
    >
      {visible.map((user) => (
        <Avatar
          key={user.id}
          className={cn(
            sizeClasses[size],
            "border-2 border-background ring-0"
          )}
          title={user.name}
        >
          {user.src && <AvatarImage src={user.src} alt={user.name} />}
          <AvatarFallback className="text-[length:inherit]">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            sizeClasses[size],
            "flex items-center justify-center border-2 border-background bg-muted text-muted-foreground"
          )}
          aria-label={`${overflow} more user${overflow === 1 ? "" : "s"}`}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
