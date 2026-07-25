/**
 * Dashboard hooks — unit tests
 * Tests query key structure and hook configuration.
 */

import { describe, it, expect } from "vitest";
import { dashboardKeys } from "../hooks/use-dashboard";

describe("dashboardKeys", () => {
  it("returns a stable base key", () => {
    expect(dashboardKeys.all).toEqual(["dashboard"]);
  });

  it("generates a unique overview key per period", () => {
    const k1 = dashboardKeys.overview({ period: "30d" });
    const k2 = dashboardKeys.overview({ period: "7d" });
    expect(k1).not.toEqual(k2);
    expect(k1[0]).toBe("dashboard");
  });

  it("generates distinct keys for stats vs charts", () => {
    const stats = dashboardKeys.stats({ period: "30d" });
    const charts = dashboardKeys.charts({ period: "30d" });
    expect(stats).not.toEqual(charts);
  });

  it("activities key includes limit", () => {
    const key = dashboardKeys.activities(10);
    expect(key).toContain(10);
  });

  it("pendingApprovals key is stable", () => {
    const k1 = dashboardKeys.pendingApprovals();
    const k2 = dashboardKeys.pendingApprovals();
    expect(k1).toEqual(k2);
  });
});
