/**
 * Master Data Schemas — Zod validation tests
 */

import { describe, it, expect } from "vitest";
import {
  categorySchema,
  brandSchema,
  uomSchema,
  supplierSchema,
  productSchema,
} from "../schemas";

// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------

describe("categorySchema", () => {
  it("accepts a valid category", () => {
    const result = categorySchema.safeParse({
      name: "Electronics",
      description: "All electronic products",
      parent_id: null,
      is_active: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = categorySchema.safeParse({ name: "", is_active: true });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toBeDefined();
    }
  });

  it("rejects name exceeding 100 characters", () => {
    const result = categorySchema.safeParse({
      name: "A".repeat(101),
      is_active: true,
    });
    expect(result.success).toBe(false);
  });

  it("defaults is_active to true", () => {
    const result = categorySchema.safeParse({ name: "Test" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.is_active).toBe(true);
    }
  });

  it("accepts null parent_id", () => {
    const result = categorySchema.safeParse({ name: "Top Level", parent_id: null });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Brand
// ---------------------------------------------------------------------------

describe("brandSchema", () => {
  it("accepts a valid brand", () => {
    const result = brandSchema.safeParse({
      name: "Samsung",
      website_url: "https://samsung.com",
      is_active: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = brandSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid website URL", () => {
    const result = brandSchema.safeParse({
      name: "TestBrand",
      website_url: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty website URL", () => {
    const result = brandSchema.safeParse({ name: "TestBrand", website_url: "" });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// UoM
// ---------------------------------------------------------------------------

describe("uomSchema", () => {
  it("accepts a valid UoM", () => {
    const result = uomSchema.safeParse({
      name: "Kilogram",
      symbol: "kg",
      is_active: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing symbol", () => {
    const result = uomSchema.safeParse({ name: "Kilogram", symbol: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.symbol).toBeDefined();
    }
  });

  it("rejects symbol over 20 characters", () => {
    const result = uomSchema.safeParse({
      name: "Test",
      symbol: "A".repeat(21),
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Supplier
// ---------------------------------------------------------------------------

describe("supplierSchema", () => {
  it("accepts a minimal valid supplier", () => {
    const result = supplierSchema.safeParse({
      company_name: "Acme Corp",
      is_active: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a full supplier", () => {
    const result = supplierSchema.safeParse({
      company_name: "Global Supplies Inc",
      contact_person: "John Smith",
      email: "john@globalsupplies.com",
      phone: "+1 555 123 4567",
      address: "123 Main St",
      city: "New York",
      country: "United States",
      notes: "Preferred supplier",
      is_active: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty company name", () => {
    const result = supplierSchema.safeParse({ company_name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = supplierSchema.safeParse({
      company_name: "Test Corp",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty email (optional)", () => {
    const result = supplierSchema.safeParse({
      company_name: "Test Corp",
      email: "",
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Product
// ---------------------------------------------------------------------------

describe("productSchema", () => {
  it("accepts a minimal valid product", () => {
    const result = productSchema.safeParse({
      name: "USB Cable",
      is_active: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a full product", () => {
    const result = productSchema.safeParse({
      name: "USB-C Cable 2m",
      short_description: "A 2m USB-C cable",
      description: "High quality USB-C cable",
      category_id: "550e8400-e29b-41d4-a716-446655440000",
      brand_id: "550e8400-e29b-41d4-a716-446655440001",
      uom_id: "550e8400-e29b-41d4-a716-446655440002",
      supplier_id: "550e8400-e29b-41d4-a716-446655440003",
      cost_price: 50,
      selling_price: 100,
      reorder_level: 10,
      reorder_quantity: 15,
      is_active: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = productSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects negative cost_price", () => {
    const result = productSchema.safeParse({
      name: "Product",
      cost_price: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative reorder_level", () => {
    const result = productSchema.safeParse({
      name: "Product",
      reorder_level: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer reorder_quantity", () => {
    const result = productSchema.safeParse({
      name: "Product",
      reorder_quantity: 1.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid category UUID", () => {
    const result = productSchema.safeParse({
      name: "Product",
      category_id: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("accepts null category_id", () => {
    const result = productSchema.safeParse({
      name: "Product",
      category_id: null,
    });
    expect(result.success).toBe(true);
  });

  it("defaults numeric fields to 0", () => {
    const result = productSchema.safeParse({ name: "Product" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cost_price).toBe(0);
      expect(result.data.selling_price).toBe(0);
      expect(result.data.reorder_level).toBe(0);
      expect(result.data.reorder_quantity).toBe(0);
    }
  });
});
