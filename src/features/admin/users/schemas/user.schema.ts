import { z } from "zod";

export const USER_ROLES = [
  "admin",
  "officer",
  "store_keeper",
] as const;


export const USER_STATUSES = ["ACTIVE", "INACTIVE", "PENDING"] as const;

export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  role: z.enum(USER_ROLES, {
    required_error: "Please select a user role",
  }),
  department: z.string().optional(),
  phone: z.string().optional(),
  sendInviteEmail: z.boolean().optional().default(true),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  role: z.enum(USER_ROLES),
  status: z.enum(USER_STATUSES),
  department: z.string().optional(),
  phone: z.string().optional(),
});

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    requirePasswordChangeOnLogin: z.boolean().default(true),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const assignRoleSchema = z.object({
  role: z.enum(USER_ROLES, {
    required_error: "Please select a role",
  }),
  reason: z.string().optional(),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type AssignRoleFormValues = z.infer<typeof assignRoleSchema>;
