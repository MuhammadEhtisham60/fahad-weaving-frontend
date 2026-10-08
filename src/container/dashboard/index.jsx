import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Users, UserCheck, Package, AlertTriangle, TrendingUp, ShoppingCart, Wallet, Activity, Calendar, X } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { StatCard, Card, PageHeader, SectionTitle, StatusBadge, fmt, pkr } from "../../components/ui-kit.jsx";
import { employees, todayAttendance, inventory, sales, monthlyChart, attendanceTrend } from "../../lib/mock-data.js";
import { useAuth } from "../../hooks/useAuth.js";

export const Route = createFileRoute("/dashboard/")({ component: Dashboard });

export function Dashboard() {
  const { user } = useAuth();
  const displayName = user?.fullName ? user.fullName.split(" ")[0] : "Admin";

  const present = todayAttendance.filter((a) => a.status !== "Absent").length;
  const lowStock = inventory.filter((i) => i.stock < i.min);
  const totalSales = sales.reduce((s, x) => s + x.total, 0);

  const deptData = ["Production", "HR", "Accounts", "Store", "Sales", "Procurement"].map((d) => ({
    name: d,
    value: employees.filter((e) => e.department === d).length,
  }));
  const colors = ["oklch(0.55 0.22 280)", "oklch(0.7 0.18 320)", "oklch(0.65 0.18 200)", "oklch(0.72 0.16 155)", "oklch(0.78 0.16 60)", "oklch(0.65 0.15 235)"];

  const [filter, setFilter] = React.useState("Today");
  const [dates, setDates] = React.useState({ start: "", end: "" });
  const filters = ["Today", "Weekly", "Monthly", "Custom"];

  return (
    <div>
      <PageHeader 
        title={`Welcome back, ${displayName}`} 
        subtitle="Here's what's happening across your factory today." 
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {filter === "Custom" && (
              <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-xl border border-border/50 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-1.5 px-2">
                  <div className="relative">
                    <input
                      type="date"
                      value={dates.start}
                      onChange={(e) => setDates({ ...dates, start: e.target.value })}
                      className="h-8 px-2 text-[11px] font-medium rounded-lg border border-border bg-card focus:ring-2 focus:ring-primary/20 outline-none transition-smooth appearance-none"
                    />
                    <div className="absolute -top-2 left-2 px-1 bg-card text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Start</div>
                  </div>
                  <span className="text-muted-foreground text-[10px] font-bold uppercase">to</span>
                  <div className="relative">
                    <input
                      type="date"
                      value={dates.end}
                      onChange={(e) => setDates({ ...dates, end: e.target.value })}
                      className="h-8 px-2 text-[11px] font-medium rounded-lg border border-border bg-card focus:ring-2 focus:ring-primary/20 outline-none transition-smooth appearance-none"
                    />
                    <div className="absolute -top-2 left-2 px-1 bg-card text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">End</div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setFilter("Today");
                    setDates({ start: "", end: "" });
                  }}
                  className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-smooth"
                  title="Clear selection"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <div className="flex p-1 bg-muted/50 rounded-xl border border-border overflow-hidden">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-smooth flex items-center gap-1.5 ${
                    filter === f
                      ? "bg-white text-primary shadow-sm dark:bg-primary dark:text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f === "Custom" && <Calendar className="h-3.5 w-3.5" />}
                  {f}
                </button>
              ))}
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Employees" value={employees.length} hint={`${employees.filter(e=>e.status==="Active").length} active`} icon={Users} gradient="primary" trend={4.2} />
        <StatCard label="Checked In Today" value={present} hint={`of ${employees.length} staff`} icon={UserCheck} gradient="success" trend={2.1} />
        <StatCard label="Inventory Items" value={fmt(inventory.length)} hint={`${lowStock.length} low stock`} icon={Package} gradient="info" trend={-1.4} />
        <StatCard label="Monthly Sales" value={pkr(totalSales)} hint="May 2025" icon={TrendingUp} gradient="warning" trend={12.6} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <SectionTitle title="Sales vs Purchases" action={<span className="text-xs text-muted-foreground">Last 6 months</span>} />
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={monthlyChart}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.55 0.22 280)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.55 0.22 280)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.7 0.18 320)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.7 0.18 320)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 270)" />
                <XAxis dataKey="month" stroke="oklch(0.5 0.03 265)" fontSize={12} />
                <YAxis stroke="oklch(0.5 0.03 265)" fontSize={12} tickFormatter={(v) => (v/1000000).toFixed(1)+"M"} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.012 270)" }} formatter={(v) => pkr(v)} />
                <Area type="monotone" dataKey="sales" stroke="oklch(0.55 0.22 280)" fill="url(#g1)" strokeWidth={2} />
                <Area type="monotone" dataKey="purchases" stroke="oklch(0.7 0.18 320)" fill="url(#g2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Department Mix" />
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={deptData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                  {deptData.map((_, i) => <Cell key={i} fill={colors[i]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <SectionTitle title="Weekly Attendance" />
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 270)" />
                <XAxis dataKey="day" stroke="oklch(0.5 0.03 265)" fontSize={12} />
                <YAxis stroke="oklch(0.5 0.03 265)" fontSize={12} />
                <Tooltip />
                <Bar dataKey="present" stackId="a" fill="oklch(0.65 0.16 155)" radius={[0,0,0,0]} />
                <Bar dataKey="late" stackId="a" fill="oklch(0.78 0.16 75)" />
                <Bar dataKey="absent" stackId="a" fill="oklch(0.6 0.23 25)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <SectionTitle title="Low Stock Alerts" action={<AlertTriangle className="h-4 w-4 text-warning" />} />
          <div className="space-y-3">
            {lowStock.map((i) => (
              <div key={i.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="h-10 w-10 rounded-lg bg-gradient-warning flex items-center justify-center text-warning-foreground"><Package className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{i.name}</div>
                  <div className="text-xs text-muted-foreground">{i.category} · Min {i.min} {i.unit}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-destructive">{i.stock} {i.unit}</div>
                  <div className="text-[11px] text-muted-foreground">in stock</div>
                </div>
              </div>
            ))}
            {lowStock.length === 0 && <div className="text-sm text-muted-foreground text-center py-8">All items above minimum levels.</div>}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <SectionTitle title="Recent Sales" />
          <div className="space-y-2">
            {sales.slice(0, 4).map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-smooth">
                <div className="h-9 w-9 rounded-lg bg-gradient-success flex items-center justify-center text-success-foreground"><ShoppingCart className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{s.customer}</div>
                  <div className="text-xs text-muted-foreground">{s.id} · {s.date}</div>
                </div>
                <div className="text-sm font-semibold">{pkr(s.total)}</div>
                <StatusBadge status={s.status} />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionTitle title="Activity Feed" />
          <div className="space-y-3">
            {[
              { i: Activity, c: "Bilal Ahmed checked in", t: "2 min ago", g: "success" },
              { i: Wallet, c: "Payroll processed for May 2025", t: "1 hr ago", g: "primary" },
              { i: Package, c: "Stock received: Cotton Yarn 30s", t: "3 hr ago", g: "info" },
              { i: ShoppingCart, c: "New invoice INV-9005 created", t: "5 hr ago", g: "warning" },
              { i: Users, c: "New employee Mariam onboarded", t: "1 day ago", g: "primary" },
            ].map((x, n) => (
              <div key={n} className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-full bg-gradient-${x.g} flex items-center justify-center text-primary-foreground`}><x.i className="h-4 w-4" /></div>
                <div className="flex-1">
                  <div className="text-sm">{x.c}</div>
                  <div className="text-xs text-muted-foreground">{x.t}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
