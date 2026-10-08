import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TrendingUp, Plus, Download, Users, DollarSign, Receipt } from "lucide-react";
import { PageHeader, Card, Button, StatusBadge, StatCard, SectionTitle, pkr } from "../../components/ui-kit.jsx";
import { NewSaleModal } from "../../components/sale/NewSaleModal.jsx";
import { sales as initialSales, SALE_STATUSES } from "../../lib/mock-data.js";

export const Route = createFileRoute("/sale/")({ component: SalesPage });

function nextInvoiceId(rows) {
  const nums = rows.map((s) => parseInt(s.id.replace(/\D/g, ""), 10)).filter(Boolean);
  const next = (nums.length ? Math.max(...nums) : 9000) + 1;
  return `INV-${next}`;
}

function paidForStatus(status, total, paid) {
  if (status === "Paid" || status === "Delivered") return total;
  if (status === "Pending" || status === "Dispatched" || status === "On Credit" || status === "Cancelled") return 0;
  if (status === "Partial") return Math.min(paid, total);
  return paid;
}

function SalesPage() {
  const [rows, setRows] = useState(initialSales);
  const [modalOpen, setModalOpen] = useState(false);

  const total = rows.reduce((s, x) => s + x.total, 0);
  const collected = rows.reduce((s, x) => s + x.paid, 0);
  const pendingCount = rows.filter((s) => s.status === "Pending" || s.status === "Dispatched").length;
  const customers = new Set(rows.map((s) => s.customer)).size;

  const updateStatus = (id, status) => {
    setRows((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const paid = paidForStatus(status, s.total, s.paid);
        return { ...s, status, paid };
      })
    );
  };

  const addSale = (entry) => {
    setRows((prev) => [{ id: nextInvoiceId(prev), ...entry }, ...prev]);
  };

  return (
    <div>
      <PageHeader
        title="Sales"
        subtitle="Woven cloth & fabric invoices — payment tracking for power loom output"
        actions={
          <>
            <Button variant="outline">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" /> New Sale
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Revenue" value={pkr(total)} icon={DollarSign} gradient="primary" trend={12.6} />
        <StatCard label="Collected" value={pkr(collected)} icon={TrendingUp} gradient="success" />
        <StatCard label="Outstanding" value={pkr(total - collected)} icon={Receipt} gradient="warning" />
        <StatCard label="Customers" value={customers} icon={Users} gradient="info" hint={pendingCount ? `${pendingCount} pending` : undefined} />
      </div>

      <Card padded={false}>
        <div className="p-5 border-b border-border">
          <SectionTitle title="Cloth & fabric sales" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground tracking-wider">
              <tr>
                <th className="text-left px-5 py-3">Invoice</th>
                <th className="text-left px-5 py-3">Customer</th>
                <th className="text-left px-5 py-3">Product</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-right px-5 py-3">Qty</th>
                <th className="text-right px-5 py-3">Total</th>
                <th className="text-right px-5 py-3">Received</th>
                <th className="text-right px-5 py-3">Balance</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Change</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const balance = s.total - s.paid;
                return (
                  <tr key={s.id} className="border-t border-border hover:bg-muted/30 transition-smooth">
                    <td className="px-5 py-3 font-mono font-semibold">{s.id}</td>
                    <td className="px-5 py-3">{s.customer}</td>
                    <td className="px-5 py-3 text-muted-foreground max-w-[200px] truncate" title={s.product}>
                      {s.product}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{s.date}</td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      {s.quantity} {s.unit}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold">{pkr(s.total)}</td>
                    <td className="px-5 py-3 text-right text-success">{pkr(s.paid)}</td>
                    <td className="px-5 py-3 text-right text-destructive">{balance > 0 ? pkr(balance) : "—"}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={s.status}
                        onChange={(e) => updateStatus(s.id, e.target.value)}
                        className="h-9 min-w-[8.5rem] px-2 rounded-lg bg-muted border border-transparent text-xs font-semibold focus:bg-background focus:border-ring outline-none cursor-pointer"
                        aria-label={`Change status for ${s.id}`}
                      >
                        {SALE_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {modalOpen && <NewSaleModal onClose={() => setModalOpen(false)} onSave={addSale} />}
    </div>
  );
}
