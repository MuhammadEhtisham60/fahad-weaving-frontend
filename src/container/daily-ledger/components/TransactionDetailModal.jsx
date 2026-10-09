import React from "react";
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Calendar,
  Clock,
  User,
  CreditCard,
  Tag,
  Hash,
  FileText,
  Building2,
} from "lucide-react";
import { Button, StatusBadge, pkr } from "../../../components/ui-kit.jsx";
import { formatTransactionTime } from "./DailySheetView.jsx";
import { downloadTransactionVoucherPdf } from "../utils/ledgerExport.js";

export function TransactionDetailModal({
  open,
  onClose,
  transaction,
  onEdit,
}) {
  if (!open || !transaction) return null;

  const isIncoming = transaction.transaction_type === "INCOMING" || transaction.transactionType === "INCOMING";
  const amount = parseFloat(transaction.amount || 0);
  const runningBal = transaction.running_balance ?? transaction.runningBalance;

  const handleDownload = () => {
    downloadTransactionVoucherPdf(transaction);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-card border border-border rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh]">
        {/* Header Banner */}
        <div
          className={`p-3.5 sm:p-5 border-b border-border flex items-center justify-between gap-2 shrink-0 ${
            isIncoming
              ? "bg-success/10"
              : "bg-warning/10"
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div
              className={`h-9 w-9 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm shrink-0 ${
                isIncoming
                  ? "bg-success text-white"
                  : "bg-warning text-warning-foreground"
              }`}
            >
              {isIncoming ? (
                <ArrowDownLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <ArrowUpRight className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span
                  className={`text-[10px] sm:text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    isIncoming
                      ? "bg-success/20 text-success"
                      : "bg-warning/20 text-warning-foreground"
                  }`}
                >
                  {isIncoming ? "Income Receipt" : "Expense Receipt"}
                </span>
                <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
                  #{transaction.id || "TRX"}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-foreground mt-0.5 sm:mt-1 truncate">
                {isIncoming ? "+" : "-"}{pkr(amount)}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 sm:p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
            title="Close"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Voucher Body Details */}
        <div className="p-3.5 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
            <div className="bg-muted/40 p-2.5 sm:p-3 rounded-xl border border-border/50">
              <div className="text-[11px] sm:text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                <Calendar className="h-3.5 w-3.5" /> Date & Time
              </div>
              <div className="text-xs sm:text-sm font-semibold text-foreground mt-1">
                {transaction.transaction_date || transaction.transactionDate || "—"}{" "}
                {formatTransactionTime(transaction) !== "—" ? `• ${formatTransactionTime(transaction)}` : ""}
              </div>
            </div>

            <div className="bg-muted/40 p-2.5 sm:p-3 rounded-xl border border-border/50">
              <div className="text-[11px] sm:text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                <Tag className="h-3.5 w-3.5" /> Category
              </div>
              <div className="text-xs sm:text-sm font-semibold text-foreground mt-1">
                {transaction.category || "General"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
            <div className="bg-muted/40 p-2.5 sm:p-3 rounded-xl border border-border/50">
              <div className="text-[11px] sm:text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                <User className="h-3.5 w-3.5" /> Party / Counterpart
              </div>
              <div className="text-xs sm:text-sm font-semibold text-foreground mt-1 truncate">
                {transaction.party_name || transaction.partyName || "Counter / Cash"}
              </div>
            </div>

            <div className="bg-muted/40 p-2.5 sm:p-3 rounded-xl border border-border/50">
              <div className="text-[11px] sm:text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                <CreditCard className="h-3.5 w-3.5" /> Payment Method
              </div>
              <div className="text-xs sm:text-sm font-semibold text-foreground mt-1">
                {transaction.payment_method || transaction.paymentMethod || "Cash"}
              </div>
            </div>
          </div>

          {transaction.reference_number && (
            <div className="bg-muted/40 p-2.5 sm:p-3 rounded-xl border border-border/50">
              <div className="text-[11px] sm:text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                <Hash className="h-3.5 w-3.5" /> Reference / Invoice / Cheque #
              </div>
              <div className="text-xs sm:text-sm font-semibold text-foreground mt-1 font-mono">
                {transaction.reference_number}
              </div>
            </div>
          )}

          {transaction.description && (
            <div className="bg-muted/40 p-2.5 sm:p-3 rounded-xl border border-border/50">
              <div className="text-[11px] sm:text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                <FileText className="h-3.5 w-3.5" /> Description / Particulars
              </div>
              <div className="text-xs sm:text-sm text-foreground mt-1 leading-relaxed">
                {transaction.description}
              </div>
            </div>
          )}

          {transaction.notes && (
            <div className="bg-muted/40 p-2.5 sm:p-3 rounded-xl border border-border/50">
              <div className="text-[11px] sm:text-xs text-muted-foreground font-medium">Internal Notes</div>
              <div className="text-xs text-muted-foreground mt-1 italic">
                {transaction.notes}
              </div>
            </div>
          )}

          {runningBal !== undefined && runningBal !== null && (
            <div className="p-3 sm:p-3.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between gap-2">
              <div className="text-[11px] sm:text-xs font-semibold text-primary">
                Running Balance After Transaction:
              </div>
              <div className="text-sm sm:text-base font-black text-foreground">
                {pkr(parseFloat(runningBal))}
              </div>
            </div>
          )}

          <div className="text-[10px] sm:text-[11px] text-muted-foreground text-right">
            Created by: {transaction.created_by_name || "System"} •{" "}
            {transaction.created_at ? new Date(transaction.created_at).toLocaleString() : ""}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 border-t border-border bg-muted/20 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="text-xs py-1.5 px-3 flex-1 sm:flex-initial"
            title="Download Voucher PDF directly"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" /> Download
          </Button>
          <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs py-1.5 px-3 flex-1 sm:flex-initial"
                onClick={() => {
                  onClose();
                  onEdit(transaction);
                }}
              >
                Edit
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={onClose} className="text-xs py-1.5 px-4 flex-1 sm:flex-initial">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
