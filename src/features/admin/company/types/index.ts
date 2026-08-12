export interface CompanyProfile {
  id: string;
  legal_name?: string;
  logo_url?: string | null;
  business_registration_no?: string | null;
  tax_registration_no?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  website_url?: string | null;
  street_address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  base_currency?: string;
  created_at?: string;
  updated_at?: string;

  // camelCase aliases used in tests
  name?: string;
  currency?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  postalCode?: string;
  taxRegistrationNumber?: string;
  businessRegistrationNumber?: string;
  logoUrl?: string | null;
  updatedAt?: string;
}

export interface UpdateCompanyDTO {
  legal_name?: string;
  logo_url?: string | null;
  business_registration_no?: string | null;
  tax_registration_no?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  website_url?: string | null;
  street_address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  base_currency?: string;

  // camelCase alias used in tests
  name?: string;
  logoUrl?: string | null;
  address?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxRegistrationNumber?: string;
  businessRegistrationNumber?: string;
  currency?: string;
}
