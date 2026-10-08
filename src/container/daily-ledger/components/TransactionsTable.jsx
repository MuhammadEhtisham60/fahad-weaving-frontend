import React from "react";
import {
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowUpDown,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Receipt,
  Download,
  FileText,
  Printer,
  FileSpreadsheet,
} from "lucide-react";
import { Button, Card, pkr, fmt } from "../../../components/ui-kit.jsx";
import { SelectField } from "../../../common/sharefield/SelectField.jsx";

export function TransactionsTable({
  transactions = [],
  count = 0,
  totalPages = 1,
  currentPage = 1,
  pageSize = 20,
  isLoading,
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  paymentMethodFilter,
  onPaymentMethodFilterChange,
  ordering = "-transaction_date",
  onOrderingChange,
  onPageChange,
  choices,
  onViewTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onExportCsv,
  onExportPdf,
  onPrint,
  isExporting = false,
}) {
  const allCategories = choices?.allCategories || [];
  const paymentMethods = choices?.paymentMethods || [
    { value: "Cash", label: "Cash" },
    { value: "Bank Transfer", label: "Bank Transfer" },
    { value: "Cheque", label: "Cheque" },
    { value: "Online / UPI", label: "Online / UPI" },
    { value: "Other", label: "Other" },
  ];

  return (
    <Card padded={false} className="border-border shadow-card overflow-hidden">
      {/* Search & Filters */}
      <div className="p-3 sm:p-4 border-b border-border bg-card/60 space-y-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="relative w-full sm:flex-1 min-w-[180px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by party, reference, particulars..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full"
            />
          </div>

          <div className="w-full sm:w-36 md:w-44">
            <SelectField
              name="typeFilter"
              size="sm"
              searchable={false}
              value={typeFilter}
              onChange={(e) => onTypeFilterChange(e.target.value)}
              placeholder="All Types"
              options={[
                { value: "", label: "All Types (Income & Expense)" },
                { value: "INCOMING", label: "Income Only (+)" },
                { value: "OUTGOING", label: "Expense Only (-)" },
              ]}
            />
          </div>

          <div className="w-full sm:w-36 md:w-44">
            <SelectField
              name="categoryFilter"
              size="sm"
              searchable={true}
              value={categoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              placeholder="All Categories"
              options={[
                { value: "", label: "All Categories" },
                ...allCategories.map((c) => ({ value: c, label: c })),
              ]}
            />
          </div>

          <div className="w-full sm:w-36 md:w-44">
            <SelectField
              name="paymentMethodFilter"
              size="sm"
              searchable={false}
              value={paymentMethodFilter}
              onChange={(e) => onPaymentMethodFilterChange(e.target.value)}
              placeholder="All Payment Methods"
              options={[
                { value: "", label: "All Payment Methods" },
                ...paymentMethods.map((m) => ({
                  value: m.value || m,
                  label: m.label || m,
                })),
              ]}
            />
          </div>

          <div className="w-full sm:w-44 md:w-52">
            <SelectField
              name="orderingFilter"
              size="sm"
              searchable={false}
              value={ordering}
              onChange={(e) => onOrderingChange && onOrderingChange(e.target.value)}
              options={[
                { value: "-transaction_date", label: "Newest First (Desc)" },
                { value: "transaction_date", label: "Oldest First (Asc / Reverse)" },
                { value: "-amount", label: "Amount: High to Low" },
                { value: "amount", label: "Amount: Low to High" },
              ]}
            />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto sm:ml-auto flex-wrap sm:flex-nowrap">
            {onExportCsv && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExportCsv}
                disabled={isExporting || count === 0}
                title="Download All Filtered Transactions as CSV"
                className="text-xs py-1.5 px-2.5 flex-1 sm:flex-initial"
              >
                <Download className="h-3.5 w-3.5 text-emerald-600" />
                <span>CSV</span>
              </Button>
            )}
            {onExportPdf && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExportPdf}
                disabled={isExporting || count === 0}
                title="Download Filtered Transactions Report as PDF"
                className="text-xs py-1.5 px-2.5 flex-1 sm:flex-initial"
              >
                <FileText className="h-3.5 w-3.5 text-rose-600" />
                <span>PDF</span>
              </Button>
            )}
            {onPrint && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPrint}
                disabled={isExporting || count === 0}
                title="Print Filtered Transactions Report"
                className="text-xs py-1.5 px-2.5 flex-1 sm:flex-initial"
              >
                <Printer className="h-3.5 w-3.5 text-primary" />
                <span>Print</span>
              </Button>
            )}
          </div>

          {(search || typeFilter || categoryFilter || paymentMethodFilter || ordering !== "-transaction_date") && (
            <button
              onClick={() => {
                onSearchChange("");
                onTypeFilterChange("");
                onCategoryFilterChange("");
                onPaymentMethodFilterChange("");
                if (onOrderingChange) onOrderingChange("-transaction_date");
              }}
              className="text-xs text-primary font-semibold underline hover:opacity-80 py-2 px-1 cursor-pointer transition-opacity"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs md:text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase text-[11px] tracking-wider">
              <th className="py-3 px-3 w-12 text-center">#</th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-foreground transition-colors select-none"
                onClick={() =>
                  onOrderingChange &&
                  onOrderingChange(
                    ordering === "-transaction_date"
                      ? "transaction_date"
                      : "-transaction_date"
                  )
                }
                title="Click to toggle Newest / Reverse order"
              >
                <div className="flex items-center gap-1.5">
                  <span>Date / Time</span>
                  <ArrowUpDown className="h-3.5 w-3.5 opacity-60 hover:opacity-100 text-primary" />
                </div>
              </th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Party Name</th>
              <th className="py-3 px-3">Method</th>
              {/* <th className="py-3 px-3">Ref #</th> */}
              {/* <th className="py-3 px-3">Description</th> */}
              <th
                className="py-3 px-3 text-right cursor-pointer hover:text-foreground transition-colors select-none"
                onClick={() =>
                  onOrderingChange &&
                  onOrderingChange(ordering === "-amount" ? "amount" : "-amount")
                }
                title="Click to toggle Amount sort"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Amount</span>
                  <ArrowUpDown className="h-3.5 w-3.5 opacity-60 hover:opacity-100 text-primary" />
                </div>
              </th>
              <th className="py-3 px-3 text-right">Running Balance</th>
              <th className="py-3 px-3 text-center w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-muted-foreground">
                  <div className="inline-flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                    <span>Loading transactions...</span>
                  </div>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Receipt className="h-8 w-8 text-muted-foreground/50" />
                    <div className="font-semibold text-foreground">No Transactions Found</div>
                    <div className="text-xs text-muted-foreground">
                      Try adjusting your search criteria or date filter.
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((tx, idx) => {
                const isIncoming =
                  tx.transaction_type === "INCOMING" ||
                  tx.transactionType === "INCOMING";
                const amt = parseFloat(tx.amount || 0);
                const running = tx.running_balance ?? tx.runningBalance;

                return (
                  <tr
                    key={tx.id || idx}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    <td className="py-3 px-3 text-center text-xs text-muted-foreground font-mono">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>
                    <td className="py-3 px-3 text-xs text-foreground whitespace-nowrap">
                      <div className="font-semibold">
                        {tx.transaction_date || tx.transactionDate}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {tx.transaction_time || "—"}
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          isIncoming
                            ? "bg-success/15 text-success border border-success/30"
                            : "bg-warning/15 text-warning-foreground border border-warning/40"
                        }`}
                      >
                        {isIncoming ? (
                          <ArrowDownLeft className="h-3 w-3" />
                        ) : (
                          <ArrowUpRight className="h-3 w-3" />
                        )}
                        {isIncoming ? "Income" : "Expense"}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-foreground whitespace-nowrap">
                      {tx.category || "General"}
                    </td>
                    <td className="py-3 px-3 font-medium text-foreground whitespace-nowrap max-w-[160px] truncate">
                      {tx.party_name || tx.partyName || "Counter"}
                    </td>
                    <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap">
                      {tx.payment_method || tx.paymentMethod || "Cash"}
                    </td>
                    {/* <td className="py-3 px-3 text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {tx.reference_number || "—"}
                    </td> */}
                    {/* <td className="py-3 px-3 text-xs text-muted-foreground max-w-[200px] truncate">
                      {tx.description || "—"}
                    </td> */}
                    <td
                      className={`py-3 px-3 text-right font-black whitespace-nowrap ${
                        isIncoming ? "text-success" : "text-warning-foreground"
                      }`}
                    >
                      {isIncoming ? "+" : "-"}
                      {pkr(amt)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-foreground whitespace-nowrap">
                      {running !== undefined && running !== null
                        ? pkr(parseFloat(running))
                        : "—"}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onViewTransaction(tx)}
                          className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-muted"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onEditTransaction(tx)}
                          className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-muted"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(tx)}
                          className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted"
                          title="Delete"
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

      {/* Pagination */}
      <div className="p-3 sm:p-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="text-center sm:text-left">
          Showing {transactions.length} of {count} transactions (Page {currentPage} of {totalPages || 1})
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            className="text-xs h-8 px-2.5"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
            className="text-xs h-8 px-2.5"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
