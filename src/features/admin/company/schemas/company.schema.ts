import { z } from "zod";

export const companyProfileSchema = z.object({
  name: z.string().min(2, "Company name is required"),
  logoUrl: z.string().optional(),
  address: z.string().min(3, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State/Province is required"),
  postalCode: z.string().min(2, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
  phone: z.string().min(5, "Phone number is required"),
  email: z.string().email("Valid email is required"),
  website: z.string().url("Valid URL format required (e.g. https://example.com)").or(z.literal("")),
  taxRegistrationNumber: z.string().optional().default(""),
  businessRegistrationNumber: z.string().min(2, "Business registration number is required"),
  currency: z.string().min(3, "Currency code is required (e.g. USD, EUR, LKR)"),
});

export type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>;
