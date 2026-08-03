"use client";

/**
 * POPrintDialog
 *
 * Print approach:
 *  1. A <PrintDocument> is always rendered in the real DOM (hidden normally).
 *  2. Before printing, we add `po-printing` class to <body>.
 *  3. A global <style> scoped to `.po-printing` hides every other direct
 *     child of body and makes #po-print-root fill the page.
 *  4. After the print dialog closes (afterprint / setTimeout fallback),
 *     the class is removed.
 *
 * This guarantees the print output matches the on-screen preview because
 * it uses the exact same React-rendered nodes with inline styles — no
 * serialisation, no new window.
 */

import * as React from "react";
import { createPortal } from "react-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Printer } from "lucide-react";
import type { POPrintData } from "../types";
import { formatCurrency } from "@/utils/format";

export interface POPrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: POPrintData;
  isLoading?: boolean;
}

// ---------------------------------------------------------------------------
// Inject global print CSS once
// ---------------------------------------------------------------------------
const STYLE_ID = "po-print-global-style";

function ensurePrintStyle() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  // When body has .po-printing:
  //   • Hide every direct child of body (including the Next.js root & portals)
  //   • Reveal and full-page our print element
  style.textContent = `
@page {
  size: A4;
  margin: 16mm 14mm;
}
@media print {
  body.po-printing > *:not(#po-print-root) {
    visibility: hidden !important;
    overflow: hidden !important;
    height: 0 !important;
    min-height: 0 !important;
  }
  body.po-printing #po-print-root {
    visibility: visible !important;
    display: block !important;
    position: static !important;
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    padding: 0 !important;
    margin: 0 !important;
    overflow: visible !important;
    background: white !important;
  }
}
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmtDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString();
}

// ---------------------------------------------------------------------------
// The print document — uses only inline styles so it's self-contained.
// Rendered into the real DOM but hidden (visibility:hidden, position:fixed,
// pointer-events:none) until printing begins.
// ---------------------------------------------------------------------------
function PrintDocument({ data }: { data: POPrintData }) {
  return (
    <div
      id="po-print-root"
      style={{
        visibility: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: -1,
        width: "100%",
        boxSizing: "border-box",
        background: "white",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: "13px",
        color: "#111",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "2px solid #111",
          paddingBottom: "16px",
          marginBottom: "20px",
        }}
      >
        <div>
          <div style={{ fontSize: "22px", fontWeight: 700 }}>{data.po_number}</div>
          <div style={{ fontSize: "11px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "2px" }}>
            Purchase Order
          </div>
          <div
            style={{
              display: "inline-block",
              marginTop: "8px",
              padding: "2px 8px",
              border: "1px solid #374151",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {data.status.replace(/_/g, " ")}
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: "12px", color: "#374151" }}>
          <div><strong>Order Date:</strong> {fmtDate(data.order_date)}</div>
          <div style={{ marginTop: "4px" }}><strong>Expected Delivery:</strong> {fmtDate(data.expected_delivery_date)}</div>
        </div>
      </div>

      {/* Supplier + Ship To */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        <div style={{ border: "1px solid #e5e7eb", padding: "12px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", marginBottom: "6px" }}>
            Supplier
          </div>
          <div style={{ fontWeight: 600, fontSize: "13px" }}>{data.supplier.name}</div>
          {data.supplier.contact_person && (
            <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{data.supplier.contact_person}</div>
          )}
          {data.supplier.email && (
            <div style={{ fontSize: "12px", color: "#6b7280" }}>{data.supplier.email}</div>
          )}
          {data.supplier.address && (
            <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px", whiteSpace: "pre-wrap" }}>{data.supplier.address}</div>
          )}
        </div>
        <div style={{ border: "1px solid #e5e7eb", padding: "12px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", marginBottom: "6px" }}>
            Ship To
          </div>
          {data.shipping_address
            ? <div style={{ fontSize: "12px", whiteSpace: "pre-wrap" }}>{data.shipping_address}</div>
            : <div style={{ fontSize: "12px", color: "#9ca3af" }}>—</div>
          }
        </div>
      </div>

      {/* Line items */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", marginBottom: "8px" }}>
          Order Items
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              {(["Product", "SKU", "Qty", "Unit Price", "Disc %", "Tax %", "Line Total"] as const).map((h, i) => (
                <th
                  key={h}
                  style={{
                    padding: "7px 8px",
                    border: "1px solid #d1d5db",
                    fontWeight: 700,
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    textAlign: i >= 2 ? "right" : "left",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, idx) => (
              <tr key={idx} style={{ background: idx % 2 === 0 ? "#fff" : "#f9fafb" }}>
                <td style={{ padding: "6px 8px", border: "1px solid #e5e7eb" }}>{item.product_name}</td>
                <td style={{ padding: "6px 8px", border: "1px solid #e5e7eb", fontFamily: "monospace", color: "#6b7280" }}>{item.sku}</td>
                <td style={{ padding: "6px 8px", border: "1px solid #e5e7eb", textAlign: "right" }}>{item.quantity_ordered}</td>
                <td style={{ padding: "6px 8px", border: "1px solid #e5e7eb", textAlign: "right" }}>{formatCurrency(item.unit_price)}</td>
                <td style={{ padding: "6px 8px", border: "1px solid #e5e7eb", textAlign: "right" }}>{item.discount_percent}%</td>
                <td style={{ padding: "6px 8px", border: "1px solid #e5e7eb", textAlign: "right" }}>{item.tax_percent}%</td>
                <td style={{ padding: "6px 8px", border: "1px solid #e5e7eb", textAlign: "right", fontWeight: 600 }}>{formatCurrency(item.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
        <table style={{ borderCollapse: "collapse", fontSize: "13px", minWidth: "260px" }}>
          <tbody>
            {[
              { label: "Subtotal", value: formatCurrency(data.subtotal), color: "#111" },
              { label: "Discount", value: `–${formatCurrency(data.discount_amount)}`, color: "#dc2626" },
              { label: "Tax", value: formatCurrency(data.tax_amount), color: "#111" },
            ].map(({ label, value, color }) => (
              <tr key={label}>
                <td style={{ padding: "3px 20px 3px 0", color: "#6b7280" }}>{label}</td>
                <td style={{ padding: "3px 0", textAlign: "right", color }}>{value}</td>
              </tr>
            ))}
            <tr style={{ borderTop: "2px solid #111", fontWeight: 700, fontSize: "15px" }}>
              <td style={{ padding: "8px 20px 0 0" }}>Total</td>
              <td style={{ padding: "8px 0 0", textAlign: "right" }}>{formatCurrency(data.total_amount)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Notes / Terms */}
      {(data.notes || data.terms_conditions) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {data.notes && (
            <div style={{ border: "1px solid #e5e7eb", padding: "12px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", marginBottom: "4px" }}>Notes</div>
              <div style={{ fontSize: "12px", whiteSpace: "pre-wrap" }}>{data.notes}</div>
            </div>
          )}
          {data.terms_conditions && (
            <div style={{ border: "1px solid #e5e7eb", padding: "12px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", marginBottom: "4px" }}>Terms & Conditions</div>
              <div style={{ fontSize: "12px", whiteSpace: "pre-wrap" }}>{data.terms_conditions}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dialog
// ---------------------------------------------------------------------------
export function POPrintDialog({
  open,
  onOpenChange,
  data,
  isLoading = false,
}: POPrintDialogProps) {
  React.useEffect(() => {
    ensurePrintStyle();
  }, []);

  const handlePrint = React.useCallback(() => {
    document.body.classList.add("po-printing");

    const afterPrint = () => {
      document.body.classList.remove("po-printing");
      window.removeEventListener("afterprint", afterPrint);
    };
    window.addEventListener("afterprint", afterPrint);

    // Fallback: remove class after 30 s in case afterprint never fires
    const fallback = window.setTimeout(() => {
      document.body.classList.remove("po-printing");
    }, 30_000);

    window.addEventListener("afterprint", () => window.clearTimeout(fallback), { once: true });

    window.print();
  }, []);

  return (
    <>
      {/* Portal to body so it is a direct child — required for the print CSS selector */}
      {data && typeof document !== "undefined" &&
        createPortal(<PrintDocument data={data} />, document.body)
      }

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <DialogTitle>
                Print Preview — {data?.po_number ?? "Purchase Order"}
              </DialogTitle>
              <Button
                size="sm"
                onClick={handlePrint}
                disabled={isLoading || !data}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </DialogHeader>

          {isLoading && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Loading print data…
            </div>
          )}

          {!isLoading && data && (
            <div className="p-4 text-sm space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <p className="text-xl font-bold">{data.po_number}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">
                    Purchase Order
                  </p>
                  <span className="inline-block mt-2 border px-2 py-0.5 text-xs font-semibold rounded-none">
                    {data.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="text-right text-xs text-muted-foreground space-y-1">
                  <p><span className="font-medium">Order Date:</span> {fmtDate(data.order_date)}</p>
                  <p><span className="font-medium">Expected Delivery:</span> {fmtDate(data.expected_delivery_date)}</p>
                </div>
              </div>

              {/* Supplier + Ship To */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-none border p-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Supplier</p>
                  <p className="font-semibold">{data.supplier.name}</p>
                  {data.supplier.contact_person && <p className="text-xs text-muted-foreground">{data.supplier.contact_person}</p>}
                  {data.supplier.email && <p className="text-xs text-muted-foreground">{data.supplier.email}</p>}
                  {data.supplier.address && <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{data.supplier.address}</p>}
                </div>
                <div className="rounded-none border p-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Ship To</p>
                  {data.shipping_address
                    ? <p className="text-xs whitespace-pre-wrap">{data.shipping_address}</p>
                    : <p className="text-xs text-muted-foreground">—</p>
                  }
                </div>
              </div>

              {/* Line Items */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Order Items</p>
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-muted/60">
                      {[
                        { label: "Product", right: false },
                        { label: "SKU", right: false },
                        { label: "Qty", right: true },
                        { label: "Unit Price", right: true },
                        { label: "Disc %", right: true },
                        { label: "Tax %", right: true },
                        { label: "Line Total", right: true },
                      ].map(({ label, right }) => (
                        <th key={label} className={`p-2 border font-semibold text-[11px] uppercase tracking-wide ${right ? "text-right" : "text-left"}`}>
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((item, idx) => (
                      <tr key={idx} className="odd:bg-background even:bg-muted/30">
                        <td className="p-2 border">{item.product_name}</td>
                        <td className="p-2 border font-mono text-muted-foreground">{item.sku}</td>
                        <td className="p-2 border text-right">{item.quantity_ordered}</td>
                        <td className="p-2 border text-right">{formatCurrency(item.unit_price)}</td>
                        <td className="p-2 border text-right">{item.discount_percent}%</td>
                        <td className="p-2 border text-right">{item.tax_percent}%</td>
                        <td className="p-2 border text-right font-semibold">{formatCurrency(item.line_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-right min-w-[240px]">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>{formatCurrency(data.subtotal)}</span>
                  <span className="text-muted-foreground">Discount:</span>
                  <span className="text-rose-600">-{formatCurrency(data.discount_amount)}</span>
                  <span className="text-muted-foreground">Tax:</span>
                  <span>{formatCurrency(data.tax_amount)}</span>
                  <span className="font-bold border-t pt-1">Total:</span>
                  <span className="font-bold text-primary border-t pt-1">{formatCurrency(data.total_amount)}</span>
                </div>
              </div>

              {/* Notes / Terms */}
              {(data.notes || data.terms_conditions) && (
                <div className="grid grid-cols-2 gap-4">
                  {data.notes && (
                    <div className="rounded-none border p-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
                      <p className="text-xs whitespace-pre-wrap">{data.notes}</p>
                    </div>
                  )}
                  {data.terms_conditions && (
                    <div className="rounded-none border p-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Terms & Conditions</p>
                      <p className="text-xs whitespace-pre-wrap">{data.terms_conditions}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
