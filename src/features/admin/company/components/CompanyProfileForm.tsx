"use client";

import React from "react";
import { Save, CheckCircle2 } from "lucide-react";
import type { CompanyProfile, UpdateCompanyDTO } from "../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

interface CompanyProfileFormProps {
  profile: CompanyProfile;
  onSave: (data: UpdateCompanyDTO) => Promise<void>;
  isSubmitting: boolean;
}

export function CompanyProfileForm({ profile, onSave, isSubmitting }: CompanyProfileFormProps) {
  const [formData, setFormData] = React.useState<UpdateCompanyDTO>({
    legal_name: profile.legal_name || "",
    logo_url: profile.logo_url || "",
    business_registration_no: profile.business_registration_no || "",
    tax_registration_no: profile.tax_registration_no || "",
    contact_email: profile.contact_email || "",
    contact_phone: profile.contact_phone || "",
    website_url: profile.website_url || "",
    street_address: profile.street_address || "",
    city: profile.city || "",
    state: profile.state || "",
    postal_code: profile.postal_code || "",
    country: profile.country || "",
    base_currency: profile.base_currency || "USD",
  });

  const [savedSuccess, setSavedSuccess] = React.useState(false);
  const [imageFailed, setImageFailed] = React.useState(false);

  React.useEffect(() => {
    setFormData({
      legal_name: profile.legal_name || "",
      logo_url: profile.logo_url || "",
      business_registration_no: profile.business_registration_no || "",
      tax_registration_no: profile.tax_registration_no || "",
      contact_email: profile.contact_email || "",
      contact_phone: profile.contact_phone || "",
      website_url: profile.website_url || "",
      street_address: profile.street_address || "",
      city: profile.city || "",
      state: profile.state || "",
      postal_code: profile.postal_code || "",
      country: profile.country || "",
      base_currency: profile.base_currency || "USD",
    });
  }, [profile]);

  React.useEffect(() => {
    setImageFailed(false);
  }, [formData.logo_url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-none border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Organization Identity</h3>
          <p className="text-xs text-muted-foreground">
            Information displayed on system invoices, purchase orders, and official documentation.
          </p>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center gap-1.5 rounded-none bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4" /> Changes saved
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        {/* Company Logo Section */}
        <div className="sm:col-span-2 flex flex-col gap-4 border-b border-border pb-4">
          <label className="block font-medium">Company Logo</label>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="h-20 w-20 overflow-hidden border border-border bg-primary/10 flex items-center justify-center shrink-0">
              {formData.logo_url && !imageFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={formData.logo_url}
                  alt="Company Logo Preview"
                  className="h-full w-full object-contain p-2 bg-transparent"
                  onError={() => {
                    setImageFailed(true);
                  }}
                />
              ) : (
                <span className="text-2xl font-bold text-primary">
                  {(formData.legal_name || "C").charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1 w-full space-y-2">
              <input
                type="text"
                placeholder="https://example.com/logo.png"
                value={formData.logo_url || ""}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <p className="text-xs text-muted-foreground">
                Provide a valid URL to your organization's logo image.
              </p>
            </div>
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="block font-medium mb-1">Company Legal Name *</label>
          <input
            type="text"
            required
            value={formData.legal_name}
            onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
            className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Business Registration No. (BRN)</label>
          <input
            type="text"
            value={formData.business_registration_no || ""}
            onChange={(e) => setFormData({ ...formData, business_registration_no: e.target.value })}
            className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Tax Registration No. (VAT / TIN)</label>
          <input
            type="text"
            value={formData.tax_registration_no || ""}
            onChange={(e) => setFormData({ ...formData, tax_registration_no: e.target.value })}
            className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Official Contact Email</label>
          <input
            type="email"
            value={formData.contact_email || ""}
            onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
            className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Contact Phone</label>
          <input
            type="tel"
            value={formData.contact_phone || ""}
            onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
            className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block font-medium mb-1">Website URL</label>
          <input
            type="url"
            value={formData.website_url || ""}
            onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
            className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="https://example.com"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block font-medium mb-1">Street Address</label>
          <input
            type="text"
            value={formData.street_address || ""}
            onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
            className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">City</label>
          <input
            type="text"
            value={formData.city || ""}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">State / Province</label>
          <input
            type="text"
            value={formData.state || ""}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Postal / Zip Code</label>
          <input
            type="text"
            value={formData.postal_code || ""}
            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
            className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Country</label>
          <input
            type="text"
            value={formData.country || ""}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Base System Currency *</label>
          <Select
            value={formData.base_currency}
            onValueChange={(v) => setFormData({ ...formData, base_currency: v })}
          >
            <SelectTrigger className="w-full h-[38px] text-sm rounded-none border border-input bg-background px-3 py-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD — US Dollar ($)</SelectItem>
              <SelectItem value="EUR">EUR — Euro (€)</SelectItem>
              <SelectItem value="GBP">GBP — British Pound (£)</SelectItem>
              <SelectItem value="LKR">LKR — Sri Lankan Rupee (Rs)</SelectItem>
              <SelectItem value="AUD">AUD — Australian Dollar ($)</SelectItem>
              <SelectItem value="CAD">CAD — Canadian Dollar ($)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-end border-t border-border pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-none bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? "Saving Company Profile..." : "Save Company Profile"}
        </button>
      </div>
    </form>
  );
}
