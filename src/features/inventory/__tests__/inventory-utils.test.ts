import { describe, it, expect } from "vitest";
import {
  getStockStatus,
  getStockStatusLabel,
  calculateNewQuantity,
  isNegativeStockViolation,
  getLedgerEntryTypeLabel,
  formatCurrency,
  formatQuantity,
} from "../utils/inventory-utils";

describe("inventory-utils", () => {
  describe("getStockStatus", () => {
    it("returns out_of_stock when quantity is 0", () => {
      expect(getStockStatus(0, 10)).toBe("out_of_stock");
    });

    it("returns out_of_stock when quantity is negative", () => {
      expect(getStockStatus(-5, 10)).toBe("out_of_stock");
    });

    it("returns low_stock when quantity is at or below reorder level", () => {
      expect(getStockStatus(10, 10)).toBe("low_stock");
      expect(getStockStatus(5, 10)).toBe("low_stock");
    });

    it("returns in_stock when quantity is above reorder level", () => {
      expect(getStockStatus(11, 10)).toBe("in_stock");
    });

    it("returns in_stock when reorder level is 0 and quantity is positive", () => {
      expect(getStockStatus(1, 0)).toBe("in_stock");
    });
  });

  describe("getStockStatusLabel", () => {
    it("returns correct label for each status", () => {
      expect(getStockStatusLabel("in_stock")).toBe("In Stock");
      expect(getStockStatusLabel("low_stock")).toBe("Low Stock");
      expect(getStockStatusLabel("out_of_stock")).toBe("Out of Stock");
    });
  });

  describe("calculateNewQuantity", () => {
    it("adds quantity for increase type", () => {
      expect(calculateNewQuantity(100, "increase", 10)).toBe(110);
    });

    it("adds quantity for found type", () => {
      expect(calculateNewQuantity(50, "found", 5)).toBe(55);
    });

    it("adds quantity for cycle_count type", () => {
      expect(calculateNewQuantity(50, "cycle_count", 10)).toBe(60);
    });

    it("subtracts quantity for decrease type", () => {
      expect(calculateNewQuantity(100, "decrease", 15)).toBe(85);
    });

    it("subtracts quantity for damage type", () => {
      expect(calculateNewQuantity(100, "damage", 5)).toBe(95);
    });

    it("subtracts quantity for loss type", () => {
      expect(calculateNewQuantity(100, "loss", 3)).toBe(97);
    });

    it("subtracts quantity for write_off type", () => {
      expect(calculateNewQuantity(100, "write_off", 10)).toBe(90);
    });
  });

  describe("isNegativeStockViolation", () => {
    it("returns false for increase adjustments", () => {
      expect(isNegativeStockViolation(5, "increase", 10)).toBe(false);
    });

    it("returns true when decrease would result in negative stock", () => {
      expect(isNegativeStockViolation(5, "decrease", 10)).toBe(true);
    });

    it("returns false when decrease stays non-negative", () => {
      expect(isNegativeStockViolation(10, "decrease", 5)).toBe(false);
    });

    it("returns true when damage results in negative stock", () => {
      expect(isNegativeStockViolation(3, "damage", 5)).toBe(true);
    });

    it("returns false when quantity is exactly 0 after decrease", () => {
      expect(isNegativeStockViolation(10, "decrease", 10)).toBe(false);
    });
  });

  describe("getLedgerEntryTypeLabel", () => {
    it("returns human-readable labels for known types", () => {
      expect(getLedgerEntryTypeLabel("GRN_RECEIPT")).toBe("GRN Receipt");
      expect(getLedgerEntryTypeLabel("STOCK_RELEASE")).toBe("Stock Release");
      expect(getLedgerEntryTypeLabel("ADJUSTMENT_INCREASE")).toBe("Adjustment (+)");
      expect(getLedgerEntryTypeLabel("ADJUSTMENT_DECREASE")).toBe("Adjustment (-)");
      expect(getLedgerEntryTypeLabel("INITIAL_STOCK")).toBe("Initial Stock");
    });

    it("returns reformatted string for unknown types", () => {
      expect(getLedgerEntryTypeLabel("CUSTOM_TYPE")).toBe("CUSTOM TYPE");
    });
  });

  describe("formatCurrency", () => {
    it("formats valid numbers as currency", () => {
      expect(formatCurrency(1250)).toBe("$1,250.00");
    });

    it("returns $0.00 for null or undefined", () => {
      expect(formatCurrency(null)).toBe("$0.00");
      expect(formatCurrency(undefined)).toBe("$0.00");
    });
  });

  describe("formatQuantity", () => {
    it("formats numbers with comma separators", () => {
      expect(formatQuantity(1000)).toBe("1,000");
    });

    it("returns 0 for null or undefined", () => {
      expect(formatQuantity(null)).toBe("0");
      expect(formatQuantity(undefined)).toBe("0");
    });
  });
});
