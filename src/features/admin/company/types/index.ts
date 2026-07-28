export interface CompanyProfile {
  id: string;
  name: string;
  logoUrl?: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  taxRegistrationNumber: string;
  businessRegistrationNumber: string;
  currency: string;
  updatedAt: string;
}

export interface UpdateCompanyDTO {
  name: string;
  logoUrl?: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  taxRegistrationNumber: string;
  businessRegistrationNumber: string;
  currency: string;
}

export interface LogoUploadResponse {
  logoUrl: string;
  filename: string;
}
