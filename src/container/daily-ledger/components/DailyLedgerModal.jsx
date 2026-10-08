import React, { useState, useEffect } from "react";
import { X, Calendar, DollarSign, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useCreateDailyLedgerMutation,
  useUpdateDailyLedgerMutation,
  useGetDailyLedgerChoicesQuery,
} from "../../../store/index.js";
import {
  InputField,
  SelectField,
  TextareaField,
} from "../../../common/sharefield/index.js";

export function DailyLedgerModal({
  open,
  onClose,
  selectedDate,
  editLedger = null,
  onSuccess,
}) {
  const isEdit = Boolean(editLedger && editLedger.id);
  const [ledgerDate, setLedgerDate] = useState(
    selectedDate || new Date().toISOString().split("T")[0]
  );
  const [openingBalance, setOpeningBalance] = useState("0.00");
  const [status, setStatus] = useState("Open");
  const [notes, setNotes] = useState("");

  const { data: choicesData } = useGetDailyLedgerChoicesQuery();
  const [createLedger, { isLoading: isCreating }] = useCreateDailyLedgerMutation();
  const [updateLedger, { isLoading: isUpdating }] = useUpdateDailyLedgerMutation();

  const isSubmitting = isCreating || isUpdating;

  const statusChoices = choicesData?.statusChoices || [
    { value: "Open", label: "Open" },
    { value: "Closed", label: "Closed" },
    { value: "Reconciled", label: "Reconciled" },
    { value: "Draft", label: "Draft" },
  ];

  useEffect(() => {
    if (editLedger && editLedger.id) {
      setLedgerDate(
        editLedger.ledger_date ||
        editLedger.ledgerDate ||
        selectedDate ||
        new Date().toISOString().split("T")[0]
      );
      setOpeningBalance(
        String(editLedger.opening_balance ?? editLedger.openingBalance ?? "0.00")
      );
      setStatus(editLedger.status || "Open");
      setNotes(editLedger.notes || "");
    } else {
      setLedgerDate(
        editLedger?.ledger_date ||
        selectedDate ||
        new Date().toISOString().split("T")[0]
      );
      setOpeningBalance(
        String(editLedger?.opening_balance ?? "0.00")
      );
      setStatus(editLedger?.status || "Open");
      setNotes(editLedger?.notes || "");
    }
  }, [editLedger, selectedDate, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const opBal = parseFloat(openingBalance);
    if (isNaN(opBal) || opBal < 0) {
      toast.error("Opening balance must be a non-negative number");
      return;
    }

    if (!ledgerDate) {
      toast.error("Please select a valid ledger date");
      return;
    }

    const payload = {
      ledger_date: ledgerDate,
      opening_balance: opBal.toFixed(2),
      status,
      notes: notes.trim(),
    };

    try {
      if (isEdit) {
        await updateLedger({
          id: editLedger.id,
          ...payload,
        }).unwrap();
        toast.success("Opening balance updated successfully");
      } else {
        await createLedger(payload).unwrap();
        toast.success("Initial opening balance set successfully");
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch {
      // Global error toast handles it
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-card border border-border rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-border flex items-center justify-between gap-2 bg-primary/10 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md shrink-0">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold text-foreground truncate">
                {isEdit ? "Edit Opening Balance" : "Set Opening Balance"}
              </h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                Starting capital & initial cash for ledger
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 sm:p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
            title="Close modal"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-5 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
          <InputField
            label="Ledger Date"
            type="date"
            required
            disabled={isEdit}
            value={ledgerDate}
            onChange={(e) => setLedgerDate(e.target.value)}
            icon={Calendar}
            helperText={
              isEdit
                ? "Ledger date cannot be changed after creation."
                : undefined
            }
          />

          <InputField
            label="Opening Balance (Rs)"
            type="number"
            step="0.01"
            min="0.00"
            required
            placeholder="0.00"
            value={openingBalance}
            onChange={(e) => setOpeningBalance(e.target.value)}
            prefix="Rs"
            helperText="Initial starting capital / cash on hand for the ledger."
          />

          <SelectField
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={statusChoices}
          />

          <TextareaField
            label="Operational Notes / Remarks"
            rows={3}
            placeholder="e.g. Initial capital notes, cash counter handover info..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {/* Footer */}
          <div className="pt-3 sm:pt-4 border-t border-border flex items-center justify-end gap-2 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl border border-border text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex-1 sm:flex-initial"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 sm:px-5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 shadow-md transition-all flex items-center justify-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Set Balance"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
