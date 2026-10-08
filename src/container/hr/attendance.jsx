import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, LogIn, LogOut, Coffee, Calendar, Download, Search, Filter, X, User } from "lucide-react";
import { PageHeader, Card, Button, StatusBadge, StatCard, SectionTitle, fmt } from "../../components/ui-kit.jsx";
import { employees, todayAttendance, calcHours, attendanceTrend } from "../../lib/mock-data.js";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export const Route = createFileRoute("/hr/attendance")({ component: AttendancePage });

function AttendancePage() {
  const [filter, setFilter] = React.useState("Today");
  const [dates, setDates] = React.useState({ start: "", end: "" });
  const [selectedEmployee, setSelectedEmployee] = React.useState("All Employees");
  
  const filters = ["Today", "Previous Day", "Week", "Month", "Custom"];

  const present = todayAttendance.filter((a) => a.status !== "Absent").length;
  const late = todayAttendance.filter((a) => a.status === "Late").length;
  const absent = employees.length - present;
  const avgHrs = (todayAttendance.reduce((s,a)=>s+calcHours(a),0) / Math.max(present,1)).toFixed(1);

  return (
    <div>
      <PageHeader 
        title="Attendance Logs" 
        subtitle="View and manage employee attendance across different time periods."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {/* Employee Filter */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <User className="h-4 w-4" />
              </div>
              <select 
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="h-10 pl-9 pr-4 text-sm font-medium rounded-xl border border-border bg-card focus:ring-2 focus:ring-primary/20 outline-none transition-smooth appearance-none min-w-[160px]"
              >
                <option>All Employees</option>
                {employees.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
              </select>
            </div>

            {/* Date Range Controls (Custom) */}
            {filter === "Custom" && (
              <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-xl border border-border/50 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-1.5 px-2">
                  <div className="relative">
                    <input
                      type="date"
                      value={dates.start}
                      onChange={(e) => setDates({ ...dates, start: e.target.value })}
                      className="h-8 px-2 text-[11px] font-medium rounded-lg border border-border bg-card focus:ring-2 focus:ring-primary/20 outline-none transition-smooth"
                    />
                    <div className="absolute -top-2 left-2 px-1 bg-card text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Start</div>
                  </div>
                  <span className="text-muted-foreground text-[10px] font-bold uppercase">to</span>
                  <div className="relative">
                    <input
                      type="date"
                      value={dates.end}
                      onChange={(e) => setDates({ ...dates, end: e.target.value })}
                      className="h-8 px-2 text-[11px] font-medium rounded-lg border border-border bg-card focus:ring-2 focus:ring-primary/20 outline-none transition-smooth"
                    />
                    <div className="absolute -top-2 left-2 px-1 bg-card text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">End</div>
                  </div>
                </div>
                <button 
                  onClick={() => { setFilter("Today"); setDates({ start: "", end: "" }); }}
                  className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-smooth"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Filter Tabs */}
            <div className="flex p-1 bg-muted/50 rounded-xl border border-border overflow-hidden">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-smooth whitespace-nowrap ${
                    filter === f
                      ? "bg-white text-primary shadow-sm dark:bg-primary dark:text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <Button size="sm"><Download className="h-4 w-4" /> Export</Button>
          </div>
        } 
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Present" value={present} icon={LogIn} gradient="success" />
        <StatCard label="Late Arrivals" value={late} icon={Clock} gradient="warning" />
        <StatCard label="Absent" value={absent} icon={LogOut} gradient="primary" />
        <StatCard label="Avg Hours" value={avgHrs + "h"} icon={Coffee} gradient="info" />
      </div>

      <Card className="mb-6">
        <SectionTitle title="Weekly Attendance Trend" />
        <div className="h-56">
          <ResponsiveContainer>
            <LineChart data={attendanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 270)" />
              <XAxis dataKey="day" stroke="oklch(0.5 0.03 265)" fontSize={12} />
              <YAxis stroke="oklch(0.5 0.03 265)" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="present" stroke="oklch(0.65 0.16 155)" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="late" stroke="oklch(0.78 0.16 75)" strokeWidth={2} />
              <Line type="monotone" dataKey="absent" stroke="oklch(0.6 0.23 25)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card padded={false}>
        <div className="p-5 border-b border-border flex items-center justify-between">
          <SectionTitle 
            title={`${filter} Log${selectedEmployee !== "All Employees" ? ` for ${selectedEmployee}` : ""}`} 
            className="mb-0" 
          />
          <div className="text-xs text-muted-foreground font-medium">
            Showing {selectedEmployee !== "All Employees" ? "1" : employees.length} results
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground tracking-wider">
              <tr>
                <th className="text-left px-5 py-3">Employee</th>
                <th className="text-left px-5 py-3">Department</th>
                <th className="text-left px-5 py-3">Check-In</th>
                <th className="text-left px-5 py-3">Break</th>
                <th className="text-left px-5 py-3">Check-Out</th>
                <th className="text-left px-5 py-3">Hours</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {employees
                .filter(e => selectedEmployee === "All Employees" || e.name === selectedEmployee)
                .map((e) => {
                const a = todayAttendance.find((x) => x.id === e.id) || { id: e.id, status: "Absent" };
                const hrs = calcHours(a);
                return (
                  <tr key={e.id} className="border-t border-border hover:bg-muted/30 transition-smooth">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={e.avatar} className="h-8 w-8 rounded-full" alt="" />
                        <div>
                          <div className="font-medium">{e.name}</div>
                          <div className="text-xs text-muted-foreground">{e.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{e.department}</td>
                    <td className="px-5 py-3 font-mono">{a.checkIn || "—"}</td>
                    <td className="px-5 py-3 font-mono text-xs">{a.breakStart ? `${a.breakStart}–${a.breakEnd}` : "—"}</td>
                    <td className="px-5 py-3 font-mono">{a.checkOut || "—"}</td>
                    <td className="px-5 py-3 font-semibold">{hrs ? hrs.toFixed(1)+"h" : "—"}</td>
                    <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
