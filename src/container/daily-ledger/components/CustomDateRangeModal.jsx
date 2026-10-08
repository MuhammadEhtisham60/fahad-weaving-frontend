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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-xl sm:rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh] scale-in-95 duration-200 animate-in">
        {/* Header */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-border flex items-center justify-between gap-2 bg-muted/20 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm shrink-0">
              <CalendarRange className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold text-foreground truncate">
                Custom Date Range
              </h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                Filter summaries, revenues, and expenses by custom dates
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
            title="Close modal"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleApply} className="p-3.5 sm:p-6 space-y-3.5 sm:space-y-5 overflow-y-auto flex-1">
          {/* Quick Preset Buttons */}
          <div>
            <label className="text-[11px] sm:text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Quick Date Selectors
            </label>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => handlePresetClick("this_year")}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-border bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-[11px] sm:text-xs font-medium text-foreground transition-all"
              >
                Year to Date
              </button>
              <button
                type="button"
                onClick={() => handlePresetClick("last_30")}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-border bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-[11px] sm:text-xs font-medium text-foreground transition-all"
              >
                Last 30 Days
              </button>
              <button
                type="button"
                onClick={() => handlePresetClick("last_90")}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-border bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-[11px] sm:text-xs font-medium text-foreground transition-all"
              >
                Last 90 Days
              </button>
              <button
                type="button"
                onClick={() => handlePresetClick("q1")}
                className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-border bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-[11px] sm:text-xs font-medium text-muted-foreground transition-all"
              >
                Q1
              </button>
              <button
                type="button"
                onClick={() => handlePresetClick("q2")}
                className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-border bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-[11px] sm:text-xs font-medium text-muted-foreground transition-all"
              >
                Q2
              </button>
              <button
                type="button"
                onClick={() => handlePresetClick("q3")}
                className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-border bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-[11px] sm:text-xs font-medium text-muted-foreground transition-all"
              >
                Q3
              </button>
            </div>
          </div>

          {/* Date Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/30 border border-border/70">
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
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-primary/5 border border-primary/20 text-xs text-primary font-medium">
              <span className="flex items-center gap-1.5">
                <CalendarRange className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">Selected Timeline:</span>
              </span>
              <span className="font-bold flex items-center gap-1.5 truncate">
                {dateFrom} <ArrowRight className="h-3 w-3 shrink-0" /> {dateTo}
              </span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-border text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex-1 sm:flex-initial"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial"
            >
              <Check className="h-4 w-4" /> Apply Filter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
