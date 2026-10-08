import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { X, Wallet, TrendingUp, AlertCircle, Download, FileText, Calendar, Building2, User, CreditCard } from "lucide-react";
import { PageHeader, Card, Button, StatusBadge, StatCard, SectionTitle, pkr } from "../../components/ui-kit.jsx";
import { payroll } from "../../lib/mock-data.js";

export const Route = createFileRoute("/hr/payroll")({ component: PayrollPage });

function PayrollPage() {
  const [selectedSlip, setSelectedSlip] = useState(null);
  const totalGross = payroll.reduce((s, p) => s + p.salary + p.overtime, 0);
  const totalAdvance = payroll.reduce((s, p) => s + p.advance, 0);
  const totalNet = payroll.reduce((s, p) => s + p.net, 0);
  const pending = payroll.filter((p) => !p.paid).length;

  return (
    <div>
      <PageHeader title="Payroll · May 2025" subtitle="Salaries, advances, overtime and slips"
        actions={<><Button variant="outline"><Download className="h-4 w-4" /> Export Slips</Button><Button>Process Payroll</Button></>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Gross Payroll" value={pkr(totalGross)} icon={Wallet} gradient="primary" />
        <StatCard label="Advances Deducted" value={pkr(totalAdvance)} icon={TrendingUp} gradient="warning" />
        <StatCard label="Net Payable" value={pkr(totalNet)} icon={FileText} gradient="success" />
        <StatCard label="Pending Slips" value={pending} icon={AlertCircle} gradient="info" />
      </div>

      <Card padded={false}>
        <div className="p-5 border-b border-border"><SectionTitle title="Salary Breakdown" /></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground tracking-wider">
              <tr>
                <th className="text-left px-5 py-3">Employee</th>
                <th className="text-right px-5 py-3">Base</th>
                <th className="text-right px-5 py-3">Overtime</th>
                <th className="text-right px-5 py-3">Advance</th>
                <th className="text-right px-5 py-3">Deduction</th>
                <th className="text-right px-5 py-3">Net</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {payroll.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/30 transition-smooth">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.avatar} className="h-8 w-8 rounded-full" alt="" />
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.designation}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right font-mono">{pkr(p.salary)}</td>
                  <td className="px-5 py-3 text-right font-mono text-success">{p.overtime ? "+"+pkr(p.overtime) : "—"}</td>
                  <td className="px-5 py-3 text-right font-mono text-warning-foreground">{p.advance ? "−"+pkr(p.advance) : "—"}</td>
                  <td className="px-5 py-3 text-right font-mono text-destructive">{p.deduction ? "−"+pkr(p.deduction) : "—"}</td>
                  <td className="px-5 py-3 text-right font-bold">{pkr(p.net)}</td>
                  <td className="px-5 py-3"><StatusBadge status={p.paid ? "Paid" : "Pending"} /></td>
                  <td className="px-5 py-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => setSelectedSlip(p)}><FileText className="h-3 w-3" /> Slip</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {selectedSlip && <SalarySlipModal slip={selectedSlip} onClose={() => setSelectedSlip(null)} />}
    </div>
  );
}

function SalarySlipModal({ slip, onClose }) {
  const base = slip.salaryType === "Per Day" ? slip.gross : slip.salary;
  const totalEarnings = base + slip.overtime;
  const totalDeductions = slip.advance + slip.deduction;

  const handleDownload = () => {
    const rows = [
      "Fahad Weaving - Salary Slip",
      `Employee: ${slip.name} (${slip.id})`,
      `Month: ${slip.month}`,
      `Department: ${slip.department}`,
      `Designation: ${slip.designation}`,
      `Salary Type: ${slip.salaryType}`,
      `Base/Gross: ${pkr(base)}`,
      `Overtime: ${pkr(slip.overtime)}`,
      `Advance: ${pkr(slip.advance)}`,
      `Deduction: ${pkr(slip.deduction)}`,
      `Net Payable: ${pkr(slip.net)}`,
      `Status: ${slip.paid ? "Paid" : "Pending"}`,
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slip.id}-salary-slip-${slip.month.replace(/\s+/g, "-").toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-card border border-border shadow-elegant overflow-hidden">
        <div className="bg-gradient-primary px-6 py-5 text-primary-foreground">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-white/15 flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Salary Slip</h2>
                  <p className="text-sm text-white/80">Fahad Weaving - {slip.month}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={handleDownload}>
                <Download className="h-4 w-4" /> Download
              </Button>
              <button type="button" onClick={onClose} className="h-10 w-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-smooth">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <SlipInfo icon={User} label="Employee" value={slip.name} hint={slip.id} />
            <SlipInfo icon={Building2} label="Department" value={slip.department} hint={slip.designation} />
            <SlipInfo icon={Calendar} label="Pay Period" value={slip.month} hint={slip.payCycle || "Monthly"} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-border overflow-hidden">
              <div className="px-4 py-3 bg-success/10 text-success font-bold text-sm">Earnings</div>
              <SlipLine label={slip.salaryType === "Per Day" ? `Daily Wage (${slip.presentDays} days)` : "Base Salary"} value={base} />
              <SlipLine label="Overtime" value={slip.overtime} positive />
              <SlipTotal label="Total Earnings" value={totalEarnings} />
            </div>

            <div className="rounded-2xl border border-border overflow-hidden">
              <div className="px-4 py-3 bg-destructive/10 text-destructive font-bold text-sm">Deductions</div>
              <SlipLine label="Advance" value={slip.advance} negative />
              <SlipLine label="Other Deduction" value={slip.deduction} negative />
              <SlipTotal label="Total Deductions" value={totalDeductions} />
            </div>
          </div>

          <div className="rounded-2xl bg-muted/40 border border-border p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Net Payable</div>
                <div className="mt-1 text-3xl font-bold text-primary">{pkr(slip.net)}</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Payment Status</div>
                  <div className="mt-1"><StatusBadge status={slip.paid ? "Paid" : "Pending"} /></div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">CNIC</div>
                  <div className="mt-1 flex items-center gap-1 font-semibold"><CreditCard className="h-3.5 w-3.5 text-primary" /> {slip.cnic}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            This is a demo salary slip generated from the current payroll data.
          </div>
        </div>
      </div>
    </div>
  );
}

function SlipInfo({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </div>
      <div className="mt-2 font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

function SlipLine({ label, value, positive, negative }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-mono font-semibold ${positive ? "text-success" : negative ? "text-destructive" : ""}`}>
        {positive ? "+" : negative ? "-" : ""}{pkr(value)}
      </span>
    </div>
  );
}

function SlipTotal({ label, value }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30 text-sm font-bold">
      <span>{label}</span>
      <span className="font-mono">{pkr(value)}</span>
    </div>
  );
}
