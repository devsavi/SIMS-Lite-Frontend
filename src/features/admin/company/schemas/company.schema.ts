import { z } from "zod";

export const companyProfileSchema = z.object({
  legal_name: z.string().min(2, "Company legal name is required"),
  logo_url: z.string().optional().nullable(),
  business_registration_no: z.string().optional().nullable(),
  tax_registration_no: z.string().optional().nullable(),
  contact_email: z.string().email("Valid email is required").optional().nullable().or(z.literal("")),
  contact_phone: z.string().optional().nullable(),
  website_url: z
    .string()
    .url("Valid URL format required (e.g. https://example.com)")
    .optional()
    .nullable()
    .or(z.literal("")),
  street_address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  base_currency: z.string().min(3, "Currency code is required (e.g. USD, EUR, LKR)"),
});

export type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>;
