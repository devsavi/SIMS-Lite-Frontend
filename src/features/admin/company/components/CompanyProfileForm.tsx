"use client";

import React from "react";
import { Save, CheckCircle2 } from "lucide-react";
import type { CompanyProfile, UpdateCompanyDTO } from "../types";

interface CompanyProfileFormProps {
  profile: CompanyProfile;
  onSave: (data: UpdateCompanyDTO) => Promise<void>;
  isSubmitting: boolean;
}

export function CompanyProfileForm({ profile, onSave, isSubmitting }: CompanyProfileFormProps) {
  const [formData, setFormData] = React.useState<UpdateCompanyDTO>({
    name: profile.name || "",
    logoUrl: profile.logoUrl || "",
    address: profile.address || "",
    city: profile.city || "",
    state: profile.state || "",
    postalCode: profile.postalCode || "",
    country: profile.country || "",
    phone: profile.phone || "",
    email: profile.email || "",
    website: profile.website || "",
    taxRegistrationNumber: profile.taxRegistrationNumber || "",
    businessRegistrationNumber: profile.businessRegistrationNumber || "",
    currency: profile.currency || "USD",
  });

  const [savedSuccess, setSavedSuccess] = React.useState(false);

  React.useEffect(() => {
    setFormData({
      name: profile.name || "",
      logoUrl: profile.logoUrl || "",
      address: profile.address || "",
      city: profile.city || "",
      state: profile.state || "",
      postalCode: profile.postalCode || "",
      country: profile.country || "",
      phone: profile.phone || "",
      email: profile.email || "",
      website: profile.website || "",
      taxRegistrationNumber: profile.taxRegistrationNumber || "",
      businessRegistrationNumber: profile.businessRegistrationNumber || "",
      currency: profile.currency || "USD",
    });
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Organization Identity</h3>
          <p className="text-xs text-muted-foreground">
            Information displayed on system invoices, purchase orders, and official documentation.
          </p>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4" /> Changes saved
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="sm:col-span-2">
          <label className="block font-medium mb-1">Company Legal Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Business Registration No. (BRN) *</label>
          <input
            type="text"
            required
            value={formData.businessRegistrationNumber}
            onChange={(e) => setFormData({ ...formData, businessRegistrationNumber: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Tax Registration No. (VAT / TIN)</label>
          <input
            type="text"
            value={formData.taxRegistrationNumber}
            onChange={(e) => setFormData({ ...formData, taxRegistrationNumber: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Official Contact Email *</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Contact Phone *</label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block font-medium mb-1">Website URL</label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="https://example.com"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block font-medium mb-1">Street Address *</label>
          <input
            type="text"
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">City *</label>
          <input
            type="text"
            required
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">State / Province *</label>
          <input
            type="text"
            required
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Postal / Zip Code *</label>
          <input
            type="text"
            required
            value={formData.postalCode}
            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Country *</label>
          <input
            type="text"
            required
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Base System Currency *</label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="USD">USD — US Dollar ($)</option>
            <option value="EUR">EUR — Euro (€)</option>
            <option value="GBP">GBP — British Pound (£)</option>
            <option value="LKR">LKR — Sri Lankan Rupee (Rs)</option>
            <option value="AUD">AUD — Australian Dollar ($)</option>
            <option value="CAD">CAD — Canadian Dollar ($)</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end border-t border-border pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? "Saving Company Profile..." : "Save Company Profile"}
        </button>
      </div>
    </form>
  );
}
