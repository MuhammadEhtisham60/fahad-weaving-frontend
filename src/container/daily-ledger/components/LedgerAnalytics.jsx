import React from "react";
import {
  TrendingUp,
  PieChart,
  BarChart3,
  CreditCard,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  Scale,
} from "lucide-react";
import { Card, pkr, fmt } from "../../../components/ui-kit.jsx";

export function LedgerAnalytics({ summary, isLoading }) {
  if (isLoading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Loading financial analytics...
      </div>
    );
  }

  const categories = summary?.categories || [];
  const paymentMethods = summary?.payment_methods || [];

  const incomeCategories = categories.filter(
    (c) => c.transaction_type === "INCOMING"
  );
  const expenseCategories = categories.filter(
    (c) => c.transaction_type === "OUTGOING"
  );

  const totalIncoming = parseFloat(summary?.total_incoming || 0);
  const totalOutgoing = parseFloat(summary?.total_outgoing || 0);

  return (
    <div className="space-y-6">
      {/* Category Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Categories */}
        <Card className="border-border shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <div className="h-8 w-8 rounded-lg bg-success/15 text-success flex items-center justify-center">
                <ArrowDownLeft className="h-4 w-4" />
              </div>
              <span>Income by Category</span>
            </div>
            <span className="text-xs font-semibold text-success">
              Total: {pkr(totalIncoming)}
            </span>
          </div>

          {incomeCategories.length === 0 ? (
            <div className="text-xs text-muted-foreground py-6 text-center italic">
              No income category data recorded for this timeframe.
            </div>
          ) : (
            <div className="space-y-3">
              {incomeCategories.map((c) => {
                const amt = parseFloat(c.total_amount || 0);
                const pct =
                  totalIncoming > 0 ? Math.round((amt / totalIncoming) * 100) : 0;

                return (
                  <div key={c.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">
                        {c.category}
                      </span>
                      <span className="text-muted-foreground">
                        {pkr(amt)} ({pct}%) • {c.count} tx
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Expense Categories */}
        <Card className="border-border shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <div className="h-8 w-8 rounded-lg bg-warning/15 text-warning-foreground flex items-center justify-center">
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <span>Expenses by Category</span>
            </div>
            <span className="text-xs font-semibold text-warning-foreground">
              Total: {pkr(totalOutgoing)}
            </span>
          </div>

          {expenseCategories.length === 0 ? (
            <div className="text-xs text-muted-foreground py-6 text-center italic">
              No expense category data recorded for this timeframe.
            </div>
          ) : (
            <div className="space-y-3">
              {expenseCategories.map((c) => {
                const amt = parseFloat(c.total_amount || 0);
                const pct =
                  totalOutgoing > 0 ? Math.round((amt / totalOutgoing) * 100) : 0;

                return (
                  <div key={c.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">
                        {c.category}
                      </span>
                      <span className="text-muted-foreground">
                        {pkr(amt)} ({pct}%) • {c.count} tx
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Payment Methods Breakdown */}
      <Card className="border-border shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <div className="h-8 w-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
              <CreditCard className="h-4 w-4" />
            </div>
            <span>Payment Method Distribution</span>
          </div>
        </div>

        {paymentMethods.length === 0 ? (
          <div className="text-xs text-muted-foreground py-6 text-center italic">
            No payment method records available.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {paymentMethods.map((m) => {
              const amt = parseFloat(m.total_amount || 0);
              return (
                <div
                  key={m.payment_method}
                  className="p-4 rounded-xl bg-muted/40 border border-border flex flex-col justify-between"
                >
                  <div className="text-xs font-semibold uppercase text-muted-foreground">
                    {m.payment_method}
                  </div>
                  <div className="mt-2 text-xl font-bold text-foreground">
                    {pkr(amt)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {m.count} transaction{m.count === 1 ? "" : "s"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
