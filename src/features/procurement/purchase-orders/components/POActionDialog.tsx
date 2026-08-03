"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Input } from "@/app/components/ui/input";

// ---------------------------------------------------------------------------
// Generic confirmation / reason dialog
// ---------------------------------------------------------------------------

export interface POActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  actionLabel: string;
  variant?: "default" | "destructive";
  requireReason?: boolean;
  reasonLabel?: string;
  isLoading?: boolean;
  onConfirm: (reason?: string) => void;
}

export function POActionDialog({
  open,
  onOpenChange,
  title,
  description,
  actionLabel,
  variant = "default",
  requireReason = false,
  reasonLabel = "Reason (optional)",
  isLoading = false,
  onConfirm,
}: POActionDialogProps) {
  const [reason, setReason] = React.useState("");

  const handleConfirm = () => {
    onConfirm(reason || undefined);
    setReason("");
  };

  const handleOpenChange = (op: boolean) => {
    if (!op) setReason("");
    onOpenChange(op);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {requireReason && (
          <div className="grid gap-2 py-2">
            <Label htmlFor="po-action-reason">{reasonLabel}</Label>
            <Textarea
              id="po-action-reason"
              placeholder="Enter reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={variant}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Email PO dialog
// ---------------------------------------------------------------------------

export interface POEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEmail?: string;
  isLoading?: boolean;
  onConfirm: (toEmail: string, message: string) => void;
}

export function POEmailDialog({
  open,
  onOpenChange,
  defaultEmail = "",
  isLoading = false,
  onConfirm,
}: POEmailDialogProps) {
  const [toEmail, setToEmail] = React.useState(defaultEmail);
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    setToEmail(defaultEmail);
  }, [defaultEmail]);

  const handleConfirm = () => {
    if (!toEmail.trim()) return;
    onConfirm(toEmail.trim(), message);
  };

  const handleOpenChange = (op: boolean) => {
    if (!op) {
      setToEmail(defaultEmail);
      setMessage("");
    }
    onOpenChange(op);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Email Purchase Order</DialogTitle>
          <DialogDescription>
            Send this purchase order to the supplier by email.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="po-email-to">To Email *</Label>
            <Input
              id="po-email-to"
              type="email"
              placeholder="supplier@example.com"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="po-email-message">Message (optional)</Label>
            <Textarea
              id="po-email-message"
              placeholder="Add a message to include with the email..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading || !toEmail.trim()}
          >
            {isLoading ? "Sending..." : "Send Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
