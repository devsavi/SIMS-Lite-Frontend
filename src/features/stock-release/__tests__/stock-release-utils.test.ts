import { describe, it, expect } from "vitest";
import {
  normalizeStatus,
  getStatusBadgeVariant,
  getStatusLabel,
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
      expect(normalizeStatus("DRAFT")).toBe("draft");
      expect(normalizeStatus("SUBMITTED")).toBe("submitted");
      expect(normalizeStatus("APPROVED")).toBe("approved");
      expect(normalizeStatus("CANCELLED")).toBe("cancelled");
      expect(normalizeStatus("canceled")).toBe("cancelled");
      expect(normalizeStatus("rejected")).toBe("cancelled");
      expect(normalizeStatus(undefined)).toBe("draft");
    });
  });

  describe("getStatusBadgeVariant", () => {
    it("returns appropriate badge variant for each status", () => {
      expect(getStatusBadgeVariant("draft")).toBe("secondary");
      expect(getStatusBadgeVariant("submitted")).toBe("warning");
      expect(getStatusBadgeVariant("approved")).toBe("success");
      expect(getStatusBadgeVariant("cancelled")).toBe("destructive");
    });
  });

  describe("getStatusLabel", () => {
    it("returns formatted display labels", () => {
      expect(getStatusLabel("draft")).toBe("Draft");
      expect(getStatusLabel("submitted")).toBe("Submitted");
      expect(getStatusLabel("approved")).toBe("Approved");
      expect(getStatusLabel("cancelled")).toBe("Cancelled");
    });
  });

  describe("calculateTotalQuantity", () => {
    it("calculates total quantity across item list", () => {
      const items: StockReleaseItem[] = [
        { product_id: "p1", quantity: 10, unit_of_measure: "pcs" },
        { product_id: "p2", quantity: 5, unit_of_measure: "pcs" },
        { product_id: "p3", quantity: 15, unit_of_measure: "pcs" },
      ];
      expect(calculateTotalQuantity(items)).toBe(30);
    });

    it("returns 0 for empty array", () => {
      expect(calculateTotalQuantity([])).toBe(0);
    });
  });

  describe("role-based workflow permissions", () => {
    it("canEditRelease checks draft status and role", () => {
      expect(canEditRelease("draft", "admin")).toBe(true);
      expect(canEditRelease("draft", "officer")).toBe(true);
      expect(canEditRelease("draft", "store_keeper")).toBe(true);
      expect(canEditRelease("submitted", "admin")).toBe(false);
      expect(canEditRelease("approved", "admin")).toBe(false);
    });

    it("canSubmitRelease checks draft status and role", () => {
      expect(canSubmitRelease("draft", "officer")).toBe(true);
      expect(canSubmitRelease("draft", "store_keeper")).toBe(true);
      expect(canSubmitRelease("submitted", "officer")).toBe(false);
    });

    it("canApproveRelease strictly permits admin and warehouse_manager", () => {
      expect(canApproveRelease("submitted", "admin")).toBe(true);
      expect(canApproveRelease("submitted", "super_admin")).toBe(true);
      expect(canApproveRelease("submitted", "warehouse_manager")).toBe(true);
      expect(canApproveRelease("submitted", "officer")).toBe(false);
      expect(canApproveRelease("submitted", "store_keeper")).toBe(false);
      expect(canApproveRelease("draft", "admin")).toBe(false);
    });

    it("canCancelRelease checks draft/submitted status", () => {
      expect(canCancelRelease("draft", "admin")).toBe(true);
      expect(canCancelRelease("submitted", "officer")).toBe(true);
      expect(canCancelRelease("approved", "admin")).toBe(false);
      expect(canCancelRelease("cancelled", "admin")).toBe(false);
    });
  });
});
