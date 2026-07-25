"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/app/components/ui/button";
import type { ButtonProps } from "@/app/components/ui/button";

// ---------------------------------------------------------------------------
// CopyButton
// ---------------------------------------------------------------------------

export interface CopyButtonProps extends Omit<ButtonProps, "onClick"> {
  /** Text to copy to clipboard */
  value: string;
  /** Duration (ms) the check icon is shown after copying. Defaults to 2000 */
  successDuration?: number;
}

/**
 * CopyButton — copies a value to the clipboard with visual feedback.
 *
 * @example
 * <CopyButton value="some-api-key" variant="ghost" size="icon" />
 */
export function CopyButton({
  value,
  successDuration = 2000,
  className,
  children,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), successDuration);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = value;
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), successDuration);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={copied ? "Copied!" : "Copy to clipboard"}
      onClick={handleCopy}
      className={cn("shrink-0", className)}
      {...props}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden="true" />
      ) : (
        <Copy className="h-4 w-4" aria-hidden="true" />
      )}
      {children}
    </Button>
  );
}
