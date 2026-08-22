"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  StickyNote,
  QrCode,
  ArrowLeftRight,
  Copy,
  Check,
  Plus,
  Trash2,
  Download,
  Printer,
  Sparkles,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

export function OfficeUtilitiesSection() {
  const [activeTab, setActiveTab] = useState<"scratchpad" | "barcode" | "unit-converter">("scratchpad");

  const tabs = [
    { key: "scratchpad" as const, label: "Quick Scratchpad", icon: <StickyNote className="w-4 h-4" /> },
    { key: "barcode" as const, label: "Barcode & QR Generator", icon: <QrCode className="w-4 h-4" /> },
    { key: "unit-converter" as const, label: "Unit Converter", icon: <ArrowLeftRight className="w-4 h-4" /> },
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

      {activeTab === "scratchpad" && <QuickScratchpad />}
      {activeTab === "barcode" && <BarcodeQrGenerator />}
      {activeTab === "unit-converter" && <UnitConverter />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1. Quick Scratchpad (No pre-added sample memos)
// ---------------------------------------------------------------------------
interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

function QuickScratchpad() {
  const [notes, setNotes] = useState<Note[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sims_scratchpad_notes");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (_) {
          /* ignore */
        }
      }
    }
    return [];
  });

  const [activeNoteId, setActiveNoteId] = useState<string | null>(() => (notes.length > 0 ? notes[0].id : null));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sims_scratchpad_notes", JSON.stringify(notes));
    }
  }, [notes]);

  const activeNote = notes.find((n) => n.id === activeNoteId) ?? notes[0] ?? null;

  const updateNote = (field: keyof Note, value: string) => {
    if (!activeNote) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNote.id ? { ...n, [field]: value, updatedAt: new Date().toLocaleTimeString() } : n
      )
    );
  };

  const createNote = () => {
    const newId = Date.now().toString();
    const newNote: Note = {
      id: newId,
      title: `Memo ${notes.length + 1}`,
      content: "",
      updatedAt: new Date().toLocaleTimeString(),
    };
    setNotes((prev) => [...prev, newNote]);
    setActiveNoteId(newId);
  };

  const deleteNote = (id: string) => {
    const filtered = notes.filter((n) => n.id !== id);
    setNotes(filtered);
    if (activeNoteId === id) {
      setActiveNoteId(filtered.length > 0 ? filtered[0].id : null);
    }
  };

  const handleCopy = () => {
    if (activeNote) {
      navigator.clipboard.writeText(activeNote.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 bg-card border border-border rounded-xl shadow-sm overflow-hidden min-h-[380px]">
      {/* Sidebar */}
      <div className="bg-muted border-b lg:border-b-0 lg:border-r border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">My Memos</h4>
          <button
            onClick={createNote}
            className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>

        {notes.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground space-y-2">
            <p>No memos created.</p>
            <button
              onClick={createNote}
              className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md"
            >
              + Create First Note
            </button>
          </div>
        ) : (
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {notes.map((n) => (
              <div
                key={n.id}
                onClick={() => setActiveNoteId(n.id)}
                className={`p-2.5 rounded-lg cursor-pointer transition-colors flex justify-between items-center ${
                  activeNote?.id === n.id
                    ? "bg-primary/10 border border-primary/30 text-foreground font-medium"
                    : "hover:bg-accent text-muted-foreground"
                }`}
              >
                <div className="truncate text-xs min-w-0">
                  <div className="font-semibold truncate text-foreground">{n.title || "Untitled"}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{n.updatedAt}</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(n.id);
                  }}
                  className="text-muted-foreground hover:text-destructive p-1 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="lg:col-span-3 p-5 space-y-4">
        {activeNote ? (
          <>
            <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => updateNote("title", e.target.value)}
                placeholder="Note Title..."
                className="text-base font-bold bg-transparent border-none text-foreground focus:outline-none w-full placeholder:text-muted-foreground"
              />
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-accent text-muted-foreground hover:text-accent-foreground text-xs font-semibold rounded-lg shrink-0 transition-colors border border-border"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <textarea
              value={activeNote.content}
              onChange={(e) => updateNote("content", e.target.value)}
              placeholder="Type your office note, stock memo, or task scratchpad here..."
              rows={10}
              className="w-full p-3 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary focus:outline-none resize-none font-mono placeholder:text-muted-foreground"
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm py-16 space-y-3">
            <StickyNote className="w-10 h-10 text-muted-foreground/30" />
            <p>No note selected. Click below to create a scratchpad memo.</p>
            <button
              onClick={createNote}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" /> Create New Memo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Barcode & QR Code Generator
// ---------------------------------------------------------------------------
function getCodeImageUrl(value: string, type: "qr" | "barcode"): string {
  const encoded = encodeURIComponent(value);
  return type === "qr"
    ? `https://quickchart.io/qr?text=${encoded}&size=300&margin=1`
    : `https://quickchart.io/barcode?type=code128&text=${encoded}&width=3&height=80`;
}

interface CodePreviewProps {
  imageUrl: string;
  value: string;
  type: "qr" | "barcode";
  onPrint: () => void;
  onDownload: () => void;
  isDownloading: boolean;
}

function CodePreview({ imageUrl, value, type, onPrint, onDownload, isDownloading }: CodePreviewProps) {
  return (
    <>
      <div className="p-5 bg-card rounded-xl shadow-sm border border-border flex flex-col items-center w-full max-w-xs">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={`Generated ${type}`}
          className="max-h-52 w-auto object-contain"
          crossOrigin="anonymous"
        />
        <span className="text-xs font-mono font-bold text-foreground mt-3 border-t border-border pt-2 tracking-widest w-full text-center break-all">
          {value}
        </span>
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        <button
          onClick={onDownload}
          disabled={isDownloading}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isDownloading ? "Downloading…" : "Download PNG"}
        </button>
        <button
          onClick={onPrint}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary border border-primary/30 font-semibold hover:bg-primary/20 text-xs rounded-lg transition-colors shadow-xs"
        >
          <Printer className="w-4 h-4 text-primary" />
          Print Label
        </button>
      </div>
    </>
  );
}

function BarcodeQrGenerator() {
  const [codeValue, setCodeValue] = useState("");
  const [codeType, setCodeType] = useState<"qr" | "barcode">("qr");
  const [generated, setGenerated] = useState<{ value: string; type: "qr" | "barcode" } | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleGenerate = () => {
    if (!codeValue.trim()) return;
    setGenerated({ value: codeValue.trim(), type: codeType });
  };

  const handlePrint = useCallback(() => {
    if (!generated) return;
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 150);
  }, [generated]);

  const handleDownload = useCallback(async () => {
    if (!generated) return;
    setIsDownloading(true);
    try {
      const url = getCodeImageUrl(generated.value, generated.type);
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch image");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `${generated.type}_${generated.value.replace(/[^a-zA-Z0-9_-]/g, "_")}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch {
      alert("Download failed. Please try saving the image manually by right-clicking it.");
    } finally {
      setIsDownloading(false);
    }
  }, [generated]);

  const imageUrl = generated ? getCodeImageUrl(generated.value, generated.type) : "";

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="space-y-5">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            Code Parameters
          </h3>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">SKU / Reference / Text</label>
            <input
              type="text"
              placeholder="Type SKU or reference text (e.g. SKU-100234)"
              value={codeValue}
              onChange={(e) => setCodeValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Format Type</label>
            <div className="flex gap-6">
              {(["qr", "barcode"] as const).map((t) => (
                <label key={t} className="flex items-center gap-2 text-sm text-foreground font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="codeType"
                    checked={codeType === t}
                    onChange={() => setCodeType(t)}
                    className="text-primary"
                  />
                  {t === "qr" ? "QR Code (2D)" : "Barcode (CODE128)"}
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!codeValue.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg shadow-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            <Sparkles className="w-4 h-4" />
            Generate Code
          </button>
        </div>

        <div className="bg-muted border border-border rounded-xl p-6 flex flex-col items-center justify-center gap-4 min-h-64">
          {generated ? (
            <CodePreview
              imageUrl={imageUrl}
              value={generated.value}
              type={generated.type}
              onPrint={handlePrint}
              onDownload={handleDownload}
              isDownloading={isDownloading}
            />
          ) : (
            <div className="text-center space-y-2">
              <QrCode className="w-10 h-10 mx-auto text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">
                Enter a SKU or text and click{" "}
                <strong className="text-foreground">&ldquo;Generate Code&rdquo;</strong> to create your QR or Barcode.
              </p>
            </div>
          )}
        </div>
      </div>

      {generated && (
        <div
          className="printable-sheet"
          style={{ display: isPrinting ? "block" : "none" }}
          aria-hidden={!isPrinting}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "48px 32px",
              background: "#ffffff",
              fontFamily: "monospace",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={generated.value}
              style={{ maxWidth: "280px", width: "100%", height: "auto", display: "block" }}
            />
            <div
              style={{
                marginTop: "18px",
                paddingTop: "14px",
                borderTop: "1px solid #ccc",
                fontSize: "16px",
                fontWeight: "bold",
                letterSpacing: "3px",
                color: "#000",
                wordBreak: "break-all",
                textAlign: "center",
                maxWidth: "280px",
              }}
            >
              {generated.value}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// 3. Multi-Unit Converter (Using App UI Select dropdowns)
// ---------------------------------------------------------------------------
type ConvCategory = "weight" | "volume" | "count";

const UNIT_OPTIONS: Record<ConvCategory, { value: string; label: string }[]> = {
  weight: [
    { value: "kg", label: "Kilograms (kg)" },
    { value: "g", label: "Grams (g)" },
    { value: "lb", label: "Pounds (lb)" },
  ],
  volume: [
    { value: "L", label: "Liters (L)" },
    { value: "ml", label: "Milliliters (ml)" },
    { value: "gal", label: "US Gallon (gal)" },
  ],
  count: [
    { value: "carton", label: "Carton (24 pcs)" },
    { value: "pack", label: "Pack (6 pcs)" },
    { value: "pcs", label: "Pieces (pcs)" },
  ],
};

function convertValue(val: number, category: ConvCategory, from: string, to: string): number {
  if (category === "weight") {
    const toKg: Record<string, number> = { kg: 1, g: 0.001, lb: 0.453592 };
    const fromKg: Record<string, number> = { kg: 1, g: 1000, lb: 1 / 0.453592 };
    return val * (toKg[from] ?? 1) * (fromKg[to] ?? 1);
  }
  if (category === "volume") {
    const toL: Record<string, number> = { L: 1, ml: 0.001, gal: 3.78541 };
    const fromL: Record<string, number> = { L: 1, ml: 1000, gal: 1 / 3.78541 };
    return val * (toL[from] ?? 1) * (fromL[to] ?? 1);
  }
  const toPcs: Record<string, number> = { pcs: 1, pack: 6, carton: 24 };
  const fromPcs: Record<string, number> = { pcs: 1, pack: 1 / 6, carton: 1 / 24 };
  return val * (toPcs[from] ?? 1) * (fromPcs[to] ?? 1);
}

function UnitConverter() {
  const [val, setVal] = useState("");
  const [category, setCategory] = useState<ConvCategory>("weight");
  const [fromUnit, setFromUnit] = useState("kg");
  const [toUnit, setToUnit] = useState("g");

  const numVal = Number(val) || 0;
  const result = convertValue(numVal, category, fromUnit, toUnit);

  const handleCategoryChange = (c: ConvCategory) => {
    setCategory(c);
    const opts = UNIT_OPTIONS[c];
    setFromUnit(opts[0].value);
    setToUnit(opts[1].value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-primary" />
          Unit Converter
        </h3>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Conversion Category</label>
          <Select value={category} onValueChange={(v) => handleCategoryChange(v as ConvCategory)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weight">Weight (kg, g, lb)</SelectItem>
              <SelectItem value="volume">Volume (L, ml, Gallon)</SelectItem>
              <SelectItem value="count">Packaging / Count (Carton, Pack, Pieces)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Quantity</label>
          <input
            type="number"
            placeholder="Type quantity to convert"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">From Unit</label>
            <Select value={fromUnit} onValueChange={setFromUnit}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {UNIT_OPTIONS[category].map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">To Unit</label>
            <Select value={toUnit} onValueChange={setToUnit}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {UNIT_OPTIONS[category].map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Result panel */}
      <div className="bg-muted border border-border rounded-xl p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground mb-4">Converted Result</h3>
          <div className="p-4 bg-card rounded-xl border border-border">
            <div className="text-xs text-muted-foreground">Equivalent Quantity</div>
            <div className="text-3xl font-extrabold text-primary mt-1">
              {result.toLocaleString(undefined, { maximumFractionDigits: 4 })}{" "}
              <span className="text-base font-medium text-muted-foreground">{toUnit}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 text-xs text-muted-foreground bg-card border border-border rounded-lg px-3 py-2">
          {numVal} {fromUnit} = {result.toLocaleString(undefined, { maximumFractionDigits: 4 })} {toUnit}
        </div>
      </div>
    </div>
  );
}
