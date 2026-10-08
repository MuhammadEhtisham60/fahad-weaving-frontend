import React, { useState } from "react";
import {
  Calendar,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Eye,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { Button, StatusBadge, Card, pkr, fmt } from "../../../components/ui-kit.jsx";
import { toast } from "sonner";
import { useRecalculateDailyLedgerMutation } from "../../../store/index.js";

export function LedgerArchiveTable({
  ledgers = [],
  count = 0,
  totalPages = 1,
  currentPage = 1,
  pageSize = 10,
  isLoading,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onPageChange,
  onSelectDateToView,
  onOpenCreateLedger,
  onOpenEditLedger,
  onDeleteLedger,
}) {
  const [recalculateLedger, { isLoading: isRecalculating }] =
    useRecalculateDailyLedgerMutation();

  const handleRecalculate = async (id) => {
    try {
      await recalculateLedger(id).unwrap();
      toast.success("Ledger recalculated successfully!");
    } catch {
      // Global error toast handles it
    }
  };

  return (
    <Card padded={false} className="border-border shadow-card overflow-hidden">
      {/* Table Filter Controls */}
      <div className="p-4 border-b border-border bg-card/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Search & Status Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search notes, status..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-56"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
            <option value="Reconciled">Reconciled</option>
            <option value="Draft">Draft</option>
          </select>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>From:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="px-2 py-1.5 bg-muted/50 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span>To:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="px-2 py-1.5 bg-muted/50 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={onOpenCreateLedger}>
            <Plus className="h-4 w-4" /> Open New Daily Ledger
          </Button>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs md:text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase text-[11px] tracking-wider">
              <th className="py-3 px-4">Ledger Date</th>
              <th className="py-3 px-4 text-right">Opening Balance</th>
              <th className="py-3 px-4 text-right">Total Incoming</th>
              <th className="py-3 px-4 text-right">Total Outgoing</th>
              <th className="py-3 px-4 text-right">Closing Balance</th>
              <th className="py-3 px-4 text-right">Net Flow</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4">Notes</th>
              <th className="py-3 px-4 text-center w-36">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-muted-foreground">
                  <div className="inline-flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                    <span>Loading ledger archives...</span>
                  </div>
                </td>
              </tr>
            ) : ledgers.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                    <div className="font-semibold text-foreground">No Daily Ledgers Found</div>
                    <div className="text-xs text-muted-foreground">
                      No ledgers matched your filter criteria or none have been initialized yet.
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              ledgers.map((l) => {
                const opBal = parseFloat(l.opening_balance ?? 0);
                const inc = parseFloat(l.total_incoming ?? 0);
                const out = parseFloat(l.total_outgoing ?? 0);
                const closeBal = parseFloat(l.closing_balance ?? (opBal + inc - out));
                const net = parseFloat(l.net_cash_flow ?? (inc - out));

                return (
                  <tr
                    key={l.id}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-semibold text-foreground whitespace-nowrap">
                      <div>
                        {l.ledger_date}
                      </div>
                      <div className="text-[11px] font-normal text-muted-foreground">
                        {new Date(l.ledger_date).toLocaleDateString(undefined, {
                          weekday: "short",
                        })}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-foreground whitespace-nowrap">
                      {pkr(opBal)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-success whitespace-nowrap">
                      +{pkr(inc)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-warning-foreground whitespace-nowrap">
                      -{pkr(out)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-foreground whitespace-nowrap">
                      {pkr(closeBal)}
                    </td>
                    <td
                      className={`py-3.5 px-4 text-right font-bold whitespace-nowrap ${
                        net >= 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {net >= 0 ? "+" : ""}
                      {pkr(net)}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <StatusBadge status={l.status || "Open"} />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground max-w-[180px] truncate">
                      {l.notes || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onSelectDateToView(l.ledger_date)}
                          className="h-7 px-2 text-xs"
                          title="Open Daily Cash Sheet"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" /> View Sheet
                        </Button>
                        <button
                          onClick={() => handleRecalculate(l.id)}
                          className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-muted"
                          title="Recalculate Balances"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenEditLedger(l)}
                          className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-muted"
                          title="Edit Ledger"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteLedger(l)}
                          className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-muted"
                          title="Delete Ledger"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
        <div>
          Showing {ledgers.length} of {count} daily ledger records (Page {currentPage} of {totalPages || 1})
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
