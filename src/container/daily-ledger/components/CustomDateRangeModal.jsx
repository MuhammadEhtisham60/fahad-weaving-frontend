import React, { useState, useEffect } from "react";
import {
  X,
  CalendarRange,
  Calendar,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { InputField } from "../../../common/sharefield/index.js";

export function CustomDateRangeModal({
  open,
  onClose,
  initialDateFrom,
  initialDateTo,
  onApply,
}) {
  const todayStr = new Date().toISOString().split("T")[0];

  const [dateFrom, setDateFrom] = useState(
    initialDateFrom || "2026-01-01"
  );
  const [dateTo, setDateTo] = useState(initialDateTo || todayStr);

  useEffect(() => {
    if (open) {
      setDateFrom(initialDateFrom || "2026-01-01");
      setDateTo(initialDateTo || todayStr);
    }
  }, [open, initialDateFrom, initialDateTo, todayStr]);

  if (!open) return null;

  const handlePresetClick = (presetType) => {
    const today = new Date();
    const curYear = today.getFullYear();

    switch (presetType) {
      case "this_year": {
        setDateFrom(`${curYear}-01-01`);
        setDateTo(todayStr);
        break;
      }
      case "last_30": {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        setDateFrom(d.toISOString().split("T")[0]);
        setDateTo(todayStr);
        break;
      }
      case "last_90": {
        const d = new Date();
        d.setDate(d.getDate() - 90);
        setDateFrom(d.toISOString().split("T")[0]);
        setDateTo(todayStr);
        break;
      }
      case "q1": {
        setDateFrom(`${curYear}-01-01`);
        setDateTo(`${curYear}-03-31`);
        break;
      }
      case "q2": {
        setDateFrom(`${curYear}-04-01`);
        setDateTo(`${curYear}-06-30`);
        break;
      }
      case "q3": {
        setDateFrom(`${curYear}-07-01`);
        setDateTo(`${curYear}-09-30`);
        break;
      }
      case "q4": {
        setDateFrom(`${curYear}-10-01`);
        setDateTo(`${curYear}-12-31`);
        break;
      }
      default:
        break;
    }
  };

  const handleApply = (e) => {
    if (e) e.preventDefault();

    if (!dateFrom || !dateTo) {
      toast.error("Please select both Start Date and End Date");
      return;
    }

    if (dateFrom > dateTo) {
      toast.error("Start Date cannot be later than End Date");
      return;
    }

    onApply(dateFrom, dateTo);
    toast.success(`Filter applied: ${dateFrom} to ${dateTo}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col scale-in-95 duration-200 animate-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
              <CalendarRange className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Custom Date Range
              </h2>
              <p className="text-xs text-muted-foreground">
                Filter ledger summaries, revenues, and expenses by custom dates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleApply} className="p-6 space-y-5">
          {/* Quick Preset Buttons */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Quick Date Selectors
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => handlePresetClick("this_year")}
                className="px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-xs font-medium text-foreground transition-all"
              >
                Year to Date (2026)
              </button>
              <button
                type="button"
                onClick={() => handlePresetClick("last_30")}
                className="px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-xs font-medium text-foreground transition-all"
              >
                Last 30 Days
              </button>
              <button
                type="button"
                onClick={() => handlePresetClick("last_90")}
                className="px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-xs font-medium text-foreground transition-all"
              >
                Last 90 Days
              </button>
              <button
                type="button"
                onClick={() => handlePresetClick("q1")}
                className="px-2.5 py-1.5 rounded-xl border border-border bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-xs font-medium text-muted-foreground transition-all"
              >
                Q1 (Jan-Mar)
              </button>
              <button
                type="button"
                onClick={() => handlePresetClick("q2")}
                className="px-2.5 py-1.5 rounded-xl border border-border bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-xs font-medium text-muted-foreground transition-all"
              >
                Q2 (Apr-Jun)
              </button>
              <button
                type="button"
                onClick={() => handlePresetClick("q3")}
                className="px-2.5 py-1.5 rounded-xl border border-border bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-xs font-medium text-muted-foreground transition-all"
              >
                Q3 (Jul-Sep)
              </button>
            </div>
          </div>

          {/* Date Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/30 border border-border/70">
            <div>
              <InputField
                label="Start Date (From)"
                type="date"
                required
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                icon={Calendar}
              />
            </div>
            <div>
              <InputField
                label="End Date (To)"
                type="date"
                required
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                icon={Calendar}
              />
            </div>
          </div>

          {/* Date Range Summary Preview */}
          {dateFrom && dateTo && (
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/20 text-xs text-primary font-medium">
              <span className="flex items-center gap-1.5">
                <CalendarRange className="h-4 w-4" />
                Selected Timeline:
              </span>
              <span className="font-bold flex items-center gap-1.5">
                {dateFrom} <ArrowRight className="h-3 w-3" /> {dateTo}
              </span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-all flex items-center gap-2"
            >
              <Check className="h-4 w-4" /> Apply Filter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
