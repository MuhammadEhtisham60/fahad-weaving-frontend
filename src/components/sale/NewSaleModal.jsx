import { useState } from "react";
import { X, TrendingUp, Save } from "lucide-react";
import { Button } from "../ui-kit.jsx";
import { SALE_STATUSES, clothCustomers } from "../../lib/mock-data.js";

const inputClass =
  "w-full h-10 px-3 rounded-lg bg-muted border border-transparent focus:bg-background focus:border-ring outline-none text-sm";

export function NewSaleModal({ onClose, onSave }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    customer: clothCustomers[0],
    product: "Grey Loom Fabric 60\"",
    quantity: "",
    unit: "meters",
    total: "",
    paid: "",
    status: "Pending",
    date: today,
    notes: "",
  });

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const quantity = Number(form.quantity) || 0;
    const total = Number(form.total) || 0;
    let paid = Number(form.paid) || 0;
    let status = form.status;

    if (status === "Paid" || status === "Delivered") paid = total;
    if (status === "Pending" || status === "Dispatched" || status === "On Credit" || status === "Cancelled") {
      paid = Math.min(paid, total);
    }
    if (status === "Partial" && paid >= total) status = "Paid";
    if (status === "Partial" && paid <= 0) status = "Pending";

    onSave({
      customer: form.customer,
      product: form.product.trim() || "Woven cloth",
      quantity,
      unit: form.unit,
      total,
      paid,
      status,
      date: form.date,
      notes: form.notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-elegant overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-gradient-primary px-6 py-4 text-primary-foreground shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">New Sale / Invoice</h2>
                <p className="text-sm text-white/80">Woven cloth from power looms</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-smooth"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Customer / buyer</label>
            <select value={form.customer} onChange={(e) => set("customer", e.target.value)} className={inputClass} required>
              {clothCustomers.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Product / fabric</label>
            <input
              value={form.product}
              onChange={(e) => set("product", e.target.value)}
              placeholder="e.g. Grey Loom Fabric, shirting roll"
              className={inputClass}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Quantity</label>
              <input
                type="number"
                min="0"
                step="any"
                value={form.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                placeholder="1200"
                className={inputClass}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Unit</label>
              <select value={form.unit} onChange={(e) => set("unit", e.target.value)} className={inputClass}>
                <option value="meters">meters</option>
                <option value="yards">yards</option>
                <option value="rolls">rolls</option>
                <option value="pcs">pcs</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Invoice amount (Rs)</label>
              <input
                type="number"
                min="0"
                value={form.total}
                onChange={(e) => set("total", e.target.value)}
                placeholder="480000"
                className={inputClass}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Received now (Rs)</label>
              <input
                type="number"
                min="0"
                value={form.paid}
                onChange={(e) => set("paid", e.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sale date</label>
              <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={inputClass} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Payment status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputClass}>
                {SALE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
              placeholder="Bilty #, gate pass, delivery address…"
              className={`${inputClass} h-auto py-2 resize-none`}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              <Save className="h-4 w-4" /> Save Sale
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
