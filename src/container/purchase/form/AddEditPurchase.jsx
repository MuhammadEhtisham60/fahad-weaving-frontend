import { useState } from "react";
import { X, Package, Save } from "lucide-react";
import { Button } from "../../../components/ui-kit.jsx";
import { PURCHASE_STATUSES, yarnVendors, PURCHASE_UNITS, INPUT_CLASS, createEmptyPurchaseForm } from "../utils/constants.js";
import { formContent } from "../utils/content.js";
import { normalizeFormSubmit } from "../utils/helpers.js";

export function AddEditPurchase({ onClose, onSave }) {
  const [form, setForm] = useState(() => createEmptyPurchaseForm(yarnVendors[0]));

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(normalizeFormSubmit(form));
    onClose();
  };

  const { labels, placeholders, title, subtitle, save, cancel } = formContent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-elegant overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-gradient-primary px-6 py-4 text-primary-foreground shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{title}</h2>
                <p className="text-sm text-white/80">{subtitle}</p>
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
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{labels.vendor}</label>
            <select value={form.vendor} onChange={(e) => set("vendor", e.target.value)} className={INPUT_CLASS} required>
              {yarnVendors.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{labels.material}</label>
            <input
              value={form.material}
              onChange={(e) => set("material", e.target.value)}
              placeholder={placeholders.material}
              className={INPUT_CLASS}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{labels.quantity}</label>
              <input
                type="number"
                min="0"
                step="any"
                value={form.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                placeholder={placeholders.quantity}
                className={INPUT_CLASS}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{labels.unit}</label>
              <select value={form.unit} onChange={(e) => set("unit", e.target.value)} className={INPUT_CLASS}>
                {PURCHASE_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{labels.total}</label>
              <input
                type="number"
                min="0"
                value={form.total}
                onChange={(e) => set("total", e.target.value)}
                placeholder={placeholders.total}
                className={INPUT_CLASS}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{labels.paid}</label>
              <input
                type="number"
                min="0"
                value={form.paid}
                onChange={(e) => set("paid", e.target.value)}
                placeholder={placeholders.paid}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{labels.date}</label>
              <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={INPUT_CLASS} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{labels.status}</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={INPUT_CLASS}>
                {PURCHASE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{labels.notes}</label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
              placeholder={placeholders.notes}
              className={`${INPUT_CLASS} h-auto py-2 resize-none`}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              {cancel}
            </Button>
            <Button type="submit" className="flex-1">
              <Save className="h-4 w-4" /> {save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
