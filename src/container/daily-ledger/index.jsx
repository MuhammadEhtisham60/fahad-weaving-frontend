import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  FileSpreadsheet,
  Receipt,
  BarChart3,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Calendar,
  CalendarRange,
  Edit2,
} from "lucide-react";
import { PageHeader, Button } from "../../components/ui-kit.jsx";
import { SelectField } from "../../common/sharefield/SelectField.jsx";
import { useTranslation } from "../../context/LanguageContext.jsx";
import { toast } from "sonner";

import {
  useGetDailyLedgerSummaryQuery,
  useGetDailyLedgerSheetViewQuery,
  useGetLedgerTransactionsQuery,
  useLazyGetLedgerTransactionsQuery,
  useGetDailyLedgerChoicesQuery,
  useDeleteDailyLedgerMutation,
  useDeleteLedgerTransactionMutation,
} from "../../store/index.js";

import {
  exportAllTransactionsCsv,
  downloadAllTransactionsPdf,
  printAllTransactions,
} from "./utils/ledgerExport.js";
import { DailyLedgerStats } from "./components/DailyLedgerStats.jsx";
import { DailySheetView } from "./components/DailySheetView.jsx";
import { TransactionsTable } from "./components/TransactionsTable.jsx";
import { LedgerAnalytics } from "./components/LedgerAnalytics.jsx";
import { DailyLedgerModal } from "./components/DailyLedgerModal.jsx";
import { RecordTransactionModal } from "./components/RecordTransactionModal.jsx";
import { TransactionDetailModal } from "./components/TransactionDetailModal.jsx";
import { DeleteLedgerConfirmModal } from "./components/DeleteLedgerConfirmModal.jsx";
import { CustomDateRangeModal } from "./components/CustomDateRangeModal.jsx";

export const Route = createFileRoute("/daily-ledger/")({
  component: DailyLedgerPage,
});

function DailyLedgerPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("sheet"); // "sheet" | "transactions" | "analytics"

  // Date selection state for Daily Sheet View
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().split("T")[0]
  );

  // Summary / Analytics Date Range Filter State
  const [summaryPreset, setSummaryPreset] = useState("this_month");
  const [summaryDateFrom, setSummaryDateFrom] = useState("2026-01-01");
  const [summaryDateTo, setSummaryDateTo] = useState(() =>
    new Date().toISOString().split("T")[0]
  );
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] = useState(false);

  // Transactions Table Filter & Pagination State
  const [txPage, setTxPage] = useState(1);
  const [txSearch, setTxSearch] = useState("");
  const [txTypeFilter, setTxTypeFilter] = useState("");
  const [txCategoryFilter, setTxCategoryFilter] = useState("");
  const [txPaymentMethodFilter, setTxPaymentMethodFilter] = useState("");
  const [txOrdering, setTxOrdering] = useState("-transaction_date");

  // Modal States
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [editingLedger, setEditingLedger] = useState(null);

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordType, setRecordType] = useState("INCOMING");
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingTransaction, setViewingTransaction] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState("transaction"); // "ledger" | "transaction"

  // ─── API Queries ──────────────────────────────────────────
  const { data: choicesData } = useGetDailyLedgerChoicesQuery();

  // Summary Query (for stats & analytics)
  const summaryParams =
    summaryPreset === "custom"
      ? { date_from: summaryDateFrom, date_to: summaryDateTo }
      : summaryPreset === "all_time"
      ? {}
      : { preset: summaryPreset };
  const { data: summaryData, isLoading: isSummaryLoading, refetch: refetchSummary } =
    useGetDailyLedgerSummaryQuery(summaryParams);

  // Daily Sheet View Query
  const {
    data: sheetData,
    isLoading: isSheetLoading,
    refetch: refetchSheet,
  } = useGetDailyLedgerSheetViewQuery({ date: selectedDate });

  // Transactions Query (synchronized with Timeline preset / dates and ordering)
  const transactionsQueryParams = {
    page: txPage,
    page_size: 20,
    search: txSearch,
    transaction_type: txTypeFilter,
    category: txCategoryFilter,
    payment_method: txPaymentMethodFilter,
    ordering: txOrdering,
    ...(summaryPreset === "custom"
      ? { date_from: summaryDateFrom, date_to: summaryDateTo }
      : summaryPreset === "all_time"
      ? {}
      : { preset: summaryPreset }),
  };

  const {
    data: transactionsData,
    isLoading: isTransactionsLoading,
    refetch: refetchTransactions,
  } = useGetLedgerTransactionsQuery(transactionsQueryParams);

  const [triggerGetTransactions] = useLazyGetLedgerTransactionsQuery();
  const [isExportingAll, setIsExportingAll] = useState(false);

  // Helper to format friendly timeline label
  const getTimelineLabel = () => {
    switch (summaryPreset) {
      case "today":
        return "Today";
      case "yesterday":
        return "Yesterday";
      case "this_week":
        return "This Week";
      case "last_week":
        return "Last Week";
      case "this_month":
        return "This Month";
      case "last_month":
        return "Last Month";
      case "this_year":
        return "This Year";
      case "last_year":
        return "Last Year";
      case "all_time":
        return "All Time";
      case "custom":
        return `${summaryDateFrom || ""} to ${summaryDateTo || ""}`;
      default:
        return summaryPreset;
    }
  };

  const fetchAllMatchingTransactions = async () => {
    setIsExportingAll(true);
    try {
      if (
        transactionsData?.results &&
        transactionsData?.count <= transactionsData?.results.length
      ) {
        return transactionsData.results;
      }
      const fullParams = {
        ...transactionsQueryParams,
        no_page: true,
        page: undefined,
        page_size: undefined,
      };
      const res = await triggerGetTransactions(fullParams).unwrap();
      return res?.results || res || [];
    } catch (err) {
      toast.error("Failed to retrieve full transaction dataset for export.");
      return transactionsData?.results || [];
    } finally {
      setIsExportingAll(false);
    }
  };

  const handleExportAllTransactionsCsv = async () => {
    const list = await fetchAllMatchingTransactions();
    if (!list || list.length === 0) {
      toast.info("No transactions found to export.");
      return;
    }
    exportAllTransactionsCsv({
      timelineLabel: getTimelineLabel(),
      summary: summaryData || {},
      transactions: list,
    });
    toast.success(`Exported ${list.length} transactions to CSV`);
  };

  const handleDownloadAllTransactionsPdf = async () => {
    const list = await fetchAllMatchingTransactions();
    if (!list || list.length === 0) {
      toast.info("No transactions found to export.");
      return;
    }
    downloadAllTransactionsPdf({
      timelineLabel: getTimelineLabel(),
      summary: summaryData || {},
      transactions: list,
    });
    toast.success(`Downloaded ${list.length} transactions PDF`);
  };

  const handlePrintAllTransactions = async () => {
    const list = await fetchAllMatchingTransactions();
    if (!list || list.length === 0) {
      toast.info("No transactions found to print.");
      return;
    }
    printAllTransactions({
      timelineLabel: getTimelineLabel(),
      summary: summaryData || {},
      transactions: list,
    });
  };

  // Mutations
  const [deleteLedger, { isLoading: isDeletingLedger }] =
    useDeleteDailyLedgerMutation();
  const [deleteTransaction, { isLoading: isDeletingTx }] =
    useDeleteLedgerTransactionMutation();

  // Handlers
  const handleOpenRecordIncoming = () => {
    setRecordType("INCOMING");
    setEditingTransaction(null);
    setIsRecordModalOpen(true);
  };

  const handleOpenRecordOutgoing = () => {
    setRecordType("OUTGOING");
    setEditingTransaction(null);
    setIsRecordModalOpen(true);
  };

  const handleOpenEditOpeningBalance = (ledgerObj) => {
    const rawLedger = ledgerObj || sheetData?.ledger || sheetData;
    setEditingLedger(
      rawLedger
        ? {
            id: rawLedger.id || rawLedger.ledger_id,
            ledger_date: rawLedger.ledger_date || selectedDate,
            opening_balance: rawLedger.opening_balance ?? "0.00",
            status: rawLedger.status || "Open",
            notes: rawLedger.notes || "",
          }
        : {
            ledger_date: selectedDate,
            opening_balance: "0.00",
            status: "Open",
            notes: "",
          }
    );
    setIsLedgerModalOpen(true);
  };

  const handleViewTransaction = (tx) => {
    setViewingTransaction(tx);
    setIsDetailModalOpen(true);
  };

  const handleEditTransaction = (tx) => {
    setEditingTransaction(tx);
    setRecordType(tx.transaction_type || tx.transactionType || "INCOMING");
    setIsRecordModalOpen(true);
  };

  const handleDeleteTransactionPrompt = (tx) => {
    setDeleteTarget(tx);
    setDeleteType("transaction");
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteType === "transaction") {
        await deleteTransaction(deleteTarget.id).unwrap();
        toast.success("Transaction deleted successfully");
      } else {
        await deleteLedger(deleteTarget.id).unwrap();
        toast.success("Daily Ledger deleted successfully");
      }
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
      refetchSheet();
      refetchSummary();
      refetchTransactions();
    } catch {
      // Handled by global toast
    }
  };

  const handleTimelinePresetChange = (value) => {
    if (value === "custom") {
      setIsCustomDateModalOpen(true);
    } else {
      setSummaryPreset(value || "this_month");
      setTxPage(1);
    }
  };

  const handleApplyCustomDateRange = (from, to) => {
    setSummaryDateFrom(from);
    setSummaryDateTo(to);
    setSummaryPreset("custom");
    setTxPage(1);
  };

  const tabs = [
    {
      id: "sheet",
      label: t("dailyLedger.dailySheet", "Cash Flow Ledger"),
      icon: FileSpreadsheet,
    },
    {
      id: "transactions",
      label: t("dailyLedger.allTransactions", "All Transactions"),
      icon: Receipt,
      badge: transactionsData?.count,
    },
    {
      id: "analytics",
      label: t("dailyLedger.financialAnalytics", "Financial Analytics"),
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header with Quick Actions */}
      <PageHeader
        title={t("dailyLedger.title", "Operational Daily Ledger")}
        subtitle={t(
          "dailyLedger.subtitle",
          "Real-time cash-flow tracking, running ledger balances, and expense management"
        )}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenEditOpeningBalance(null)}
            >
              <Wallet className="h-4 w-4 text-primary" />{" "}
              {t("dailyLedger.setOpeningBalance", "Set Opening Balance")}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenRecordIncoming}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
            >
              <ArrowDownLeft className="h-4 w-4" />{" "}
              {t("dailyLedger.recordIncoming", "+ Record Income")}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenRecordOutgoing}
              className="bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20"
            >
              <ArrowUpRight className="h-4 w-4" />{" "}
              {t("dailyLedger.recordOutgoing", "- Record Expense")}
            </Button>
          </div>
        }
      />

      {/* Financial KPIs Header Bar */}
      <DailyLedgerStats
        summary={summaryData}
        dateLabel={
          summaryPreset === "today"
            ? "Today"
            : summaryPreset === "yesterday"
            ? "Yesterday"
            : summaryPreset === "this_week"
            ? "This Week"
            : summaryPreset === "last_week"
            ? "Last Week"
            : summaryPreset === "this_month"
            ? "This Month"
            : summaryPreset === "last_month"
            ? "Last Month"
            : summaryPreset === "this_year"
            ? "This Year"
            : summaryPreset === "last_year"
            ? "Last Year"
            : summaryPreset === "all_time"
            ? "All Time"
            : summaryPreset === "custom"
            ? `${summaryDateFrom || ""} to ${summaryDateTo || ""}`
            : ""
        }
      />

      {/* Navigation Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge !== null && (
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Global Preset Filter for Analytics/Summary */}
        <div className="flex items-center gap-2 flex-wrap">
          {summaryPreset === "custom" && summaryDateFrom && summaryDateTo && (
            <button
              type="button"
              onClick={() => setIsCustomDateModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold border border-primary/25 transition-all shadow-sm cursor-pointer"
              title="Click to edit custom date range"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {summaryDateFrom} – {summaryDateTo}
              </span>
              <Edit2 className="h-3 w-3 opacity-70" />
            </button>
          )}

          <div className="flex items-center gap-3 pl-3 pr-1 py-1 rounded-2xl bg-card border border-border shadow-sm">
            <div className="flex items-center gap-2 shrink-0">
              <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <CalendarRange className="h-4 w-4" />
              </div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">
                Timeline
              </span>
            </div>
            <div className="w-44">
              <SelectField
                name="summaryPreset"
                size="sm"
                searchable={false}
                value={summaryPreset}
                onChange={(e) => handleTimelinePresetChange(e.target.value)}
                options={[
                  { value: "today", label: "Today" },
                  { value: "yesterday", label: "Yesterday" },
                  { value: "this_week", label: "This Week" },
                  { value: "last_week", label: "Last Week" },
                  { value: "this_month", label: "This Month" },
                  { value: "last_month", label: "Last Month" },
                  { value: "this_year", label: "This Year" },
                  { value: "last_year", label: "Last Year" },
                  { value: "all_time", label: "All Time" },
                  { value: "custom", label: "Custom..." },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content Panels */}
      {activeTab === "sheet" && (
        <DailySheetView
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          ledgerData={sheetData}
          isLoading={isSheetLoading}
          onOpenRecordIncoming={handleOpenRecordIncoming}
          onOpenRecordOutgoing={handleOpenRecordOutgoing}
          onOpenEditLedger={handleOpenEditOpeningBalance}
          onViewTransaction={handleViewTransaction}
          onEditTransaction={handleEditTransaction}
          onDeleteTransaction={handleDeleteTransactionPrompt}
        />
      )}

      {activeTab === "transactions" && (
        <TransactionsTable
          transactions={transactionsData?.results || []}
          count={transactionsData?.count || 0}
          totalPages={transactionsData?.totalPages || 1}
          currentPage={txPage}
          isLoading={isTransactionsLoading}
          search={txSearch}
          onSearchChange={(v) => {
            setTxSearch(v);
            setTxPage(1);
          }}
          typeFilter={txTypeFilter}
          onTypeFilterChange={(v) => {
            setTxTypeFilter(v);
            setTxPage(1);
          }}
          categoryFilter={txCategoryFilter}
          onCategoryFilterChange={(v) => {
            setTxCategoryFilter(v);
            setTxPage(1);
          }}
          paymentMethodFilter={txPaymentMethodFilter}
          onPaymentMethodFilterChange={(v) => {
            setTxPaymentMethodFilter(v);
            setTxPage(1);
          }}
          ordering={txOrdering}
          onOrderingChange={(ord) => {
            setTxOrdering(ord);
            setTxPage(1);
          }}
          onPageChange={setTxPage}
          choices={choicesData}
          onViewTransaction={handleViewTransaction}
          onEditTransaction={handleEditTransaction}
          onDeleteTransaction={handleDeleteTransactionPrompt}
          onExportCsv={handleExportAllTransactionsCsv}
          onExportPdf={handleDownloadAllTransactionsPdf}
          onPrint={handlePrintAllTransactions}
          isExporting={isExportingAll}
        />
      )}

      {activeTab === "analytics" && (
        <LedgerAnalytics summary={summaryData} isLoading={isSummaryLoading} />
      )}

      {/* Modals */}
      <CustomDateRangeModal
        open={isCustomDateModalOpen}
        onClose={() => setIsCustomDateModalOpen(false)}
        initialDateFrom={summaryDateFrom}
        initialDateTo={summaryDateTo}
        onApply={handleApplyCustomDateRange}
      />

      <DailyLedgerModal
        open={isLedgerModalOpen}
        onClose={() => {
          setIsLedgerModalOpen(false);
          setEditingLedger(null);
        }}
        selectedDate={selectedDate}
        editLedger={editingLedger}
        onSuccess={() => {
          refetchSheet();
          refetchSummary();
          refetchTransactions();
        }}
      />

      <RecordTransactionModal
        open={isRecordModalOpen}
        onClose={() => {
          setIsRecordModalOpen(false);
          setEditingTransaction(null);
        }}
        initialType={recordType}
        selectedDate={selectedDate}
        editTransaction={editingTransaction}
        onSuccess={() => {
          refetchSheet();
          refetchSummary();
          refetchTransactions();
        }}
      />

      <TransactionDetailModal
        open={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setViewingTransaction(null);
        }}
        transaction={viewingTransaction}
        onEdit={handleEditTransaction}
      />

      <DeleteLedgerConfirmModal
        open={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        title={
          deleteType === "transaction"
            ? "Delete Transaction"
            : "Delete Daily Ledger"
        }
        description={
          deleteType === "transaction"
            ? `Are you sure you want to delete transaction #${deleteTarget?.id}? All chronological running balances will be automatically recalculated.`
            : `Are you sure you want to delete this record?`
        }
        isDeleting={isDeletingTx || isDeletingLedger}
      />
    </div>
  );
}
