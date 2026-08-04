/**
 * Notifications feature — Zod validation schemas.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Compose notification (admin)
// ---------------------------------------------------------------------------

export const composeNotificationSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(120, "Title must not exceed 120 characters"),
    message: z
      .string()
      .min(5, "Message must be at least 5 characters")
      .max(1000, "Message must not exceed 1 000 characters"),
    type: z.enum(
      [
        "SYSTEM",
        "SUCCESS",
        "INFO",
        "WARNING",
        "ERROR",
        "PURCHASE_ORDER",
        "GRN",
        "STOCK_RELEASE",
        "INVENTORY",
        "LOW_STOCK",
        "OUT_OF_STOCK",
        "USER",
        "SECURITY",
      ],
      { required_error: "Please select a notification type" }
    ),
    priority: z
      .enum(["LOW", "NORMAL", "HIGH", "CRITICAL"], {
        required_error: "Please select a priority",
      })
      .default("NORMAL"),
    recipient_type: z.enum(["all", "role", "user"], {
      required_error: "Please select who should receive this notification",
    }),
    recipient_role: z.enum(["ADMIN", "OFFICER", "STORE_KEEPER"]).optional(),
    recipient_user_id: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.recipient_type === "role" && !data.recipient_role) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["recipient_role"],
        message: "Please select a role",
      });
    }
    if (data.recipient_type === "user" && !data.recipient_user_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["recipient_user_id"],
        message: "Please enter a user ID",
      });
    }
  });

export type ComposeNotificationFormValues = z.infer<typeof composeNotificationSchema>;

// ---------------------------------------------------------------------------
// Notification preferences
// ---------------------------------------------------------------------------

export const notificationPreferencesSchema = z.object({
  enable_websocket: z.boolean(),
  enable_email: z.boolean(),
  enable_system: z.boolean(),
  mute_until: z.string().nullable().optional(),
});

export type NotificationPreferencesFormValues = z.infer<
  typeof notificationPreferencesSchema
>;
