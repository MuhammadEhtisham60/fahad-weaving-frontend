import { useState, useEffect } from "react";
import { Clock, LogIn, LogOut, Coffee, X, AlertCircle } from "lucide-react";
import { Button, StatusBadge } from "../ui-kit.jsx";
import { useTranslation } from "../../context/LanguageContext.jsx";

export function AttendanceModal({ employee, onClose, attendanceData, onAction }) {
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Use local state if props are not provided
  const [localAttendance, setLocalAttendance] = useState(() => {
    if (attendanceData) return null;
    if (typeof window === "undefined") return {};
    const saved = localStorage.getItem("attendance_data");
    return saved ? JSON.parse(saved) : {};
  });

  const data = attendanceData || (localAttendance && employee ? localAttendance[employee.id] : null) || { 
    status: "initial", 
    times: { checkIn: null, breakStart: null, breakEnd: null, checkOut: null, leave: null },
    logs: []
  };

  const { status, times, logs } = data;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!employee) return null;

  const isButtonEnabled = (action) => {
    if (status === "checked-out" || status === "on-leave") return false;
    switch (action) {
      case "check-in": return status === "initial";
      case "break-in": return status === "checked-in";
      case "break-out": return status === "on-break";
      case "check-out": return status === "checked-in" || status === "on-break";
      case "leave": return status === "initial";
      default: return false;
    }
  };

  const handleAction = (empId, action) => {
    if (onAction) {
      onAction(empId, action);
      return;
    }
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setLocalAttendance(prev => {
      const current = (prev && prev[empId]) || { 
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
          nextLogs.push({ label: t("attendance.checkIn", "Checked In"), time: timeStr, type: "check-in" });
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
          nextLogs.push({ label: t("attendance.checkOut", "Checked Out"), time: timeStr, type: "check-out" });
          break;
        case "leave":
          nextTimes.leave = now.toISOString();
          nextStatus = "on-leave";
          nextLogs.push({ label: "Marked Leave", time: timeStr, type: "leave" });
          break;
      }

      const updated = {
        ...prev,
        [empId]: { status: nextStatus, times: nextTimes, logs: nextLogs }
      };
      
      localStorage.setItem("attendance_data", JSON.stringify(updated));
      return updated;
    });
  };

  const calculateDuration = () => {
    const checkIn = times.checkIn ? new Date(times.checkIn) : null;
    if(!checkIn) return '0h 0m';
    const end = times.checkOut ? new Date(times.checkOut) : currentTime;
    let diff = end - checkIn;
    if(times.breakStart) {
      const bStart = new Date(times.breakStart);
      const bEnd = times.breakEnd ? new Date(times.breakEnd) : (status === 'on-break' ? currentTime : bStart);
      diff -= (bEnd - bStart);
    }
    const h = Math.floor(diff/3600000);
    const m = Math.floor((diff%3600000)/60000);
    return `${h}h ${m}m`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-2xl rounded-3xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-4">
            <img src={employee.avatar} className="h-12 w-12 rounded-full border-2 border-primary/20" alt="" />
            <div>
              <h3 className="text-xl font-bold">{employee.name}</h3>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">{employee.id} • {employee.department}</p>
            </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-muted transition-smooth">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Button 
                size="lg" className="h-16 gap-3 text-base justify-start px-6"
                disabled={!isButtonEnabled("check-in")}
                onClick={() => handleAction(employee.id, "check-in")}
              >
                <LogIn className="h-5 w-5" /> {t("attendance.checkIn", "Check In")}
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" size="lg" className="h-16 gap-2 text-sm border-2"
                  disabled={!isButtonEnabled("break-in")}
                  onClick={() => handleAction(employee.id, "break-in")}
                >
                  <Coffee className="h-5 w-5 text-warning" /> {t("attendance.breakIn", "Break In")}
                </Button>
                <Button 
                  variant="outline" size="lg" className="h-16 gap-2 text-sm border-2"
                  disabled={!isButtonEnabled("break-out")}
                  onClick={() => handleAction(employee.id, "break-out")}
                >
                  <Coffee className="h-5 w-5 text-success" /> {t("attendance.breakOut", "Break Out")}
                </Button>
              </div>
              
              <Button 
                variant="primary" size="lg" className="h-16 gap-3 text-base bg-gradient-success justify-start px-6"
                disabled={!isButtonEnabled("check-out")}
                onClick={() => handleAction(employee.id, "check-out")}
              >
                <LogOut className="h-5 w-5" /> {t("attendance.checkOut", "Check Out")}
              </Button>

              <Button 
                variant="danger" size="md" className="h-12 gap-2 text-sm mt-2 opacity-80 hover:opacity-100"
                disabled={!isButtonEnabled("leave")}
                onClick={() => handleAction(employee.id, "leave")}
              >
                <AlertCircle className="h-4 w-4" /> {t("attendance.markLeave", "Mark as Leave")}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-muted/50 border border-border">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-3">{t("attendance.statusLog", "Status Log")}</div>
              <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 scrollbar-custom">
                {logs.length === 0 ? (
                  <div className="text-xs text-muted-foreground italic py-4 text-center">{t("common.noData", "No activity recorded today")}</div>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <div className={`h-1.5 w-1.5 rounded-full ${log.type === 'check-in' ? 'bg-primary' : log.type === 'check-out' ? 'bg-success' : 'bg-warning'}`} />
                        {log.label}
                      </span>
                      <span className="font-mono text-xs opacity-60">{log.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
              <div className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">{t("attendance.currentSession", "Current Session")}</div>
              <div className="text-3xl font-bold tracking-tight text-primary">
                {status === 'initial' ? '0h 0m' : status === 'on-leave' ? t("attendance.onLeave", "On Leave") : calculateDuration()}
              </div>
              <div className="mt-2">
                <StatusBadge status={status === 'initial' ? 'Pending' : status === 'checked-in' ? 'Working' : status === 'on-break' ? 'Partial' : status === 'checked-out' ? 'Completed' : 'Absent'} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
