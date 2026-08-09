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

  it("store_keeper can only access their own permissions", () => {
    expect(canAccess("store_keeper", "inventory.view")).toBe(true);
    expect(canAccess("store_keeper", "stock_release.view")).toBe(true);
    expect(canAccess("store_keeper", "users.view")).toBe(false);
    expect(canAccess("store_keeper", "users.create")).toBe(false);
    expect(canAccess("store_keeper", "products.delete")).toBe(false);
    expect(canAccess("store_keeper", "settings.edit")).toBe(false);
  });

  it("officer has appropriate permissions", () => {
    expect(canAccess("officer", "purchase_orders.create")).toBe(true);
    expect(canAccess("officer", "suppliers.view")).toBe(true);
    expect(canAccess("officer", "users.view")).toBe(false);
    expect(canAccess("officer", "users.delete")).toBe(false);
    expect(canAccess("officer", "settings.edit")).toBe(false);
  });

  it("returns false for unknown role", () => {
    expect(canAccess("unknown_role", "dashboard.view")).toBe(false);
  });
});

describe("canAccessAll()", () => {
  it("returns true when role has all permissions", () => {
    expect(canAccessAll("admin", ["users.view", "users.create", "users.delete"])).toBe(true);
  });

  it("returns false when role is missing one permission", () => {
    expect(canAccessAll("store_keeper", ["inventory.view", "users.delete"])).toBe(false);
  });

  it("returns true for empty permission array", () => {
    expect(canAccessAll("store_keeper", [])).toBe(true);
  });
});

describe("canAccessAny()", () => {
  it("returns true when role has at least one permission", () => {
    expect(canAccessAny("store_keeper", ["users.create", "inventory.view"])).toBe(true);
  });

  it("returns false when role has none of the permissions", () => {
    expect(canAccessAny("store_keeper", ["users.create", "settings.edit"])).toBe(false);
  });

  it("returns false for empty permission array", () => {
    expect(canAccessAny("admin", [])).toBe(false);
  });
});

describe("getPermissions()", () => {
  it("returns non-empty array for admin", () => {
    expect(getPermissions("admin").length).toBeGreaterThan(0);
  });

  it("admin has more permissions than store_keeper", () => {
    const adminPerms = getPermissions("admin");
    const clerkPerms = getPermissions("store_keeper");
    expect(adminPerms.length).toBeGreaterThan(clerkPerms.length);
  });
});

