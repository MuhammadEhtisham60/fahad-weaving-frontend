import { createFileRoute } from "@tanstack/react-router";
import { FileText, Download } from "lucide-react";
import { PageHeader, Card, Button, SectionTitle, pkr } from "../../components/ui-kit.jsx";
import { monthlyChart, sales, purchases } from "../../lib/mock-data.js";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

export const Route = createFileRoute("/reports/")({ component: ReportsPage });

function ReportsPage() {
  const profit = monthlyChart.map((m) => ({ month: m.month, profit: m.sales - m.purchases }));
  const totalProfit = profit.reduce((s, m) => s + m.profit, 0);

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Profit & loss, sales, purchases — exportable"
        actions={
          <>
            <Button variant="outline"><Download className="h-4 w-4" /> PDF</Button>
            <Button><Download className="h-4 w-4" /> Excel</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Sales (6mo)", value: pkr(monthlyChart.reduce((s, m) => s + m.sales, 0)), grad: "bg-gradient-success" },
          { label: "Total Purchases (6mo)", value: pkr(monthlyChart.reduce((s, m) => s + m.purchases, 0)), grad: "bg-gradient-warning" },
          { label: "Net Profit (6mo)", value: pkr(totalProfit), grad: "bg-gradient-primary" },
        ].map((x) => (
          <div key={x.label} className={`rounded-2xl p-6 text-primary-foreground shadow-glow ${x.grad}`}>
            <div className="text-xs uppercase tracking-widest opacity-80">{x.label}</div>
            <div className="text-3xl font-bold mt-2">{x.value}</div>
          </div>
        ))}
      </div>

      <Card className="mb-6">
        <SectionTitle title="Profit Trend" />
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={profit}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 270)" />
              <XAxis dataKey="month" stroke="oklch(0.5 0.03 265)" fontSize={12} />
              <YAxis stroke="oklch(0.5 0.03 265)" fontSize={12} tickFormatter={(v) => (v / 1000000).toFixed(1) + "M"} />
              <Tooltip formatter={(v) => pkr(v)} contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.012 270)" }} />
              <Bar dataKey="profit" fill="oklch(0.55 0.22 280)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <SectionTitle title="Sales vs Purchases" />
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={monthlyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 270)" />
                <XAxis dataKey="month" stroke="oklch(0.5 0.03 265)" fontSize={12} />
                <YAxis stroke="oklch(0.5 0.03 265)" fontSize={12} tickFormatter={(v) => (v / 1000000).toFixed(1) + "M"} />
                <Tooltip formatter={(v) => pkr(v)} />
                <Legend />
                <Bar dataKey="sales" fill="oklch(0.55 0.22 280)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="purchases" fill="oklch(0.7 0.18 320)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <SectionTitle title="Latest Records" />
          <div className="space-y-2 text-sm">
            {[
              ...sales.slice(0, 3).map((s) => ({ k: s.id, a: s.customer, b: pkr(s.total), t: "Sale" })),
              ...purchases.slice(0, 3).map((p) => ({ k: p.id, a: p.vendor, b: pkr(p.total), t: "Purchase" })),
            ].map((r) => (
              <div key={r.k} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{r.a}</div>
                    <div className="text-xs text-muted-foreground">{r.k} · {r.t}</div>
                  </div>
                </div>
                <div className="font-semibold">{r.b}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
