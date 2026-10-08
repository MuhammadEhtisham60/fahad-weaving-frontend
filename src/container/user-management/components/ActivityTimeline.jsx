import React, { useState } from "react";
import {
  History,
  Search,
  Filter,
  LogIn,
  LogOut,
  UserCheck,
  UserX,
  KeyRound,
  Shield,
  UserPlus,
  Trash2,
  Calendar,
  Laptop,
  CheckCircle2,
  XCircle,
  Clock,
  List,
  Activity,
  RotateCcw,
} from "lucide-react";
import { Button } from "../../../components/ui-kit.jsx";

export function ActivityTimeline({ activities = [], users = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [userFilter, setUserFilter] = useState("All");
  const [viewMode, setViewMode] = useState("timeline"); // "timeline" or "table"

  const actionTypes = [
    "All",
    "Login",
    "Logout",
    "Profile Updated",
    "Password Changed",
    "Role Changed",
    "Permission Updated",
    "User Created",
    "User Activated",
    "User Deactivated",
    "User Deleted",
  ];

  const filtered = activities.filter((act) => {
    const matchesSearch =
      !searchQuery ||
      act.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.userFullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.ipAddress?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = actionFilter === "All" || act.action === actionFilter;
    const matchesUser = userFilter === "All" || act.username === userFilter;

    return matchesSearch && matchesAction && matchesUser;
  });

  const getActionIcon = (action) => {
    switch (action) {
      case "Login":
        return <LogIn className="h-4 w-4 text-emerald-500" />;
      case "Logout":
        return <LogOut className="h-4 w-4 text-slate-500" />;
      case "Profile Updated":
        return <UserCheck className="h-4 w-4 text-primary" />;
      case "Password Changed":
      case "Password Reset UI":
        return <KeyRound className="h-4 w-4 text-amber-500" />;
      case "Role Changed":
      case "Permission Updated":
        return <Shield className="h-4 w-4 text-purple-500" />;
      case "User Created":
        return <UserPlus className="h-4 w-4 text-emerald-500" />;
      case "User Activated":
        return <UserCheck className="h-4 w-4 text-emerald-500" />;
      case "User Deactivated":
        return <UserX className="h-4 w-4 text-amber-500" />;
      case "User Deleted":
        return <Trash2 className="h-4 w-4 text-rose-500" />;
      default:
        return <Activity className="h-4 w-4 text-primary" />;
    }
  };

  const getActionBadgeClass = (action) => {
    switch (action) {
      case "Login":
      case "User Activated":
      case "User Created":
        return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "Logout":
        return "bg-muted text-muted-foreground border-border";
      case "Password Changed":
      case "Password Reset UI":
      case "User Deactivated":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "Role Changed":
      case "Permission Updated":
        return "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "User Deleted":
        return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20";
      default:
        return "bg-primary/15 text-primary border-primary/20";
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setActionFilter("All");
    setUserFilter("All");
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="rounded-2xl bg-card border border-border p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search activity logs (e.g. admin, role, password, IP address)..."
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-muted border border-transparent focus:bg-background focus:border-ring outline-none text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="h-10 px-3 rounded-xl bg-muted border border-transparent focus:bg-background focus:border-ring outline-none text-xs font-medium"
            >
              {actionTypes.map((t) => (
                <option key={t} value={t}>
                  {t === "All" ? "All Event Types" : t}
                </option>
              ))}
            </select>

            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="h-10 px-3 rounded-xl bg-muted border border-transparent focus:bg-background focus:border-ring outline-none text-xs font-medium"
            >
              <option value="All">All Users</option>
              {users.map((u) => (
                <option key={u.id} value={u.username}>
                  {u.fullName} (@{u.username})
                </option>
              ))}
            </select>

            {(searchQuery || actionFilter !== "All" || userFilter !== "All") && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                <RotateCcw className="h-3.5 w-3.5" /> Clear
              </Button>
            )}

            <div className="flex items-center rounded-xl bg-muted p-1 border border-border">
              <button
                type="button"
                onClick={() => setViewMode("timeline")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "timeline"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Timeline
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "table"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Rendering */}
      {viewMode === "timeline" ? (
        <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
          <div className="relative border-l-2 border-border ml-4 space-y-6">
            {filtered.map((act) => (
              <div key={act.id} className="relative pl-6 group">
                {/* Timeline Dot */}
                <div className="absolute -left-[17px] top-1 h-8 w-8 rounded-xl bg-card border border-border shadow-sm flex items-center justify-center transition-transform group-hover:scale-110">
                  {getActionIcon(act.action)}
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border/50 hover:bg-muted/70 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-foreground">
                        {act.userFullName}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        @{act.username}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getActionBadgeClass(
                          act.action
                        )}`}
                      >
                        {act.action}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                      <Clock className="h-3 w-3" />
                      <span>{act.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-xs text-foreground/90 leading-relaxed font-medium">
                    {act.description}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-border/40 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3 text-primary" /> Module:{" "}
                      <strong className="text-foreground">{act.module}</strong>
                    </span>
                    {act.ipAddress && (
                      <span className="flex items-center gap-1 font-mono">
                        IP: <strong className="text-foreground">{act.ipAddress}</strong>
                      </span>
                    )}
                    {act.device && (
                      <span className="flex items-center gap-1">
                        <Laptop className="h-3 w-3" /> {act.device}
                      </span>
                    )}
                    <span className="ml-auto inline-flex items-center gap-1 text-emerald-600 font-bold">
                      <CheckCircle2 className="h-3 w-3" /> {act.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No activity logs found matching the filter criteria.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground uppercase font-bold tracking-wider text-[10px] border-b border-border">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5">Module</th>
                  <th className="p-3.5">IP Address</th>
                  <th className="p-3.5">Device</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((act) => (
                  <tr key={act.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5 whitespace-nowrap font-mono text-muted-foreground">
                      {act.timestamp}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-bold text-foreground">{act.userFullName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        @{act.username}
                      </div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getActionBadgeClass(
                          act.action
                        )}`}
                      >
                        {act.action}
                      </span>
                    </td>
                    <td className="p-3.5 max-w-xs font-medium text-foreground">
                      {act.description}
                    </td>
                    <td className="p-3.5 whitespace-nowrap font-semibold text-muted-foreground">
                      {act.module}
                    </td>
                    <td className="p-3.5 whitespace-nowrap font-mono text-muted-foreground">
                      {act.ipAddress || "—"}
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-muted-foreground">
                      {act.device || "—"}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                        <CheckCircle2 className="h-3 w-3" /> {act.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      No activity logs match your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
