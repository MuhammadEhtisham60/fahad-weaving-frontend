import React, { useState, useEffect } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Wallet,
  MoreVertical,
  Download,
  FileText,
} from "lucide-react";
import { Button, StatusBadge, Card, pkr, fmt } from "../../../components/ui-kit.jsx";
import { toast } from "sonner";
import { useRecalculateDailyLedgerMutation } from "../../../store/index.js";
import {
  exportDailySheetCsv,
  downloadDailySheetPdf,
  printDailySheet,
} from "../utils/ledgerExport.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

export const formatTransactionTime = (tx) => {
  if (tx?.created_at) {
    try {
      const d = new Date(tx.created_at);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }
    } catch {
      // fallback
    }
  }
  return tx?.transaction_time || "—";
};

export function DailySheetView({
  selectedDate,
  onDateChange,
  ledgerData,
  isLoading,
  onOpenRecordIncoming,
  onOpenRecordOutgoing,
  onOpenEditLedger,
  onViewTransaction,
  onEditTransaction,
  onDeleteTransaction,
}) {
  const [recalculateLedger, { isLoading: isRecalculating }] =
    useRecalculateDailyLedgerMutation();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const rawLedger = ledgerData?.ledger || ledgerData;
  const ledgerId = ledgerData?.ledger_id || rawLedger?.id;
  const ledger = rawLedger
    ? {
      id: ledgerId,
      ledger_date:
        ledgerData?.ledger_date || rawLedger?.ledger_date || selectedDate,
      opening_balance:
        ledgerData?.opening_balance ?? rawLedger?.opening_balance ?? "0.00",
      total_incoming:
        ledgerData?.total_incoming ?? rawLedger?.total_incoming ?? "0.00",
      total_outgoing:
        ledgerData?.total_outgoing ?? rawLedger?.total_outgoing ?? "0.00",
      closing_balance:
        ledgerData?.closing_balance ?? rawLedger?.closing_balance ?? "0.00",
      status: ledgerData?.status || rawLedger?.status || "Open",
      notes: ledgerData?.notes || rawLedger?.notes || "",
    }
    : null;

  const transactions = ledgerData?.transactions || rawLedger?.transactions || [];
  const openingBalance = parseFloat(ledger?.opening_balance ?? 0);
  const totalIncoming = parseFloat(ledger?.total_incoming ?? 0);
  const totalOutgoing = parseFloat(ledger?.total_outgoing ?? 0);
  const closingBalance = parseFloat(
    ledger?.closing_balance ?? (openingBalance + totalIncoming - totalOutgoing)
  );

  // Reset to page 1 whenever selected date changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate]);

  const totalPages = Math.ceil(transactions.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, transactions.length);
  const paginatedTransactions = transactions.slice(startIndex, endIndex);

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split("T")[0]);
  };

  const handleToday = () => {
    onDateChange(new Date().toISOString().split("T")[0]);
  };

  const handleRecalculate = async () => {
    if (!ledger?.id) {
      toast.info("No saved ledger on this date yet to recalculate.");
      return;
    }
    try {
      await recalculateLedger(ledger.id).unwrap();
      toast.success("Ledger balances recalculated successfully!");
    } catch {
      // Global toast handler handles errors
    }
  };

  const handleExportCsv = () => {
    if (transactions.length === 0) {
      toast.info("No transactions to export for this day.");
      return;
    }
    exportDailySheetCsv({
      date: selectedDate,
      summary: {
        openingBalance,
        totalIncoming,
        totalOutgoing,
        closingBalance,
      },
      transactions,
    });
    toast.success(`Exported Daily Cash CSV for ${selectedDate}`);
  };

  const handleDownloadPdf = () => {
    if (transactions.length === 0) {
      toast.info("No transactions to export for this day.");
      return;
    }
    downloadDailySheetPdf({
      date: selectedDate,
      summary: {
        openingBalance,
        totalIncoming,
        totalOutgoing,
        closingBalance,
      },
      transactions,
    });
    toast.success(`Downloaded Daily Cash PDF for ${selectedDate}`);
  };

  const handlePrint = () => {
    printDailySheet({
      date: selectedDate,
      summary: {
        openingBalance,
        totalIncoming,
        totalOutgoing,
        closingBalance,
      },
      transactions,
    });
  };

  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      {/* Date Switcher & Day Controls Bar */}
      <Card padded={false} className="p-2 sm:p-3 md:p-4 bg-card/80 backdrop-blur-sm border-border/80">
        <div className="flex items-center justify-between gap-1.5 sm:gap-4 flex-nowrap">
          {/* Left: Date Navigator */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0 min-w-0">
            <button
              onClick={handlePrevDay}
              className="p-1.5 sm:p-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors shrink-0"
              title="Previous Day"
            >
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>

            {/* Calendar Icon Trigger */}
            <label
              className="relative p-1.5 sm:p-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors shrink-0 flex items-center justify-center cursor-pointer"
              title="Click to select date"
            >
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
            </label>

            <button
              onClick={handleNextDay}
              className="p-1.5 sm:p-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors shrink-0"
              title="Next Day"
            >
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>

            {!isToday && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
                className="text-xs h-7 sm:h-8 px-2 sm:px-2.5 hidden md:inline-flex"
              >
                Today
              </Button>
            )}

            <label className="relative cursor-pointer select-none">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
              <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground hover:text-foreground px-0.5 sm:px-1.5 truncate inline-block transition-colors">
                {new Date(selectedDate).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </label>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={transactions.length === 0}
              title="Download Daily Cash Sheet as PDF"
              className="text-xs py-1.5 px-2 sm:px-2.5 h-7 sm:h-8"
            >
              <FileText className="h-3.5 w-3.5 text-rose-600" />{" "}
              <span className="hidden min-[380px]:inline">PDF</span>
            </Button>
            <Button
              variant="success"
              size="sm"
              onClick={onOpenRecordIncoming}
              title="Record Income (+)"
              className="text-xs py-1.5 px-2 sm:px-3 justify-center font-semibold h-7 sm:h-8"
            >
              <ArrowDownLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline truncate">+ Income</span>
              <span className="sm:hidden font-black text-sm leading-none">+</span>
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={onOpenRecordOutgoing}
              title="Record Expense (-)"
              className="text-xs py-1.5 px-2 sm:px-3 justify-center font-semibold h-7 sm:h-8"
            >
              <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline truncate">- Expense</span>
              <span className="sm:hidden font-black text-sm leading-none">-</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Opening Balance & Status Header Banner */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Day Status
            </div>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={ledger?.status || "Open"} />
              {ledger?.notes && (
                <span className="text-xs text-muted-foreground truncate max-w-[150px]" title={ledger.notes}>
                  • {ledger.notes}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Opening Balance
            </div>
            <div className="mt-1 text-xl font-bold text-foreground">
              {pkr(openingBalance)}
            </div>
          </div>
          <button
            onClick={() => onOpenEditLedger(ledger)}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
            title="Edit Opening Balance"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Day's Net Cash Movement
          </div>
          <div
            className={`mt-1 text-xl font-bold ${
              totalIncoming - totalOutgoing >= 0
                ? "text-success"
                : "text-destructive"
            }`}
          >
            {totalIncoming - totalOutgoing >= 0 ? "+" : ""}
            {pkr(totalIncoming - totalOutgoing)}
          </div>
        </div>

        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-primary font-bold uppercase tracking-wider">
            Closing Running Balance
          </div>
          <div className="mt-1 text-xl font-black text-foreground">
            {pkr(closingBalance)}
          </div>
        </div>
      </div> */}

      {/* Chronological Running Balance Cash Sheet Table */}
      <Card padded={false} className="overflow-hidden border-border shadow-card">
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            <span>Chronological Cash Flow Ledger</span>
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-normal">
              {transactions.length} entries
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-3 text-center w-12 hidden md:table-cell">#</th>
                <th className="py-3 px-3 hidden md:table-cell">Time</th>
                <th className="py-2.5 sm:py-3 px-2 sm:px-3">Type</th>
                <th className="py-3 px-3 hidden md:table-cell">Category</th>
                <th className="py-2.5 sm:py-3 px-2 sm:px-3">Person</th>
                <th className="py-3 px-3 hidden md:table-cell">Method</th>
                {/* <th className="py-3 px-3">Ref #</th> */}
                <th className="py-2.5 sm:py-3 px-2 sm:px-3 text-right">Income (+)</th>
                <th className="py-2.5 sm:py-3 px-2 sm:px-3 text-right">Expense (-)</th>
                <th className="py-2.5 sm:py-3 px-2 sm:px-3 text-right font-bold text-foreground">Running Bal</th>
                <th className="py-2.5 sm:py-3 px-2 sm:px-3 text-center w-12 md:w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-muted-foreground">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                      <span>Loading cash sheet entries...</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileSpreadsheet className="h-8 w-8 text-muted-foreground/50" />
                      <div className="font-semibold text-foreground">No Transactions Recorded Yet</div>
                      <div className="text-xs text-muted-foreground max-w-sm">
                        No income or expense entries logged for {selectedDate}. Use the buttons above to record today's cash movement.
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={onOpenRecordIncoming}
                        >
                          <ArrowDownLeft className="h-3.5 w-3.5" /> Add Income
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={onOpenRecordOutgoing}
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" /> Add Expense
                        </Button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx, idx) => {
                  const isIncoming =
                    tx.transaction_type === "INCOMING" ||
                    tx.transactionType === "INCOMING";
                  const amt = parseFloat(tx.amount || 0);
                  const running = tx.running_balance ?? tx.runningBalance;
                  const rowNumber = startIndex + idx + 1;

                  return (
                    <tr
                      key={tx.id || idx}
                      onClick={() => onViewTransaction(tx)}
                      className="hover:bg-muted/30 transition-colors group cursor-pointer"
                    >
                      <td className="py-3 px-3 text-center text-xs text-muted-foreground font-mono hidden md:table-cell">
                        {rowNumber}
                      </td>
                      <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap hidden md:table-cell">
                        {formatTransactionTime(tx)}
                      </td>
                      <td className="py-2.5 sm:py-3 px-2 sm:px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold ${isIncoming
                              ? "bg-success/15 text-success border border-success/30"
                              : "bg-warning/15 text-warning-foreground border border-warning/40"
                            }`}
                        >
                          {isIncoming ? (
                            <ArrowDownLeft className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          ) : (
                            <ArrowUpRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          )}
                          <span className="hidden sm:inline">{isIncoming ? "Income" : "Expense"}</span>
                          <span className="sm:hidden">{isIncoming ? "In" : "Out"}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-foreground whitespace-nowrap hidden md:table-cell">
                        {tx.category || "General"}
                      </td>
                      <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-foreground">
                        <div className="font-medium truncate max-w-[110px] sm:max-w-[180px] md:max-w-[220px]">
                          {tx.party_name || tx.partyName || "Counter"}
                        </div>
                        {tx.description && (
                          <div className="text-[11px] sm:text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-[200px] md:max-w-[260px]">
                            {tx.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap hidden md:table-cell">
                        {tx.payment_method || tx.paymentMethod || "Cash"}
                      </td>
                      {/* <td className="py-3 px-3 text-xs font-mono text-muted-foreground whitespace-nowrap">
                        {tx.reference_number || "—"}
                      </td> */}
                      <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-right font-semibold text-success whitespace-nowrap text-xs sm:text-sm">
                        {isIncoming ? `+${pkr(amt)}` : "—"}
                      </td>
                      <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-right font-semibold text-warning-foreground whitespace-nowrap text-xs sm:text-sm">
                        {!isIncoming ? `-${pkr(amt)}` : "—"}
                      </td>
                      <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-right font-black text-foreground whitespace-nowrap text-xs sm:text-sm">
                        {running !== undefined && running !== null
                          ? pkr(parseFloat(running))
                          : "—"}
                      </td>
                      <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        {/* Desktop inline actions */}
                        <div className="hidden md:flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onViewTransaction(tx)}
                            className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-muted"
                            title="View Voucher Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onEditTransaction(tx)}
                            className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-muted"
                            title="Edit Transaction"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(tx)}
                            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted"
                            title="Delete Transaction"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Mobile 3-dot dropdown menu */}
                        <div className="md:hidden flex items-center justify-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="p-1.5 rounded-lg border border-border bg-card/60 hover:bg-muted text-foreground hover:text-primary transition-colors focus:outline-none"
                                title="Options"
                              >
                                <MoreVertical className="h-3.5 w-3.5" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36 bg-popover z-50">
                              <DropdownMenuItem
                                onClick={() => onViewTransaction(tx)}
                                className="cursor-pointer gap-2 text-xs py-2"
                              >
                                <Eye className="h-3.5 w-3.5 text-primary" />
                                <span>View</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onEditTransaction(tx)}
                                className="cursor-pointer gap-2 text-xs py-2"
                              >
                                <Edit2 className="h-3.5 w-3.5 text-amber-500" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => onDeleteTransaction(tx)}
                                className="cursor-pointer gap-2 text-xs py-2 text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Table Footer Summary Row */}
            <tfoot className="bg-muted/60 border-t-2 border-border font-bold">
              <tr>
                <td colSpan={2} className="md:hidden py-3.5 px-2 text-right text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                  Total:
                </td>
                <td colSpan={6} className="hidden md:table-cell py-3.5 px-3 text-right text-xs uppercase tracking-wider text-muted-foreground">
                  Day Total Summary:
                </td>
                <td className="py-3.5 px-2 sm:px-3 text-right text-success font-black whitespace-nowrap">
                  +{pkr(totalIncoming)}
                </td>
                <td className="py-3.5 px-2 sm:px-3 text-right text-warning-foreground font-black whitespace-nowrap">
                  -{pkr(totalOutgoing)}
                </td>
                <td className="py-3.5 px-2 sm:px-3 text-right text-foreground font-black text-xs sm:text-base whitespace-nowrap">
                  {pkr(closingBalance)}
                </td>
                <td className="py-3.5 px-2 sm:px-3" />
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pagination Controls */}
        {transactions.length > 0 && (
          <div className="p-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-3 flex-wrap">
              <span>
                Showing <span className="font-semibold text-foreground">{startIndex + 1}</span> to{" "}
                <span className="font-semibold text-foreground">{endIndex}</span> of{" "}
                <span className="font-semibold text-foreground">{transactions.length}</span> entries (Page {currentPage} of {totalPages})
              </span>
              <div className="flex items-center gap-1.5 ml-1">
                <span className="text-[11px]">Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-card border border-border rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1 || isLoading}
                  className="h-8 px-2.5"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - currentPage) <= 1
                    )
                    .map((pageNumber, i, arr) => {
                      const prev = arr[i - 1];
                      const showEllipsis = prev && pageNumber - prev > 1;
                      return (
                        <React.Fragment key={pageNumber}>
                          {showEllipsis && (
                            <span className="px-1 text-muted-foreground">
                              ...
                            </span>
                          )}
                          <button
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all ${currentPage === pageNumber
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "border border-border bg-card text-foreground hover:bg-muted"
                              }`}
                          >
                            {pageNumber}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages || isLoading}
                  className="h-8 px-2.5"
                >
                  Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
