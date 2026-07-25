/**
 * Permission guard — unit tests
 */

import { describe, it, expect } from "vitest";
import { canAccess, canAccessAll, canAccessAny, getPermissions } from "../permissions";

describe("canAccess()", () => {
  it("admin can access all permissions", () => {
    expect(canAccess("admin", "users.create")).toBe(true);
    expect(canAccess("admin", "settings.edit")).toBe(true);
    expect(canAccess("admin", "stock_release.approve")).toBe(true);
  });

  it("stock_clerk can only access their own permissions", () => {
    expect(canAccess("stock_clerk", "inventory.view")).toBe(true);
    expect(canAccess("stock_clerk", "stock_release.view")).toBe(true);
    expect(canAccess("stock_clerk", "users.create")).toBe(false);
    expect(canAccess("stock_clerk", "products.delete")).toBe(false);
    expect(canAccess("stock_clerk", "settings.edit")).toBe(false);
  });

  it("procurement_officer has appropriate permissions", () => {
    expect(canAccess("procurement_officer", "purchase_orders.create")).toBe(true);
    expect(canAccess("procurement_officer", "suppliers.view")).toBe(true);
    expect(canAccess("procurement_officer", "users.delete")).toBe(false);
    expect(canAccess("procurement_officer", "settings.edit")).toBe(false);
  });

  it("returns false for unknown role", () => {
    // @ts-expect-error — testing unknown role
    expect(canAccess("unknown_role", "dashboard.view")).toBe(false);
  });
});

describe("canAccessAll()", () => {
  it("returns true when role has all permissions", () => {
    expect(canAccessAll("admin", ["users.view", "users.create", "users.delete"])).toBe(true);
  });

  it("returns false when role is missing one permission", () => {
    expect(canAccessAll("stock_clerk", ["inventory.view", "users.delete"])).toBe(false);
  });

  it("returns true for empty permission array", () => {
    expect(canAccessAll("viewer", [])).toBe(true);
  });
});

describe("canAccessAny()", () => {
  it("returns true when role has at least one permission", () => {
    expect(canAccessAny("stock_clerk", ["users.create", "inventory.view"])).toBe(true);
  });

  it("returns false when role has none of the permissions", () => {
    expect(canAccessAny("stock_clerk", ["users.create", "settings.edit"])).toBe(false);
  });

  it("returns false for empty permission array", () => {
    expect(canAccessAny("admin", [])).toBe(false);
  });
});

describe("getPermissions()", () => {
  it("returns non-empty array for admin", () => {
    expect(getPermissions("admin").length).toBeGreaterThan(0);
  });

  it("admin has more permissions than stock_clerk", () => {
    const adminPerms = getPermissions("admin");
    const clerkPerms = getPermissions("stock_clerk");
    expect(adminPerms.length).toBeGreaterThan(clerkPerms.length);
  });
});
