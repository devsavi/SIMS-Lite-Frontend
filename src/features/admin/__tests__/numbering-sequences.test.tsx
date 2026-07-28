import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, renderHook } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useNumberingSequences, useUpdateSequence } from "../sequences/hooks/use-numbering-sequences";
import { sequencesApi } from "../sequences/api/sequences-api";
import { SequenceList } from "../sequences/components/SequenceList";
import { SequenceFormDialog } from "../sequences/components/SequenceFormDialog";
import { SequencePreviewBadge, formatSequenceNumber } from "../sequences/components/SequencePreviewBadge";
import type { NumberingSequence } from "../sequences/types";

vi.mock("../sequences/api/sequences-api", () => ({
  sequencesApi: {
    getSequences: vi.fn(),
    updateSequence: vi.fn(),
  },
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: () => ({ role: "admin", isAuthenticated: true }),
}));

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "TestWrapper";
  return Wrapper;
};

const mockSequence: NumberingSequence = {
  id: "seq-po",
  module: "PURCHASE_ORDER",
  title: "Purchase Orders",
  prefix: "PO-",
  suffix: "-2026",
  nextNumber: 42,
  paddingDigits: 5,
  resetFrequency: "YEARLY",
  updatedAt: "2026-07-28T10:00:00Z",
};

beforeEach(() => {
  vi.clearAllMocks();
});

// =============================================================================
// formatSequenceNumber Utility
// =============================================================================

describe("formatSequenceNumber utility function", () => {
  it("correctly formats a sequence number with prefix and suffix", () => {
    const result = formatSequenceNumber("PO-", 42, 5, "-2026");
    expect(result).toBe("PO-00042-2026");
  });

  it("handles empty prefix and suffix", () => {
    const result = formatSequenceNumber("", 7, 4, "");
    expect(result).toBe("0007");
  });

  it("handles padding correctly for larger numbers", () => {
    const result = formatSequenceNumber("GRN-", 999, 6, "");
    expect(result).toBe("GRN-000999");
  });

  it("handles single digit padding", () => {
    const result = formatSequenceNumber("REL-", 5, 1, "");
    expect(result).toBe("REL-5");
  });
});

// =============================================================================
// SequencePreviewBadge Component
// =============================================================================

describe("SequencePreviewBadge component", () => {
  it("renders formatted sequence preview", () => {
    render(
      <SequencePreviewBadge
        prefix="PO-"
        nextNumber={42}
        paddingDigits={5}
        suffix="-2026"
      />
    );
    expect(screen.getByText("Preview: PO-00042-2026")).toBeInTheDocument();
  });
});

// =============================================================================
// useNumberingSequences Hook
// =============================================================================

describe("useNumberingSequences hook", () => {
  it("fetches all sequences successfully", async () => {
    vi.mocked(sequencesApi.getSequences).mockResolvedValue([mockSequence]);
    const wrapper = createWrapper();
    const { result } = renderHook(() => useNumberingSequences(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].module).toBe("PURCHASE_ORDER");
  });
});

// =============================================================================
// useUpdateSequence Mutation
// =============================================================================

describe("useUpdateSequence mutation", () => {
  it("updates numbering sequence via API", async () => {
    const updatedSeq = { ...mockSequence, nextNumber: 100 };
    vi.mocked(sequencesApi.updateSequence).mockResolvedValue(updatedSeq);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateSequence(), { wrapper });

    result.current.mutate({
      id: "seq-po",
      payload: {
        prefix: "PO-",
        suffix: "-2026",
        nextNumber: 100,
        paddingDigits: 5,
        resetFrequency: "YEARLY",
      },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(sequencesApi.updateSequence).toHaveBeenCalledWith(
      "seq-po",
      expect.objectContaining({ nextNumber: 100 })
    );
  });
});

// =============================================================================
// SequenceList Component
// =============================================================================

describe("SequenceList component", () => {
  it("renders sequence data in table rows", () => {
    render(
      <SequenceList
        sequences={[mockSequence]}
        isLoading={false}
        onEditSequence={vi.fn()}
      />
    );
    expect(screen.getByText("Purchase Orders")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("YEARLY")).toBeInTheDocument();
  });

  it("shows loading skeleton rows when isLoading is true", () => {
    render(
      <SequenceList sequences={[]} isLoading={true} onEditSequence={vi.fn()} />
    );
    const rows = document.querySelectorAll("tr.animate-pulse");
    expect(rows.length).toBeGreaterThan(0);
  });

  it("calls onEditSequence when Configure button is clicked", () => {
    const mockEdit = vi.fn();
    render(
      <SequenceList
        sequences={[mockSequence]}
        isLoading={false}
        onEditSequence={mockEdit}
      />
    );

    const configBtn = screen.getByText("Configure");
    fireEvent.click(configBtn);
    expect(mockEdit).toHaveBeenCalledWith(mockSequence);
  });
});

// =============================================================================
// SequenceFormDialog Component
// =============================================================================

describe("SequenceFormDialog component", () => {
  it("renders sequence edit dialog with current values", () => {
    render(
      <SequenceFormDialog
        sequence={mockSequence}
        isOpen={true}
        onClose={vi.fn()}
        onUpdate={vi.fn()}
        isSubmitting={false}
      />
    );
    expect(screen.getByText(/Edit Sequence — Purchase Orders/)).toBeInTheDocument();
    expect(screen.getByDisplayValue("PO-")).toBeInTheDocument();
    expect(screen.getByDisplayValue("-2026")).toBeInTheDocument();
    expect(screen.getByDisplayValue("42")).toBeInTheDocument();
  });

  it("shows live preview in dialog form", () => {
    render(
      <SequenceFormDialog
        sequence={mockSequence}
        isOpen={true}
        onClose={vi.fn()}
        onUpdate={vi.fn()}
        isSubmitting={false}
      />
    );
    expect(screen.getByText("Preview: PO-00042-2026")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(
      <SequenceFormDialog
        sequence={mockSequence}
        isOpen={false}
        onClose={vi.fn()}
        onUpdate={vi.fn()}
        isSubmitting={false}
      />
    );
    expect(screen.queryByText(/Edit Sequence/)).not.toBeInTheDocument();
  });
});
