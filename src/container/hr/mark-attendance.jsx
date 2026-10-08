import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Clock, Search, User, LogIn, LogOut, Coffee } from "lucide-react";
import { PageHeader, Card, StatusBadge, Button } from "../../components/ui-kit.jsx";
import { employees as initialEmployees } from "../../lib/mock-data.js";
import { AttendanceModal } from "../../components/attendance/AttendanceModal";

export const Route = createFileRoute("/hr/mark-attendance")({ component: MarkAttendancePage });

function MarkAttendancePage() {
  const [search, setSearch] = useState("");
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendance, setAttendance] = useState(() => {
    const saved = localStorage.getItem("attendance_data");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem("attendance_data", JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000); // Update every second for live count
    return () => clearInterval(timer);
  }, []);

  const handleAttendanceAction = (empId, action) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setAttendance(prev => {
      const current = prev[empId] || { 
        status: "initial", 
        times: { checkIn: null, breakStart: null, breakEnd: null, checkOut: null, leave: null },
        logs: []
      };
      let nextStatus = current.status;
      const nextTimes = { ...current.times };
      const nextLogs = [...current.logs];

      switch (action) {
        case "check-in":
          nextTimes.checkIn = now.toISOString();
          nextStatus = "checked-in";
          nextLogs.push({ label: "Checked In", time: timeStr, type: "check-in" });
          break;
        case "break-in":
          nextTimes.breakStart = now.toISOString();
          nextStatus = "on-break";
          nextLogs.push({ label: "Break Started", time: timeStr, type: "break-in" });
          break;
        case "break-out":
          nextTimes.breakEnd = now.toISOString();
          nextStatus = "checked-in";
          nextLogs.push({ label: "Break Ended", time: timeStr, type: "break-out" });
          break;
        case "check-out":
          nextTimes.checkOut = now.toISOString();
          nextStatus = "checked-out";
          nextLogs.push({ label: "Checked Out", time: timeStr, type: "check-out" });
          break;
        case "leave":
          nextTimes.leave = now.toISOString();
          nextStatus = "on-leave";
          nextLogs.push({ label: "Marked Leave", time: timeStr, type: "leave" });
          break;
      }

      return {
        ...prev,
        [empId]: { status: nextStatus, times: nextTimes, logs: nextLogs }
      };
    });
  };

  const isActionEnabled = (empId, action) => {
    const data = attendance[empId] || { status: "initial" };
    const status = data.status;
    if (status === "checked-out" || status === "on-leave") return false;
    switch (action) {
      case "check-in": return status === "initial";
      case "break-in": return status === "checked-in";
      case "break-out": return status === "on-break";
      case "check-out": return status === "checked-in" || status === "on-break";
      default: return false;
    }
  };

  const getTimeSinceCheckIn = (empId) => {
    const data = attendance[empId];
    if (!data || !data.times?.checkIn || data.status === 'checked-out' || data.status === 'on-leave') return null;
    
    const checkIn = new Date(data.times.checkIn);
    let diffMs = currentTime - checkIn;

    // Subtract break duration if applicable
    if (data.times?.breakStart) {
      const bStart = new Date(data.times.breakStart);
      const bEnd = data.times.breakEnd ? new Date(data.times.breakEnd) : (data.status === 'on-break' ? currentTime : bStart);
      diffMs -= (bEnd - bStart);
    }

    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    
    return `${hours > 0 ? hours + 'h ' : ''}${minutes}m ${seconds}s`;
  };

  const filteredEmployees = useMemo(() => {
    return initialEmployees.filter(e => 
      e.name.toLowerCase().includes(search.toLowerCase()) || 
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const selectedEmployee = initialEmployees.find(e => e.id === selectedEmpId);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Mark Attendance" 
        subtitle="Select an employee to update their attendance status"
        actions={
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Search employee..."
              className="pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredEmployees.map(emp => {
          const empAttendance = attendance[emp.id] || { 
            status: "initial",
            times: { checkIn: null }
          };
          return (
            <Card 
              key={emp.id} 
              className={`cursor-pointer transition-all hover:scale-[1.02] hover:shadow-elegant group relative overflow-hidden ${
                selectedEmpId === emp.id ? 'ring-2 ring-primary border-primary/50' : ''
              }`}
              onClick={() => setSelectedEmpId(emp.id)}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                  <img src={emp.avatar} className="h-14 w-14 rounded-2xl object-cover shadow-sm" alt="" />
                  <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card ${
                    empAttendance.status === 'checked-in' ? 'bg-success' : 
                    empAttendance.status === 'on-break' ? 'bg-warning' : 'bg-muted'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">{emp.name}</h4>
                  <p className="text-xs text-muted-foreground truncate mb-2">{emp.department} • {emp.id}</p>
                  <div className="flex flex-wrap gap-2 items-center">
                    <StatusBadge status={
                      empAttendance.status === 'initial' ? 'Pending' : 
                      empAttendance.status === 'checked-in' ? 'Working' : 
                      empAttendance.status === 'on-break' ? 'Partial' : 
                      empAttendance.status === 'checked-out' ? 'Completed' : 'Absent'
                    } />
                    {empAttendance.times?.checkIn && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {new Date(empAttendance.times.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {getTimeSinceCheckIn(emp.id) && (
                          <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {getTimeSinceCheckIn(emp.id)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 relative z-10">
                {empAttendance.status === 'initial' ? (
                  <Button 
                    variant="primary" size="sm" className="col-span-2 gap-1.5"
                    onClick={(e) => { e.stopPropagation(); handleAttendanceAction(emp.id, 'check-in'); }}
                  >
                    <LogIn className="h-3.5 w-3.5" /> Check In
                  </Button>
                ) : empAttendance.status === 'checked-in' ? (
                  <>
                    <Button 
                      variant="outline" size="sm" className="gap-1.5 border-warning/30 text-warning-foreground hover:bg-warning/10"
                      onClick={(e) => { e.stopPropagation(); handleAttendanceAction(emp.id, 'break-in'); }}
                    >
                      <Coffee className="h-3.5 w-3.5" /> Break
                    </Button>
                    <Button 
                      variant="primary" size="sm" className="gap-1.5 bg-gradient-success"
                      onClick={(e) => { e.stopPropagation(); handleAttendanceAction(emp.id, 'check-out'); }}
                    >
                      <LogOut className="h-3.5 w-3.5" /> Out
                    </Button>
                  </>
                ) : empAttendance.status === 'on-break' ? (
                  <>
                    <Button 
                      variant="outline" size="sm" className="gap-1.5 border-success/30 text-success hover:bg-success/10"
                      onClick={(e) => { e.stopPropagation(); handleAttendanceAction(emp.id, 'break-out'); }}
                    >
                      <Coffee className="h-3.5 w-3.5" /> Resume
                    </Button>
                    <Button 
                      variant="primary" size="sm" className="gap-1.5 bg-gradient-success"
                      onClick={(e) => { e.stopPropagation(); handleAttendanceAction(emp.id, 'check-out'); }}
                    >
                      <LogOut className="h-3.5 w-3.5" /> Out
                    </Button>
                  </>
                ) : (
                  <div className="col-span-2 text-center py-1.5 bg-muted/50 rounded-lg text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Session Ended
                  </div>
                )}
              </div>

              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </Card>
          );
        })}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-20 bg-card/50 rounded-3xl border border-dashed border-border">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-semibold">No employees found</h3>
          <p className="text-muted-foreground text-sm">Try searching with a different name or ID</p>
        </div>
      )}

      {selectedEmployee && (
        <AttendanceModal 
          employee={selectedEmployee}
          attendanceData={attendance[selectedEmployee.id]}
          onAction={handleAttendanceAction}
          onClose={() => setSelectedEmpId(null)}
        />
      )}
    </div>
  );
}
