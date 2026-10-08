import { useEffect, useState } from "react";
import { Sidebar } from "./layout/sidebar";
import { Header } from "./layout/header";
import { AttendanceModal } from "./attendance/AttendanceModal";
import { Toaster } from "./ui/sonner";
import { useAuth } from "../hooks/useAuth.js";

export function AppShell({ children }) {
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth > 1024;
  });
  const [showAttendance, setShowAttendance] = useState(false);
  const { user } = useAuth();

  const currentUser = user || {
    id: "USR-001",
    name: "Admin User",
    fullName: "Admin User",
    department: "Administration",
    avatar: "https://i.pravatar.cc/80?img=68",
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen w-full flex bg-background">
      <Sidebar open={open} setOpen={setOpen} />

      {open && (
        <div 
          onClick={() => setOpen(false)} 
          className="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity" 
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          open={open} 
          setOpen={setOpen} 
          dark={dark} 
          setDark={setDark} 
          onShowAttendance={() => setShowAttendance(true)}
        />
        <main className="flex-1 px-4 py-2 lg:p-8 max-w-[1600px] w-full mx-auto mt-0">
          {children}
        </main>
      </div>

      {showAttendance && (
        <AttendanceModal
          employee={currentUser}
          onClose={() => setShowAttendance(false)}
        />
      )}

      <Toaster richColors position="top-right" />
    </div>
  );
}
