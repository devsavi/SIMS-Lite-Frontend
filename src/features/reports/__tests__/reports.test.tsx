import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, renderHook } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useReportsMetadata,
  reportsKeys,
} from "../hooks/use-reports";
import { ReportCard } from "../components/report-cards/ReportCard";
import { ReportFilters } from "../components/report-filters/ReportFilters";
import { ReportTable } from "../components/report-table/ReportTable";
import { ExportDialog } from "../components/export-dialog/ExportDialog";
import { PrintPreviewDialog } from "../components/print-preview/PrintPreviewDialog";
import { reportsApi } from "../api/reports-api";
import type { ReportMeta } from "../types";

vi.mock("../api/reports-api", () => ({
  reportsApi: {
    getReportsMetadata: vi.fn(),
    getReportData: vi.fn(),
    getReportSummary: vi.fn(),
    getReportCharts: vi.fn(),
    exportReport: vi.fn(),
  },
  REPORT_METADATA: [],
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: () => ({
    role: "admin",
    isAuthenticated: true,
  }),
}));

const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "TestWrapper";
  return Wrapper;
};

const mockReportMeta: ReportMeta = {
  id: "inventory",
  title: "Inventory Report",
  description: "Detailed stock report.",
  category: "inventory",
  iconName: "Archive",
  allowedRoles: ["admin", "super_admin"],
  lastGenerated: "Today",
  supportedFormats: ["excel", "csv", "pdf"],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("reports query key factory", () => {
  it("generates correct query keys", () => {
    expect(reportsKeys.all).toEqual(["reports"]);
    expect(reportsKeys.metadata()).toEqual(["reports", "metadata"]);
    expect(reportsKeys.data("inventory")).toEqual(["reports", "data", "inventory", undefined]);
  });
});

describe("useReportsMetadata hook", () => {
  it("fetches reports metadata successfully", async () => {
    vi.mocked(reportsApi.getReportsMetadata).mockResolvedValue([mockReportMeta]);
    const wrapper = createTestWrapper();

    const { result } = renderHook(() => useReportsMetadata(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].title).toBe("Inventory Report");
  });
});

describe("ReportCard Component", () => {
  it("renders report card details correctly", () => {
    const onQuickExport = vi.fn();
    render(<ReportCard report={mockReportMeta} onQuickExport={onQuickExport} />);

    expect(screen.getByText("Inventory Report")).toBeInTheDocument();
    expect(screen.getByText("Detailed stock report.")).toBeInTheDocument();
    expect(screen.getByText("View Report")).toBeInTheDocument();

    const exportBtn = screen.getByRole("button", { name: /Export Inventory Report/i });
    fireEvent.click(exportBtn);
    expect(onQuickExport).toHaveBeenCalledWith(mockReportMeta);
  });
});

describe("ReportFilters Component", () => {
  it("triggers filter callbacks on search and reset", () => {
    const onFilterChange = vi.fn();
    const onReset = vi.fn();

    render(
      <ReportFilters
        reportType="inventory"
        filters={{ search: "" }}
        onFilterChange={onFilterChange}
        onReset={onReset}
      />
    );

    const searchInput = screen.getByPlaceholderText("Search report...");
    fireEvent.change(searchInput, { target: { value: "bearing" } });

    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ search: "bearing", page: 1 })
    );

    const resetBtn = screen.getByText("Reset Filters");
    fireEvent.click(resetBtn);
    expect(onReset).toHaveBeenCalled();
  });
});

describe("ReportTable Component", () => {
  it("renders inventory report rows correctly", () => {
    const mockInventoryData = [
      {
        id: "inv-1",
        productName: "Roller Bearing",
        sku: "BEAR-001",
        categoryName: "Industrial",
        brandName: "SKF",
        supplierName: "Acme",
        currentQuantity: 100,
        minimumStock: 20,
        stockStatus: "IN_STOCK" as const,
        unitCost: 50,
        totalValue: 5000,
      },
    ];

    render(<ReportTable reportType="inventory" data={mockInventoryData} />);

    expect(screen.getByText("Roller Bearing")).toBeInTheDocument();
    expect(screen.getByText("BEAR-001")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("renders empty state when data is empty", () => {
    render(<ReportTable reportType="inventory" data={[]} />);

    expect(screen.getByText("No Report Data Found")).toBeInTheDocument();
  });
});

describe("ExportDialog Component", () => {
  it("triggers export mutation on download click", async () => {
    vi.mocked(reportsApi.exportReport).mockResolvedValue({
      blob: new Blob(["test"]),
      filename: "inventory-report.xlsx",
    });

    const onClose = vi.fn();

    render(
      <QueryClientProvider client={new QueryClient()}>
        <ExportDialog isOpen={true} onClose={onClose} reportType="inventory" />
      </QueryClientProvider>
    );

    expect(screen.getByText("Export Report")).toBeInTheDocument();

    const downloadBtn = screen.getByRole("button", { name: /Download Report/i });
    fireEvent.click(downloadBtn);

    await waitFor(() => {
      expect(reportsApi.exportReport).toHaveBeenCalledWith(
        expect.objectContaining({ reportType: "inventory", format: "excel" })
      );
    });
  });
});

describe("PrintPreviewDialog Component", () => {
  it("renders printable modal content and triggers window.print", () => {
    const onClose = vi.fn();
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});

    render(
      <PrintPreviewDialog
        isOpen={true}
        onClose={onClose}
        reportTitle="Inventory Report"
        reportType="inventory"
      >
        <div>Report Contents Test</div>
      </PrintPreviewDialog>
    );

    expect(screen.getByText("Print Preview - Inventory Report")).toBeInTheDocument();
    expect(screen.getByText("Report Contents Test")).toBeInTheDocument();

    const printBtn = screen.getByRole("button", { name: /^Print$/i });
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();

    printSpy.mockRestore();
  });
});
