import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Timer,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { PageHeader, Card, Button, StatusBadge, SectionTitle, pkr } from "../../components/ui-kit.jsx";
import { employees, payroll } from "../../lib/mock-data.js";

export const Route = createFileRoute("/hr/employees/$employeeId")({ component: EmployeeDetailPage });

const attendanceHistory = {
  EMP001: [
    { date: "2026-05-18", shift: "Morning", in: "08:52", out: "17:08", hours: "7h 46m", status: "Present" },
    { date: "2026-05-17", shift: "Morning", in: "09:11", out: "17:02", hours: "7h 21m", status: "Late" },
    { date: "2026-05-16", shift: "Morning", in: "08:58", out: "17:04", hours: "7h 36m", status: "Present" },
    { date: "2026-05-15", shift: "Morning", in: "-", out: "-", hours: "0h", status: "Absent" },
    { date: "2026-04-28", shift: "Morning", in: "08:50", out: "17:00", hours: "7h 40m", status: "Present" },
    { date: "2026-04-12", shift: "Morning", in: "09:24", out: "17:10", hours: "7h 16m", status: "Late" },
    { date: "2026-03-20", shift: "Morning", in: "08:59", out: "17:04", hours: "7h 35m", status: "Present" },
  ],
  default: [
    { date: "2026-05-18", shift: "Morning", in: "09:01", out: "18:03", hours: "8h 02m", status: "Present" },
    { date: "2026-05-17", shift: "Morning", in: "09:18", out: "18:00", hours: "7h 42m", status: "Late" },
    { date: "2026-05-16", shift: "Morning", in: "08:57", out: "18:05", hours: "8h 08m", status: "Present" },
    { date: "2026-05-15", shift: "Morning", in: "09:04", out: "17:54", hours: "7h 50m", status: "Present" },
    { date: "2026-04-29", shift: "Morning", in: "09:02", out: "18:01", hours: "7h 59m", status: "Present" },
    { date: "2026-04-08", shift: "Morning", in: "-", out: "-", hours: "0h", status: "Absent" },
    { date: "2026-03-18", shift: "Morning", in: "08:55", out: "18:02", hours: "8h 07m", status: "Present" },
  ],
};

const leaveHistory = [
  { type: "Casual Leave", from: "2026-04-22", to: "2026-04-23", days: 2, status: "Completed" },
  { type: "Sick Leave", from: "2026-03-11", to: "2026-03-11", days: 1, status: "Completed" },
  { type: "Annual Leave", from: "2026-06-03", to: "2026-06-05", days: 3, status: "Pending" },
];

const salaryHistory = [
  { month: "May 2026", date: "2026-05-31", basic: 65000, overtime: 5200, advance: 10000, deduction: 1200, net: 59000, status: "Pending" },
  { month: "Apr 2026", date: "2026-04-30", basic: 65000, overtime: 4200, advance: 0, deduction: 800, net: 68400, status: "Paid" },
  { month: "Mar 2026", date: "2026-03-31", basic: 65000, overtime: 3600, advance: 5000, deduction: 0, net: 63600, status: "Paid" },
  { month: "Feb 2026", date: "2026-02-28", basic: 65000, overtime: 2500, advance: 0, deduction: 600, net: 66900, status: "Paid" },
  { month: "Jan 2026", date: "2026-01-31", basic: 65000, overtime: 1800, advance: 0, deduction: 0, net: 66800, status: "Paid" },
  { month: "Dec 2025", date: "2025-12-31", basic: 62000, overtime: 3200, advance: 3000, deduction: 500, net: 61700, status: "Paid" },
  { month: "Nov 2025", date: "2025-11-30", basic: 62000, overtime: 1600, advance: 0, deduction: 0, net: 63600, status: "Paid" },
];

const ATTENDANCE_FILTERS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "custom", label: "Custom" },
];

const SALARY_FILTERS = [
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "thisYear", label: "This Year" },
  { value: "lastYear", label: "Last Year" },
  { value: "custom", label: "Custom" },
];

const TODAY = "2026-05-18";

function EmployeeDetailPage() {
  const { employeeId } = Route.useParams();
  const employee = employees.find((item) => item.id === employeeId);
  const [attendanceFilter, setAttendanceFilter] = useState("thisMonth");
  const [attendanceCustom, setAttendanceCustom] = useState({ from: "2026-05-01", to: TODAY });
  const [salaryFilter, setSalaryFilter] = useState("thisYear");
  const [salaryCustom, setSalaryCustom] = useState({ from: "2026-01-01", to: TODAY });

  if (!employee) {
    return (
      <div>
        <PageHeader
          title="Employee not found"
          subtitle="The selected employee record is not available."
          actions={<Link to="/hr/employees"><Button variant="outline"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>}
        />
      </div>
    );
  }

  const salary = payroll.find((item) => item.id === employee.id);
  const attendance = attendanceHistory[employee.id] || attendanceHistory.default;
  const salaryRows = salaryHistory.map((item, index) =>
    index === 0 && salary
      ? { ...item, basic: salary.salary, overtime: salary.overtime, advance: salary.advance, deduction: salary.deduction, net: salary.net, status: salary.paid ? "Paid" : "Pending" }
      : item
  );
  const filteredAttendance = filterByRange(attendance, "date", attendanceFilter, attendanceCustom);
  const filteredSalary = filterByRange(salaryRows, "date", salaryFilter, salaryCustom);
  const presentDays = filteredAttendance.filter((item) => item.status === "Present").length;
  const lateDays = filteredAttendance.filter((item) => item.status === "Late").length;
  const leaveDays = leaveHistory.reduce((total, item) => total + item.days, 0);

  return (
    <div>
      <PageHeader
        title={employee.name}
        subtitle={`${employee.id} - ${employee.designation}`}
        actions={<Link to="/hr/employees"><Button variant="outline"><ArrowLeft className="h-4 w-4" /> Employees</Button></Link>}
      />

      <section className="rounded-2xl border border-border bg-card shadow-card overflow-hidden mb-6">
        <div className="bg-gradient-primary px-5 py-6 text-primary-foreground">
          <div className="flex flex-col lg:flex-row lg:items-end gap-5">
            <img src={employee.avatar} className="h-24 w-24 rounded-2xl object-cover ring-4 ring-white/25" alt="" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold">{employee.name}</h2>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{employee.department}</span>
              </div>
              <p className="mt-1 text-sm text-white/80">{employee.designation} working in {employee.shift}</p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> {employee.phone}</div>
                <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> {employee.id.toLowerCase()}@fahadweaving.com</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Karachi Factory</div>
              </div>
            </div>
            <StatusBadge status={employee.status} />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
          <DetailMetric icon={CalendarDays} label="Joining Date" value={employee.joining} />
          <DetailMetric icon={Wallet} label={employee.salaryType === "Per Day" ? "Per Day Rate" : "Monthly Salary"} value={employee.salaryType === "Per Day" ? `${pkr(employee.perDayRate)} / day` : pkr(employee.salary)} />
          <DetailMetric icon={ShieldCheck} label="CNIC" value={employee.cnic} />
          <DetailMetric icon={Clock} label="Shift" value={employee.shift} />
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SummaryCard icon={CheckCircle2} label="Present Records" value={`${presentDays}/${filteredAttendance.length}`} hint="selected period" />
        <SummaryCard icon={Timer} label="Late Arrivals" value={lateDays} hint="selected period" />
        <SummaryCard icon={CalendarDays} label="Leave Days" value={leaveDays} hint="approved and pending" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <SectionTitle title="Attendance History" action={<span className="text-xs text-muted-foreground">{filteredAttendance.length} records</span>} />
          <RecordFilters
            options={ATTENDANCE_FILTERS}
            value={attendanceFilter}
            onChange={setAttendanceFilter}
            custom={attendanceCustom}
            onCustomChange={setAttendanceCustom}
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-3 pr-4 font-semibold">Date</th>
                  <th className="py-3 pr-4 font-semibold">Shift</th>
                  <th className="py-3 pr-4 font-semibold">Check In</th>
                  <th className="py-3 pr-4 font-semibold">Check Out</th>
                  <th className="py-3 pr-4 font-semibold">Hours</th>
                  <th className="py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAttendance.map((row) => (
                  <tr key={row.date} className="hover:bg-muted/40 transition-smooth">
                    <td className="py-3 pr-4 font-medium">{row.date}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{row.shift}</td>
                    <td className="py-3 pr-4">{row.in}</td>
                    <td className="py-3 pr-4">{row.out}</td>
                    <td className="py-3 pr-4">{row.hours}</td>
                    <td className="py-3"><StatusBadge status={row.status} /></td>
                  </tr>
                ))}
                {!filteredAttendance.length && (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-sm text-muted-foreground">No attendance records found for this period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Leave Records" action={<span className="text-xs text-muted-foreground">Demo data</span>} />
          <div className="space-y-3">
            {leaveHistory.map((leave) => (
              <div key={`${leave.type}-${leave.from}`} className="rounded-xl border border-border bg-muted/30 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-sm">{leave.type}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{leave.from} to {leave.to}</div>
                  </div>
                  <StatusBadge status={leave.status} />
                </div>
                <div className="mt-3 text-xs font-semibold text-primary">{leave.days} day{leave.days > 1 ? "s" : ""}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="xl:col-span-3">
          <SectionTitle title="Salary History" action={<span className="text-xs text-muted-foreground">{filteredSalary.length} payroll records</span>} />
          <RecordFilters
            options={SALARY_FILTERS}
            value={salaryFilter}
            onChange={setSalaryFilter}
            custom={salaryCustom}
            onCustomChange={setSalaryCustom}
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {filteredSalary.map((row) => (
                <div key={row.month} className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold">{row.month}</div>
                    <StatusBadge status={row.status} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <SalaryItem label="Basic" value={pkr(row.basic)} />
                    <SalaryItem label="Overtime" value={pkr(row.overtime)} />
                    <SalaryItem label="Advance" value={pkr(row.advance)} />
                    <SalaryItem label="Deduction" value={pkr(row.deduction)} />
                  </div>
                  <div className="mt-4 rounded-lg bg-background px-3 py-2">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Net Salary</div>
                    <div className="text-lg font-bold text-primary">{pkr(row.net)}</div>
                  </div>
                </div>
              ))}
            {!filteredSalary.length && (
              <div className="lg:col-span-3 rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                No salary records found for this period.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function filterByRange(rows, dateKey, filter, customRange) {
  const today = parseDate(TODAY);
  const ranges = {
    today: [TODAY, TODAY],
    yesterday: [shiftDate(today, -1), shiftDate(today, -1)],
    thisMonth: [monthStart(today), monthEnd(today)],
    lastMonth: [monthStart(addMonths(today, -1)), monthEnd(addMonths(today, -1))],
    thisYear: [`${today.getFullYear()}-01-01`, `${today.getFullYear()}-12-31`],
    lastYear: [`${today.getFullYear() - 1}-01-01`, `${today.getFullYear() - 1}-12-31`],
    custom: [customRange.from, customRange.to],
  };
  const [from, to] = ranges[filter];
  return rows.filter((row) => row[dateKey] >= from && row[dateKey] <= to);
}

function parseDate(value) {
  return new Date(`${value}T00:00:00`);
}

function toDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

function shiftDate(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return toDateInputValue(next);
}

function addMonths(date, months) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function monthStart(date) {
  return toDateInputValue(new Date(date.getFullYear(), date.getMonth(), 1));
}

function monthEnd(date) {
  return toDateInputValue(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

function RecordFilters({ options, value, onChange, custom, onCustomChange }) {
  return (
    <div className="mb-4 rounded-xl border border-border bg-muted/30 p-2">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`h-9 rounded-lg px-3 text-xs font-semibold transition-smooth ${
                value === option.value
                  ? "bg-gradient-primary text-primary-foreground shadow-glow"
                  : "bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {value === "custom" && (
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <input
              type="date"
              value={custom.from}
              onChange={(event) => onCustomChange({ ...custom, from: event.target.value })}
              className="h-9 rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-ring"
            />
            <input
              type="date"
              value={custom.to}
              onChange={(event) => onCustomChange({ ...custom, to: event.target.value })}
              className="h-9 rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-ring"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function DetailMetric({ icon: Icon, label, value }) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, hint }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-2 text-2xl font-bold">{value}</div>
          <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
        </div>
        <div className="h-11 w-11 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground shadow-glow">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

function SalaryItem({ label, value }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}
