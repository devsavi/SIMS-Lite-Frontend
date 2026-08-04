import { describe, it, expect } from "vitest";
import {
  normalizeStatus,
  getStatusBadgeVariant,
  getStatusLabel,
  getPurposeLabel,
  calculateTotalQuantity,
  canEditRelease,
  canSubmitRelease,
  canApproveRelease,
  canCancelRelease,
} from "../utils/stock-release-utils";
import type { StockReleaseItem } from "../types/stock-release-types";

describe("stock release utils", () => {
  describe("normalizeStatus", () => {
    it("normalizes status strings correctly", () => {
      expect(normalizeStatus("DRAFT")).toBe("DRAFT");
      expect(normalizeStatus("draft")).toBe("DRAFT");
      expect(normalizeStatus("SUBMITTED")).toBe("SUBMITTED");
      expect(normalizeStatus("submitted")).toBe("SUBMITTED");
      expect(normalizeStatus("APPROVED")).toBe("APPROVED");
      expect(normalizeStatus("approved")).toBe("APPROVED");
      expect(normalizeStatus("CANCELLED")).toBe("CANCELLED");
      expect(normalizeStatus("canceled")).toBe("CANCELLED");
      expect(normalizeStatus("rejected")).toBe("CANCELLED");
      expect(normalizeStatus(undefined)).toBe("DRAFT");
    });
  });

  describe("getStatusBadgeVariant", () => {
    it("returns appropriate badge variant for each status", () => {
      expect(getStatusBadgeVariant("DRAFT")).toBe("secondary");
      expect(getStatusBadgeVariant("SUBMITTED")).toBe("warning");
      expect(getStatusBadgeVariant("APPROVED")).toBe("success");
      expect(getStatusBadgeVariant("CANCELLED")).toBe("destructive");
    });
  });

  describe("getStatusLabel", () => {
    it("returns formatted display labels", () => {
      expect(getStatusLabel("DRAFT")).toBe("Draft");
      expect(getStatusLabel("SUBMITTED")).toBe("Submitted");
      expect(getStatusLabel("APPROVED")).toBe("Approved");
      expect(getStatusLabel("CANCELLED")).toBe("Cancelled");
    });
  });

  describe("getPurposeLabel", () => {
    it("returns human-readable purpose labels", () => {
      expect(getPurposeLabel("INTERNAL_USE")).toBe("Internal Use");
      expect(getPurposeLabel("PRODUCTION")).toBe("Production");
      expect(getPurposeLabel("MAINTENANCE")).toBe("Maintenance");
      expect(getPurposeLabel("SALES")).toBe("Sales");
      expect(getPurposeLabel("SAMPLE")).toBe("Sample");
      expect(getPurposeLabel("DISPOSAL")).toBe("Disposal");
      expect(getPurposeLabel("OTHER")).toBe("Other");
    });
  });

  describe("calculateTotalQuantity", () => {
    it("calculates total quantity across item list", () => {
      const items: StockReleaseItem[] = [
        {
          product: { id: "p1", sku: "S1", name: "P1" },
          quantity_requested: 10,
          unit_cost: 0,
          line_total: 0,
        },
        {
          product: { id: "p2", sku: "S2", name: "P2" },
          quantity_requested: 5,
          unit_cost: 0,
          line_total: 0,
        },
        {
          product: { id: "p3", sku: "S3", name: "P3" },
          quantity_requested: 15,
          unit_cost: 0,
          line_total: 0,
        },
      ];
      expect(calculateTotalQuantity(items)).toBe(30);
    });

    it("returns 0 for empty array", () => {
      expect(calculateTotalQuantity([])).toBe(0);
    });
  });

  describe("role-based workflow permissions", () => {
    it("canEditRelease requires DRAFT status and admin/store_keeper role", () => {
      expect(canEditRelease("DRAFT", "admin")).toBe(true);
      expect(canEditRelease("DRAFT", "store_keeper")).toBe(true);
      expect(canEditRelease("DRAFT", "officer")).toBe(false);
      expect(canEditRelease("SUBMITTED", "admin")).toBe(false);
      expect(canEditRelease("APPROVED", "admin")).toBe(false);
    });

    it("canSubmitRelease requires DRAFT status and admin/store_keeper role", () => {
      expect(canSubmitRelease("DRAFT", "admin")).toBe(true);
      expect(canSubmitRelease("DRAFT", "store_keeper")).toBe(true);
      expect(canSubmitRelease("DRAFT", "officer")).toBe(false);
      expect(canSubmitRelease("SUBMITTED", "admin")).toBe(false);
    });

    it("canApproveRelease requires SUBMITTED status and admin/store_keeper role", () => {
      expect(canApproveRelease("SUBMITTED", "admin")).toBe(true);
      expect(canApproveRelease("SUBMITTED", "store_keeper")).toBe(true);
      expect(canApproveRelease("SUBMITTED", "officer")).toBe(false);
      expect(canApproveRelease("DRAFT", "admin")).toBe(false);
    });

    it("canCancelRelease checks DRAFT or SUBMITTED status", () => {
      expect(canCancelRelease("DRAFT", "admin")).toBe(true);
      expect(canCancelRelease("SUBMITTED", "admin")).toBe(true);
      expect(canCancelRelease("APPROVED", "admin")).toBe(false);
      expect(canCancelRelease("CANCELLED", "admin")).toBe(false);
      expect(canCancelRelease("DRAFT", "officer")).toBe(false);
    });
  });
});
