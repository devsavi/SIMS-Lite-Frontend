"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  FileText,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  FileSpreadsheet,
  FilePenLine,
  PenTool,
  RotateCcw,
  Check,
} from "lucide-react";
import { useSystemSettingsStore } from "@/stores/settings.store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import * as XLSX from "xlsx";

export function SummarySheetsSection() {
  const [activeTab, setActiveTab] = useState<"shift-summary" | "stock-audit">("shift-summary");

  const tabs = [
    { key: "shift-summary" as const, label: "Daily Shift Summary Sheet", icon: <FileText className="w-4 h-4" /> },
    { key: "stock-audit" as const, label: "Stock Audit Reconciliation Sheet", icon: <FilePenLine className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {activeTab === "shift-summary" && <DailyShiftSummarySheet />}
      {activeTab === "stock-audit" && <StockAuditReconciliationSheet />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function todayStr() {
  return new Date().toISOString().split("T")[0];
}

const sheetInputCls =
  "w-full bg-transparent border-b border-border focus:outline-none text-sm font-semibold text-foreground placeholder:text-muted-foreground";

// ---------------------------------------------------------------------------
// Theme-Adaptive Virtual Signature Modal & Signature Box
// ---------------------------------------------------------------------------
interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  signeeName: string;
  onSave: (dataUrl: string) => void;
}

function SignatureModal({ isOpen, onClose, title, signeeName, onSave }: SignatureModalProps) {
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [typedName, setTypedName] = useState(signeeName);
  const [inkColor, setInkColor] = useState("#2563eb"); // Royal Blue default
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setHasContent(false);
  }, []);

  const renderTypedSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!typedName.trim()) {
      setHasContent(false);
      return;
    }
    ctx.font = "italic 36px 'Brush Script MT', 'Dancing Script', cursive, sans-serif";
    ctx.fillStyle = inkColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);
    setHasContent(true);
  }, [typedName, inkColor]);

  useEffect(() => {
    if (mode === "type") {
      renderTypedSignature();
    }
  }, [mode, typedName, inkColor, renderTypedSignature]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (mode !== "draw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    setHasContent(true);
    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || mode !== "draw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCanvasCoords(e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = inkColor;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleApply = () => {
    const canvas = canvasRef.current;
    if (canvas && hasContent) {
      onSave(canvas.toDataURL());
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-card text-foreground border border-border shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
            <PenTool className="w-5 h-5 text-primary" />
            Digital Signature — {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Mode Switcher & Ink Color */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode("draw");
                  clearCanvas();
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  mode === "draw"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                Draw Signature
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("type");
                  clearCanvas();
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  mode === "type"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                Type Script Signature
              </button>
            </div>

            {/* Ink options */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground font-medium">Ink:</span>
              <button
                type="button"
                onClick={() => setInkColor("#2563eb")}
                className={`w-5 h-5 rounded-full border-2 bg-blue-600 transition-transform ${
                  inkColor === "#2563eb" ? "scale-110 border-primary" : "border-transparent"
                }`}
                title="Royal Blue Ink"
              />
              <button
                type="button"
                onClick={() => setInkColor("#0284c7")}
                className={`w-5 h-5 rounded-full border-2 bg-sky-500 transition-transform ${
                  inkColor === "#0284c7" ? "scale-110 border-primary" : "border-transparent"
                }`}
                title="Sky Blue Ink"
              />
              <button
                type="button"
                onClick={() => setInkColor("#0f172a")}
                className={`w-5 h-5 rounded-full border-2 bg-slate-900 transition-transform ${
                  inkColor === "#0f172a" ? "scale-110 border-primary" : "border-transparent"
                }`}
                title="Dark Slate Ink"
              />
            </div>
          </div>

          {/* Type Mode Input */}
          {mode === "type" && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Type Full Name</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          )}

          {/* Canvas Area (Theme Adaptive: uses bg-muted to match current app color theme) */}
          <div className="relative border-2 border-dashed border-border rounded-xl bg-muted p-2 overflow-hidden">
            <canvas
              ref={canvasRef}
              width={480}
              height={140}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className={`w-full h-32 bg-muted rounded-lg ${
                mode === "draw" ? "cursor-crosshair touch-none" : "cursor-default"
              }`}
            />

            {!hasContent && mode === "draw" && (
              <span className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground pointer-events-none font-medium">
                Draw signature inside this box with mouse or touch
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={clearCanvas}
              className="flex items-center gap-1 text-xs text-destructive font-semibold hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear Canvas
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-muted hover:bg-accent text-muted-foreground hover:text-accent-foreground text-xs font-semibold rounded-lg transition-colors border border-border"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!hasContent}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg shadow-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                <Check className="w-4 h-4" /> Apply Signature
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface SignatureBoxProps {
  label: string;
  name: string;
  onNameChange: (v: string) => void;
  dateValue?: string;
  onDateChange?: (v: string) => void;
  signatureDataUrl: string | null;
  onSignatureChange: (url: string | null) => void;
}

function SignatureBox({
  label,
  name,
  onNameChange,
  dateValue = "",
  onDateChange,
  signatureDataUrl,
  onSignatureChange,
}: SignatureBoxProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [internalDate, setInternalDate] = useState(todayStr());

  const currentDate = dateValue !== undefined && onDateChange ? dateValue : internalDate;
  const handleDateChange = (val: string) => {
    if (onDateChange) onDateChange(val);
    setInternalDate(val);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-xs">
        <span className="font-semibold text-foreground">{label}</span>
        <div className="no-print flex gap-2">
          {signatureDataUrl ? (
            <>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="text-[11px] text-primary hover:underline font-semibold"
              >
                Change
              </button>
              <button
                type="button"
                onClick={() => onSignatureChange(null)}
                className="text-[11px] text-destructive hover:underline font-semibold"
              >
                Remove
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
            >
              <PenTool className="w-3.5 h-3.5 text-primary" />
              Sign Digitally
            </button>
          )}
        </div>
      </div>

      {/* Signature display box — Theme Adaptive: bg-muted/40 with border border-border */}
      <div className="border-b-2 border-foreground min-h-[60px] flex flex-col justify-end pb-1 bg-muted/40 rounded-t p-2.5 shadow-xs border border-border">
        {signatureDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={signatureDataUrl} alt="Digital Signature" className="h-11 max-w-full object-contain" />
        ) : (
          <>
            <div className="no-print text-[11px] text-muted-foreground italic flex items-center gap-1">
              Click &ldquo;Sign Digitally&rdquo; or hand-sign printed paper
            </div>
            <div className="hidden print:block text-xs font-mono text-gray-600 pt-6">
              Signature: _______________________________
            </div>
          </>
        )}
      </div>

      {/* Interactive Name & Date Inputs — STACKED (Date on next line) */}
      <div className="space-y-2 pt-0.5">
        <div>
          <label className="block text-[10px] text-muted-foreground font-semibold mb-0.5 no-print">Signee Name</label>
          <input
            type="text"
            placeholder="Enter Signee Name..."
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full bg-transparent border-b border-border focus:outline-none text-xs font-bold text-foreground placeholder:text-muted-foreground no-print"
          />
          <div className="hidden print:block text-xs font-bold text-foreground">
            {name ? <span>Name: {name}</span> : <span className="text-gray-600 font-mono">Name: _______________________________</span>}
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-muted-foreground font-semibold mb-0.5 no-print">Signature Date</label>
          <input
            type="date"
            value={currentDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full bg-transparent border-b border-border focus:outline-none text-xs font-bold text-foreground placeholder:text-muted-foreground no-print"
          />
          <div className="hidden print:block text-xs font-bold text-foreground">
            {currentDate ? (
              <span>Date: {currentDate}</span>
            ) : (
              <span className="text-gray-600 font-mono">Date: _____________________</span>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <SignatureModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={label}
          signeeName={name}
          onSave={(dataUrl) => onSignatureChange(dataUrl)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1. Daily Shift Summary Sheet
// ---------------------------------------------------------------------------
interface ShiftRow {
  id: string;
  activity: string;
  reference: string;
  quantity: string;
  unit: string;
  remarks: string;
}

function DailyShiftSummarySheet() {
  const { appTitle } = useSystemSettingsStore();

  const [date, setDate] = useState(todayStr());
  const [shiftNo, setShiftNo] = useState("");
  const [officerName, setOfficerName] = useState("");
  const [managerName, setManagerName] = useState("");
  const [officerDate, setOfficerDate] = useState(todayStr());
  const [managerDate, setManagerDate] = useState(todayStr());
  const [officerSig, setOfficerSig] = useState<string | null>(null);
  const [managerSig, setManagerSig] = useState<string | null>(null);

  const [location, setLocation] = useState("");
  const [grnCount, setGrnCount] = useState("");
  const [releaseCount, setReleaseCount] = useState("");
  const [adjustmentCount, setAdjustmentCount] = useState("");
  const [rows, setRows] = useState<ShiftRow[]>([
    { id: "1", activity: "", reference: "", quantity: "", unit: "", remarks: "" },
  ]);
  const [notes, setNotes] = useState("");

  const addRow = () =>
    setRows((prev) => [...prev, { id: Date.now().toString(), activity: "", reference: "", quantity: "", unit: "", remarks: "" }]);

  const removeRow = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));

  const updateRow = (id: string, field: keyof ShiftRow, value: string) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  const handleExportExcel = useCallback(() => {
    const wsData: (string | number)[][] = [
      [`${appTitle} — Daily Shift Summary Sheet`],
      [],
      ["Date:", date, "Shift No:", shiftNo, "Location:", location],
      ["Store Officer:", officerName, "Manager / Verified By:", managerName],
      [],
      ["KEY METRICS"],
      ["GRN Received:", grnCount || "—", "Stock Releases:", releaseCount || "—", "Adjustments:", adjustmentCount || "—"],
      [],
      ["SHIFT ACTIVITIES LOG"],
      ["#", "Activity / Type", "Reference No.", "Quantity", "Unit", "Remarks"],
      ...rows.map((r, i) => [i + 1, r.activity, r.reference, r.quantity, r.unit, r.remarks]),
      [],
      ["SHIFT HANDOVER NOTES"],
      [notes],
      [],
      ["Prepared By (Signature):", officerName || "—", officerDate, "Verified By (Signature):", managerName || "—", managerDate],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [{ wch: 25 }, { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 10 }, { wch: 30 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Shift Summary");
    XLSX.writeFile(wb, `Shift_Summary_${date}.xlsx`);
  }, [appTitle, date, shiftNo, location, officerName, managerName, officerDate, managerDate, grnCount, releaseCount, adjustmentCount, rows, notes]);

  return (
    <div className="space-y-4">
      {/* Toolbar – hidden when printing */}
      <div className="no-print flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-card border border-border rounded-xl p-4 shadow-sm">
        <div>
          <h3 className="text-base font-semibold text-foreground">Daily Operations & Shift Summary Sheet</h3>
          <p className="text-xs text-muted-foreground">Fill in the fields, add signatures, export or print the official document.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-semibold rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Excel
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* ===== Printable Sheet (Full width as other pages) ===== */}
      <div className="printable-sheet bg-card border border-border rounded-xl p-8 shadow-md text-foreground w-full space-y-6">
        {/* Header */}
        <div className="border-b-2 border-foreground pb-4 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-primary uppercase">
              {appTitle} — Daily Shift Summary Sheet
            </h1>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Store & Inventory Operations Hub</p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <div><strong className="text-foreground">Printed:</strong> {new Date().toLocaleString()}</div>
          </div>
        </div>

        {/* Meta fields */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-muted p-4 rounded-xl border border-border text-sm">
          {[
            { label: "Shift Date", el: <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={sheetInputCls} /> },
            { label: "Shift No. / Session", el: <input type="text" placeholder="e.g. Morning / #001" value={shiftNo} onChange={(e) => setShiftNo(e.target.value)} className={sheetInputCls} /> },
            { label: "Location / Department", el: <input type="text" placeholder="e.g. Main Warehouse" value={location} onChange={(e) => setLocation(e.target.value)} className={sheetInputCls} /> },
            { label: "Store Officer / Operator", el: <input type="text" placeholder="Officer Name" value={officerName} onChange={(e) => setOfficerName(e.target.value)} className={sheetInputCls} /> },
            { label: "Manager / Verified By", el: <input type="text" placeholder="Manager Name" value={managerName} onChange={(e) => setManagerName(e.target.value)} className={sheetInputCls} /> },
          ].map(({ label, el }) => (
            <div key={label}>
              <span className="block text-xs text-muted-foreground font-medium mb-1">{label}</span>
              {el}
            </div>
          ))}
        </div>

        {/* Key Metrics */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Shift Key Metrics</h4>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "GRN Goods Received", val: grnCount, set: setGrnCount, color: "text-primary" },
              { label: "Stock Releases", val: releaseCount, set: setReleaseCount, color: "text-primary" },
              { label: "Stock Adjustments", val: adjustmentCount, set: setAdjustmentCount, color: "text-primary" },
            ].map(({ label, val, set, color }) => (
              <div key={label} className="p-3 border-2 border-border rounded-xl text-center bg-muted">
                <div className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">{label}</div>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  className={`text-2xl font-black ${color} text-center bg-transparent w-full focus:outline-none placeholder:text-muted-foreground/30`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Activities Log */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Shift Activities Log</h4>
            <button onClick={addRow} className="no-print flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
              <Plus className="w-3.5 h-3.5" /> Add Row
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-muted text-muted-foreground font-bold uppercase text-[10px]">
                  {["#", "Activity / Type", "Reference No.", "Qty", "Unit", "Remarks", ""].map((h) => (
                    <th key={h} className="border border-border p-2 text-left last:no-print">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                    <td className="border border-border p-1.5 text-center text-muted-foreground">{idx + 1}</td>
                    <td className="border border-border p-1.5">
                      <input type="text" placeholder="e.g. GRN Receipt" value={row.activity} onChange={(e) => updateRow(row.id, "activity", e.target.value)} className="w-full bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground" />
                    </td>
                    <td className="border border-border p-1.5">
                      <input type="text" placeholder="GRN-001" value={row.reference} onChange={(e) => updateRow(row.id, "reference", e.target.value)} className="w-full bg-transparent focus:outline-none font-mono text-foreground placeholder:text-muted-foreground" />
                    </td>
                    <td className="border border-border p-1.5">
                      <input type="text" placeholder="0" value={row.quantity} onChange={(e) => updateRow(row.id, "quantity", e.target.value)} className="w-full bg-transparent focus:outline-none text-right text-foreground placeholder:text-muted-foreground" />
                    </td>
                    <td className="border border-border p-1.5">
                      <input type="text" placeholder="kg" value={row.unit} onChange={(e) => updateRow(row.id, "unit", e.target.value)} className="w-full bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground" />
                    </td>
                    <td className="border border-border p-1.5">
                      <input type="text" placeholder="Notes..." value={row.remarks} onChange={(e) => updateRow(row.id, "remarks", e.target.value)} className="w-full bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground" />
                    </td>
                    <td className="border border-border p-1.5 text-center no-print">
                      <button onClick={() => removeRow(row.id)} className="text-destructive hover:opacity-70 transition-opacity">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Handover Notes */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Shift Handover & Remarks</h4>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Type any shift handover notes, issues, or follow-up actions here..."
            className="w-full p-3 border border-border rounded-xl text-xs focus:outline-none resize-none font-mono bg-muted text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Signatures */}
        <div className="pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
          <SignatureBox
            label="Prepared By (Store Officer Signature)"
            name={officerName}
            onNameChange={setOfficerName}
            dateValue={officerDate}
            onDateChange={setOfficerDate}
            signatureDataUrl={officerSig}
            onSignatureChange={setOfficerSig}
          />
          <SignatureBox
            label="Verified By (Manager / Admin Signature)"
            name={managerName}
            onNameChange={setManagerName}
            dateValue={managerDate}
            onDateChange={setManagerDate}
            signatureDataUrl={managerSig}
            onSignatureChange={setManagerSig}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Stock Audit & Reconciliation Sheet
// ---------------------------------------------------------------------------
interface AuditItem {
  id: string;
  sku: string;
  name: string;
  location: string;
  systemQty: string;
  physicalQty: string;
  unit: string;
  remarks: string;
}

function StockAuditReconciliationSheet() {
  const { appTitle } = useSystemSettingsStore();

  const [auditDate, setAuditDate] = useState(todayStr());
  const [auditedBy, setAuditedBy] = useState("");
  const [approvedBy, setApprovedBy] = useState("");
  const [auditorDate, setAuditorDate] = useState(todayStr());
  const [approverDate, setApproverDate] = useState(todayStr());
  const [auditorSig, setAuditorSig] = useState<string | null>(null);
  const [approverSig, setApproverSig] = useState<string | null>(null);

  const [department, setDepartment] = useState("");
  const [items, setItems] = useState<AuditItem[]>([
    { id: "1", sku: "", name: "", location: "", systemQty: "", physicalQty: "", unit: "", remarks: "" },
  ]);

  const updateItem = (id: string, field: keyof AuditItem, val: string) =>
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: val } : item)));

  const addItem = () =>
    setItems((prev) => [...prev, { id: Date.now().toString(), sku: "", name: "", location: "", systemQty: "", physicalQty: "", unit: "", remarks: "" }]);

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const handleExportExcel = useCallback(() => {
    const wsData: (string | number)[][] = [
      [`${appTitle} — Physical Stock Audit & Reconciliation Sheet`],
      [],
      ["Audit Date:", auditDate, "Department:", department],
      ["Audited By:", auditedBy, "Approved By:", approvedBy],
      [],
      ["SKU", "Product Name", "Location", "System Qty", "Physical Qty", "Variance", "Unit", "Status", "Remarks"],
      ...items.map((item) => {
        const sys = Number(item.systemQty) || 0;
        const phy = Number(item.physicalQty) || 0;
        const variance = item.physicalQty !== "" && item.systemQty !== "" ? phy - sys : "";
        const status =
          item.physicalQty === "" || item.systemQty === "" ? "Not Counted"
            : sys === phy ? "Match" : "Discrepancy";
        return [item.sku, item.name, item.location, sys || "", phy || "", variance, item.unit, status, item.remarks];
      }),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [{ wch: 18 }, { wch: 28 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 8 }, { wch: 14 }, { wch: 28 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stock Audit");
    XLSX.writeFile(wb, `Stock_Audit_${auditDate}.xlsx`);
  }, [appTitle, auditDate, department, auditedBy, approvedBy, items]);

  const countedItems = items.filter((i) => i.physicalQty !== "").length;
  const discrepancyItems = items.filter((i) => {
    const sys = Number(i.systemQty) || 0;
    const phy = Number(i.physicalQty) || 0;
    return i.physicalQty !== "" && sys !== phy;
  }).length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="no-print flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-card border border-border rounded-xl p-4 shadow-sm">
        <div>
          <h3 className="text-base font-semibold text-foreground">Physical Stock Audit & Variance Reconciliation Sheet</h3>
          <p className="text-xs text-muted-foreground">Enter counts, add signatures, export to Excel or print report.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={addItem} className="flex items-center gap-1 px-3 py-1.5 bg-muted hover:bg-accent text-muted-foreground hover:text-accent-foreground text-xs font-semibold rounded-lg transition-colors border border-border">
            <Plus className="w-3.5 h-3.5" /> Add Row
          </button>
          <button onClick={handleExportExcel} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-semibold rounded-lg transition-colors">
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity">
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Live summary badges */}
      <div className="no-print flex flex-wrap gap-3">
        <div className="px-3 py-1.5 bg-muted rounded-lg text-xs font-semibold text-muted-foreground border border-border">
          Total Rows: <span className="text-foreground">{items.length}</span>
        </div>
        <div className="px-3 py-1.5 bg-muted rounded-lg text-xs font-semibold text-muted-foreground border border-border">
          Counted: <span className="text-foreground">{countedItems}</span>
        </div>
        <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${discrepancyItems > 0 ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-muted text-muted-foreground border-border"}`}>
          Discrepancies: <span>{discrepancyItems}</span>
        </div>
      </div>

      {/* ===== Printable Sheet ===== */}
      <div className="printable-sheet bg-card border border-border rounded-xl p-8 shadow-md text-foreground w-full space-y-6">
        {/* Header */}
        <div className="border-b-2 border-foreground pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-extrabold text-foreground uppercase">{appTitle} — Physical Stock Audit Sheet</h2>
            <span className="text-xs text-muted-foreground">Inventory Control & Reconciliation Report</span>
          </div>
          <div className="text-xs text-muted-foreground">
            <strong className="text-foreground">Printed:</strong> {new Date().toLocaleString()}
          </div>
        </div>

        {/* Meta fields */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-muted p-4 rounded-xl border border-border text-sm">
          {[
            { label: "Audit Date", el: <input type="date" value={auditDate} onChange={(e) => setAuditDate(e.target.value)} className={sheetInputCls} /> },
            { label: "Department / Location", el: <input type="text" placeholder="e.g. Main Store" value={department} onChange={(e) => setDepartment(e.target.value)} className={sheetInputCls} /> },
            { label: "Audited By", el: <input type="text" placeholder="Name" value={auditedBy} onChange={(e) => setAuditedBy(e.target.value)} className={sheetInputCls} /> },
            { label: "Approved By", el: <input type="text" placeholder="Manager Name" value={approvedBy} onChange={(e) => setApprovedBy(e.target.value)} className={sheetInputCls} /> },
          ].map(({ label, el }) => (
            <div key={label}>
              <span className="block text-xs text-muted-foreground font-medium mb-1">{label}</span>
              {el}
            </div>
          ))}
        </div>

        {/* Audit Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-muted text-muted-foreground font-bold uppercase text-[10px]">
                {["#", "SKU", "Product Name", "Location", "System Qty", "Physical Qty", "Variance", "Unit", "Status", "Remarks", ""].map((h) => (
                  <th key={h} className="border border-border p-2 text-left last:no-print">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item, idx) => {
                const sys = Number(item.systemQty) || 0;
                const phy = Number(item.physicalQty) || 0;
                const hasPhysical = item.physicalQty !== "";
                const variance = hasPhysical ? phy - sys : null;
                const isMatch = hasPhysical && variance === 0;
                const isDiscrepancy = hasPhysical && variance !== 0;

                const cellInput = (placeholder: string, value: string, field: keyof AuditItem, extra?: string) => (
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => updateItem(item.id, field, e.target.value)}
                    className={`w-full bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground ${extra ?? ""}`}
                  />
                );

                return (
                  <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                    <td className="border border-border p-1.5 text-center text-muted-foreground font-medium">{idx + 1}</td>
                    <td className="border border-border p-1.5">{cellInput("SKU-001", item.sku, "sku", "font-mono")}</td>
                    <td className="border border-border p-1.5">{cellInput("Product name", item.name, "name", "font-semibold")}</td>
                    <td className="border border-border p-1.5">{cellInput("Shelf A1", item.location, "location")}</td>
                    <td className="border border-border p-1.5">
                      <input type="number" min="0" placeholder="0" value={item.systemQty} onChange={(e) => updateItem(item.id, "systemQty", e.target.value)} className="w-full bg-transparent focus:outline-none text-right font-medium text-foreground placeholder:text-muted-foreground" />
                    </td>
                    <td className="border border-border p-1.5">
                      <input type="number" min="0" placeholder="0" value={item.physicalQty} onChange={(e) => updateItem(item.id, "physicalQty", e.target.value)} className="w-full bg-transparent focus:outline-none text-right font-bold text-foreground placeholder:text-muted-foreground" />
                    </td>
                    <td className={`border border-border p-1.5 text-right font-bold ${
                      variance === null ? "text-muted-foreground"
                        : variance < 0 ? "text-destructive"
                        : variance > 0 ? "text-primary"
                        : "text-muted-foreground"
                    }`}>
                      {variance !== null ? (variance > 0 ? `+${variance}` : String(variance)) : "—"}
                    </td>
                    <td className="border border-border p-1.5">{cellInput("pcs", item.unit, "unit")}</td>
                    <td className="border border-border p-1.5 text-center">
                      {isMatch ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-primary/10 text-primary border border-primary/20">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Match
                        </span>
                      ) : isDiscrepancy ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-destructive/10 text-destructive border border-destructive/20">
                          <AlertTriangle className="w-2.5 h-2.5" /> Diff
                        </span>
                      ) : (
                        <span className="text-[9px] text-muted-foreground">Pending</span>
                      )}
                    </td>
                    <td className="border border-border p-1.5">{cellInput("Notes", item.remarks, "remarks")}</td>
                    <td className="border border-border p-1.5 text-center no-print">
                      <button onClick={() => removeItem(item.id)} className="text-destructive hover:opacity-70 transition-opacity">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary footer */}
        <div className="grid grid-cols-3 gap-4 bg-muted p-4 rounded-xl border border-border text-xs">
          {[
            { label: "Total Items Audited", value: countedItems, cls: "text-foreground" },
            { label: "Exact Matches", value: countedItems - discrepancyItems, cls: "text-primary" },
            { label: "Discrepancies Found", value: discrepancyItems, cls: discrepancyItems > 0 ? "text-destructive" : "text-muted-foreground" },
          ].map(({ label, value, cls }) => (
            <div key={label} className="text-center">
              <div className="text-muted-foreground font-medium">{label}</div>
              <div className={`text-lg font-black ${cls}`}>{value}</div>
            </div>
          ))}
        </div>

        {/* Signatures */}
        <div className="pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
          <SignatureBox
            label="Audited By (Signature)"
            name={auditedBy}
            onNameChange={setAuditedBy}
            dateValue={auditorDate}
            onDateChange={setAuditorDate}
            signatureDataUrl={auditorSig}
            onSignatureChange={setAuditorSig}
          />
          <SignatureBox
            label="Approved By (Management Signature)"
            name={approvedBy}
            onNameChange={setApprovedBy}
            dateValue={approverDate}
            onDateChange={setApproverDate}
            signatureDataUrl={approverSig}
            onSignatureChange={setApproverSig}
          />
        </div>
      </div>
    </div>
  );
}
