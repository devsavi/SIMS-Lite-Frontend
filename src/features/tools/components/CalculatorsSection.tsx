"use client";

import React, { useState } from "react";
import { Calculator, Scale, DollarSign, Percent, Info } from "lucide-react";

export function CalculatorsSection() {
  const [activeTab, setActiveTab] = useState<"rop" | "margin" | "scaling" | "tax">("rop");

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {(["rop", "margin", "scaling", "tax"] as const).map((tab) => {
          const labels: Record<typeof tab, string> = {
            rop: "Reorder Point & Safety Stock",
            margin: "Profit Margin & Markup",
            scaling: "Batch & Recipe Scaling",
            tax: "Tax (VAT/GST) & Discounts",
          };
          const icons: Record<typeof tab, React.ReactNode> = {
            rop: <Calculator className="w-4 h-4" />,
            margin: <DollarSign className="w-4 h-4" />,
            scaling: <Scale className="w-4 h-4" />,
            tax: <Percent className="w-4 h-4" />,
          };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {icons[tab]}
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {activeTab === "rop" && <ReorderPointCalculator />}
      {activeTab === "margin" && <ProfitMarginCalculator />}
      {activeTab === "scaling" && <BatchScalingCalculator />}
      {activeTab === "tax" && <TaxDiscountCalculator />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared input style
// ---------------------------------------------------------------------------
const inputCls =
  "w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary text-sm focus:outline-none";

// ---------------------------------------------------------------------------
// 1. Reorder Point & Safety Stock Calculator
// ---------------------------------------------------------------------------
function ReorderPointCalculator() {
  const [dailyUsage, setDailyUsage] = useState("");
  const [leadTime, setLeadTime] = useState("");
  const [maxDailyUsage, setMaxDailyUsage] = useState("");
  const [maxLeadTime, setMaxLeadTime] = useState("");

  const dUsage = Number(dailyUsage) || 0;
  const lTime = Number(leadTime) || 0;
  const maxDUsage = Number(maxDailyUsage) || 0;
  const maxLTime = Number(maxLeadTime) || 0;

  const avgLeadTimeDemand = dUsage * lTime;
  const maxDemand = maxDUsage * maxLTime;
  const safetyStock = Math.max(0, maxDemand - avgLeadTimeDemand);
  const reorderPoint = avgLeadTimeDemand + safetyStock;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          Stock Parameters
        </h3>
        <div className="space-y-3">
          {[
            { label: "Average Daily Sales / Usage (Units/day)", value: dailyUsage, set: setDailyUsage, placeholder: "e.g. 25" },
            { label: "Supplier Lead Time (Days)", value: leadTime, set: setLeadTime, placeholder: "e.g. 7" },
            { label: "Maximum Daily Sales / Usage (Units/day)", value: maxDailyUsage, set: setMaxDailyUsage, placeholder: "e.g. 40" },
            { label: "Maximum Supplier Lead Time (Days)", value: maxLeadTime, set: setMaxLeadTime, placeholder: "e.g. 10" },
          ].map(({ label, value, set, placeholder }) => (
            <div key={label}>
              <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
              <input type="number" min="0" placeholder={placeholder} value={value} onChange={(e) => set(e.target.value)} className={inputCls} />
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground">Calculated Reorder Level</h3>
            <span className="px-2.5 py-1 text-xs bg-primary text-primary-foreground font-medium rounded-full">ROP</span>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-muted rounded-xl border border-border">
              <div className="text-xs font-medium text-muted-foreground">Reorder Point (ROP)</div>
              <div className="text-3xl font-extrabold text-primary mt-1">
                {reorderPoint.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">units</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Place a purchase order when inventory reaches this level.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted rounded-lg border border-border">
                <div className="text-xs text-muted-foreground">Safety Stock</div>
                <div className="text-xl font-bold text-foreground mt-0.5">{safetyStock.toLocaleString()} <span className="text-xs text-muted-foreground">units</span></div>
              </div>
              <div className="p-3 bg-muted rounded-lg border border-border">
                <div className="text-xs text-muted-foreground">Lead Time Demand</div>
                <div className="text-xl font-bold text-foreground mt-0.5">{avgLeadTimeDemand.toLocaleString()} <span className="text-xs text-muted-foreground">units</span></div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-muted rounded-lg text-xs text-muted-foreground flex items-start gap-2 border border-border">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span>Formula: <strong className="text-foreground">ROP = (Avg Daily Sales × Lead Time) + Safety Stock</strong></span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Profit Margin & Markup Calculator
// ---------------------------------------------------------------------------
function ProfitMarginCalculator() {
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");

  const cPrice = Number(costPrice) || 0;
  const sPrice = Number(sellingPrice) || 0;
  const profit = sPrice - cPrice;
  const marginPct = sPrice > 0 ? (profit / sPrice) * 100 : 0;
  const markupPct = cPrice > 0 ? (profit / cPrice) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          Cost & Pricing Inputs
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Unit Purchase / Production Cost</label>
            <input type="number" min="0" step="0.01" placeholder="e.g. 100.00" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Target Selling Price</label>
            <input type="number" min="0" step="0.01" placeholder="e.g. 150.00" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} className={inputCls} />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground mb-4">Profitability Breakdown</h3>
          <div className="space-y-3">
            <div className="p-4 bg-muted rounded-xl border border-border">
              <div className="text-xs text-muted-foreground">Net Profit Per Unit</div>
              <div className="text-3xl font-extrabold text-primary mt-1">{profit.toFixed(2)}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted rounded-lg border border-border">
                <div className="text-xs text-muted-foreground">Gross Margin</div>
                <div className="text-xl font-bold text-foreground mt-0.5">{marginPct.toFixed(2)}%</div>
              </div>
              <div className="p-3 bg-muted rounded-lg border border-border">
                <div className="text-xs text-muted-foreground">Markup</div>
                <div className="text-xl font-bold text-foreground mt-0.5">{markupPct.toFixed(2)}%</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-muted rounded-lg text-xs text-muted-foreground border border-border">
          Margin = (Profit ÷ Selling Price) | Markup = (Profit ÷ Cost Price)
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. Batch & Recipe Scaling Calculator
// ---------------------------------------------------------------------------
interface Ingredient { id: string; name: string; baseQty: string; unit: string; }

function BatchScalingCalculator() {
  const [baseYield, setBaseYield] = useState("");
  const [targetYield, setTargetYield] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ id: "1", name: "", baseQty: "", unit: "" }]);

  const scaleFactor = Number(baseYield) > 0 ? Number(targetYield) / Number(baseYield) : 0;

  const updateIngredient = (id: string, field: keyof Ingredient, value: string) =>
    setIngredients((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));

  const addIngredient = () =>
    setIngredients((prev) => [...prev, { id: Date.now().toString(), name: "", baseQty: "", unit: "" }]);

  const removeIngredient = (id: string) =>
    setIngredients((prev) => prev.filter((item) => item.id !== id));

  const cellInput = "w-full bg-transparent focus:outline-none text-sm text-foreground placeholder:text-muted-foreground";

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            Batch & Production Yield Scaler
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Scale ingredient ratios for custom batch sizes.</p>
        </div>
        <div className="px-3 py-1.5 bg-muted rounded-lg border border-border text-xs font-semibold text-foreground">
          Scale Factor: {scaleFactor ? `${scaleFactor.toFixed(3)}×` : "—"}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted p-4 rounded-xl border border-border">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Base Batch Yield (Units)</label>
          <input type="number" min="0" placeholder="e.g. 100" value={baseYield} onChange={(e) => setBaseYield(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Target Batch Yield (Units)</label>
          <input type="number" min="0" placeholder="e.g. 250" value={targetYield} onChange={(e) => setTargetYield(e.target.value)} className={inputCls} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs font-semibold uppercase text-muted-foreground">
              <th className="py-2.5 px-3 text-left">Item / Raw Material</th>
              <th className="py-2.5 px-3 text-left w-28">Base Qty</th>
              <th className="py-2.5 px-3 text-left w-24">Unit</th>
              <th className="py-2.5 px-3 text-right">Scaled Qty</th>
              <th className="py-2.5 px-3 text-center w-16">Del</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ingredients.map((ing) => {
              const scaledQty = (Number(ing.baseQty) || 0) * scaleFactor;
              return (
                <tr key={ing.id} className="hover:bg-muted/50 transition-colors">
                  <td className="py-2 px-3">
                    <input type="text" placeholder="e.g. Flour" value={ing.name} onChange={(e) => updateIngredient(ing.id, "name", e.target.value)} className={cellInput} />
                  </td>
                  <td className="py-2 px-3">
                    <input type="number" min="0" step="any" placeholder="0" value={ing.baseQty} onChange={(e) => updateIngredient(ing.id, "baseQty", e.target.value)} className={cellInput} />
                  </td>
                  <td className="py-2 px-3">
                    <input type="text" placeholder="kg, L" value={ing.unit} onChange={(e) => updateIngredient(ing.id, "unit", e.target.value)} className={cellInput} />
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-primary">
                    {scaledQty.toFixed(2)} {ing.unit}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button onClick={() => removeIngredient(ing.id)} className="text-destructive hover:opacity-70 text-xs font-medium transition-opacity">Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button onClick={addIngredient} className="px-3 py-1.5 bg-muted hover:bg-accent text-muted-foreground hover:text-accent-foreground text-xs font-semibold rounded-lg transition-colors border border-border">
        + Add Ingredient Row
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. Tax (VAT/GST) & Discount Calculator
// ---------------------------------------------------------------------------
function TaxDiscountCalculator() {
  const [subtotal, setSubtotal] = useState("");
  const [discountPct, setDiscountPct] = useState("");
  const [taxPct, setTaxPct] = useState("");

  const sub = Number(subtotal) || 0;
  const discP = Number(discountPct) || 0;
  const taxP = Number(taxPct) || 0;

  const discountAmount = (sub * discP) / 100;
  const netAfterDiscount = sub - discountAmount;
  const taxAmount = (netAfterDiscount * taxP) / 100;
  const grandTotal = netAfterDiscount + taxAmount;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Percent className="w-5 h-5 text-primary" />
          Subtotal & Rate Controls
        </h3>
        <div className="space-y-4">
          {[
            { label: "Base Amount / Subtotal", val: subtotal, set: setSubtotal, placeholder: "e.g. 500.00" },
            { label: "Discount (%)", val: discountPct, set: setDiscountPct, placeholder: "e.g. 10" },
            { label: "Tax / VAT / GST Rate (%)", val: taxPct, set: setTaxPct, placeholder: "e.g. 15" },
          ].map(({ label, val, set, placeholder }) => (
            <div key={label}>
              <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
              <input type="number" min="0" step="0.01" placeholder={placeholder} value={val} onChange={(e) => set(e.target.value)} className={inputCls} />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground mb-4">Invoice & Tax Summary</h3>
          <div className="space-y-3">
            <div className="p-4 bg-muted rounded-xl border border-border">
              <div className="text-xs text-muted-foreground">Grand Total Payable</div>
              <div className="text-3xl font-extrabold text-primary mt-1">{grandTotal.toFixed(2)}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted rounded-lg border border-border">
                <div className="text-xs text-muted-foreground">Discount Saved</div>
                <div className="text-lg font-bold text-foreground mt-0.5">-{discountAmount.toFixed(2)}</div>
              </div>
              <div className="p-3 bg-muted rounded-lg border border-border">
                <div className="text-xs text-muted-foreground">Tax Component</div>
                <div className="text-lg font-bold text-foreground mt-0.5">+{taxAmount.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-muted rounded-lg text-xs text-muted-foreground border border-border">
          Net = (Subtotal − Discount) + Tax
        </div>
      </div>
    </div>
  );
}
