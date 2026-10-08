import React from "react";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Scale,
  DollarSign,
  Receipt,
} from "lucide-react";
import { StatCard, pkr, fmt } from "../../../components/ui-kit.jsx";

export function DailyLedgerStats({ summary, stats, dateLabel }) {
  const openingBalance = parseFloat(summary?.opening_balance ?? 0);
  const totalIncoming = parseFloat(summary?.total_incoming ?? 0);
  const totalOutgoing = parseFloat(summary?.total_outgoing ?? 0);
  const closingBalance = parseFloat(summary?.closing_balance ?? (openingBalance + totalIncoming - totalOutgoing));
  const netCashFlow = parseFloat(summary?.net_cash_flow ?? (totalIncoming - totalOutgoing));

  const incomingCount = summary?.incoming_transaction_count ?? 0;
  const outgoingCount = summary?.outgoing_transaction_count ?? 0;
  const totalCount = summary?.total_transaction_count ?? (incomingCount + outgoingCount);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="Opening Balance"
        value={pkr(openingBalance)}
        hint={dateLabel ? `Start of ${dateLabel}` : "Starting Cash Position"}
        icon={Wallet}
        gradient="info"
      />
      <StatCard
        label="Total Incoming"
        value={pkr(totalIncoming)}
        hint={`${incomingCount} Receipt${incomingCount === 1 ? "" : "s"} / Sales`}
        icon={ArrowDownLeft}
        gradient="success"
      />
      <StatCard
        label="Total Outgoing"
        value={pkr(totalOutgoing)}
        hint={`${outgoingCount} Expense${outgoingCount === 1 ? "" : "s"} / Payouts`}
        icon={ArrowUpRight}
        gradient="warning"
      />
      <StatCard
        label="Closing Balance"
        value={pkr(closingBalance)}
        hint="Current Net Available Cash"
        icon={Scale}
        gradient={closingBalance >= 0 ? "primary" : "warning"}
      />
      {/* <StatCard
        label="Net Cash Flow"
        value={`${netCashFlow >= 0 ? "+" : ""}${pkr(netCashFlow)}`}
        hint={`${totalCount} Total Transactions`}
        icon={Receipt}
        gradient={netCashFlow >= 0 ? "success" : "warning"}
      /> */}
    </div>
  );
}
