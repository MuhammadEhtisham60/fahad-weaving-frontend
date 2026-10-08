import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, Download, Printer, Search, TrendingUp, Users, Wallet } from "lucide-react";
import { PageHeader, Card, Button, StatCard, SectionTitle, pkr, StatusBadge } from "../../components/ui-kit.jsx";
import { payroll } from "../../lib/mock-data.js";

export const Route = createFileRoute("/hr/employee-salary")({ component: EmployeeSalaryPage });

function EmployeeSalaryPage() {
  const [search, setSearch] = useState("");
  const [salaryType, setSalaryType] = useState("All");

  const salaryData = payroll.map((employee) => {
    const isDaily = employee.salaryType === "Per Day";
    const gross = isDaily ? employee.perDayRate * employee.presentDays : employee.salary;
    return {
      ...employee,
      gross,
      payable: gross + employee.overtime - employee.advance - employee.deduction,
      cycleLabel: isDaily ? "15-Day Cycle" : "Monthly Fixed",
      rateLabel: isDaily ? `${pkr(employee.perDayRate)} / day` : `${pkr(employee.salary)} / month`,
    };
  });

  const filteredData = salaryData.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(search.toLowerCase()) ||
      employee.id.toLowerCase().includes(search.toLowerCase());
    const matchesType = salaryType === "All" || employee.salaryType === salaryType;
    return matchesSearch && matchesType;
  });

  const totalPayout = filteredData.reduce((acc, curr) => acc + curr.payable, 0);
  const dailyStaff = filteredData.filter((employee) => employee.salaryType === "Per Day").length;
  const monthlyStaff = filteredData.filter((employee) => employee.salaryType === "Monthly Fixed").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Salary"
        subtitle="Manage monthly fixed salary and per-day employees paid after 15 days"
        actions={
          <div className="flex gap-2">
            <Button variant="outline"><Printer className="h-4 w-4" /> Print All</Button>
            <Button><Download className="h-4 w-4" /> Export CSV</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Payable" value={pkr(totalPayout)} icon={Wallet} gradient="primary" />
        <StatCard label="Monthly Staff" value={monthlyStaff} icon={Users} gradient="success" />
        <StatCard label="Per Day Staff" value={dailyStaff} icon={Calendar} gradient="info" />
        <StatCard label="Pay Cycle" value="15 Days" hint="for per-day employees" icon={TrendingUp} gradient="warning" />
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by employee name or ID..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted border border-transparent focus:bg-background focus:border-ring outline-none text-sm transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {["All", "Monthly Fixed", "Per Day"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSalaryType(type)}
                className={`h-10 rounded-xl px-4 text-sm font-bold transition-smooth ${
                  salaryType === type
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-xl text-sm font-medium text-muted-foreground">
            <Calendar className="h-4 w-4" />
            May 2026
          </div>
        </div>
      </Card>

      <Card padded={false} className="overflow-hidden">
        <div className="p-5 border-b border-border bg-muted/20">
          <SectionTitle title="Salary Distribution Table" action={<span className="text-xs text-muted-foreground">{filteredData.length} records</span>} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground tracking-widest font-bold">
              <tr>
                <th className="text-left px-6 py-4">Employee</th>
                <th className="text-left px-6 py-4">Salary Type</th>
                <th className="text-center px-6 py-4">Attendance</th>
                <th className="text-right px-6 py-4">Rate / Salary</th>
                <th className="text-right px-6 py-4">Adjustments</th>
                <th className="text-right px-6 py-4">Payable</th>
                <th className="text-center px-6 py-4">Status</th>
                <th className="text-right px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredData.map((employee) => (
                <tr key={employee.id} className="hover:bg-muted/30 transition-smooth">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={employee.avatar} className="h-10 w-10 rounded-xl object-cover" alt="" />
                      <div>
                        <div className="font-bold text-foreground">{employee.name}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{employee.id} - {employee.designation}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex flex-col rounded-xl bg-primary/10 px-3 py-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary">{employee.salaryType}</span>
                      <span className="text-[10px] text-muted-foreground">{employee.cycleLabel}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {employee.salaryType === "Per Day" ? (
                      <div className="inline-flex items-center justify-center h-8 min-w-16 rounded-lg bg-success/10 px-3 text-success font-mono font-bold">
                        {employee.presentDays} days
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-muted-foreground">Monthly</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-mono font-bold text-foreground">{employee.rateLabel}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {employee.salaryType === "Per Day" ? `${employee.presentDays}d x ${pkr(employee.perDayRate)}` : "fixed monthly amount"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-xs">
                    <div className="text-success">+ {pkr(employee.overtime)} overtime</div>
                    <div className="text-destructive">- {pkr(employee.advance + employee.deduction)}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-base font-bold text-foreground">{pkr(employee.payable)}</div>
                    <div className="text-[10px] text-muted-foreground">Gross {pkr(employee.gross)}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={employee.paid ? "Paid" : "Pending"} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      size="sm"
                      variant={employee.paid ? "outline" : "primary"}
                      disabled={employee.paid}
                      className={employee.paid ? "opacity-40" : ""}
                    >
                      {employee.paid ? "Already Paid" : "Pay Now"}
                    </Button>
                  </td>
                </tr>
              ))}
              {!filteredData.length && (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-sm text-muted-foreground">
                    No salary records match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
