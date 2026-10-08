import React from "react";
import { Users, UserCheck, UserX, Clock, ShieldAlert, ShieldCheck } from "lucide-react";
import { useTranslation } from "../../../context/LanguageContext.jsx";

export function UserStatsCards({ stats, onFilterClick, activeFilter }) {
  const { t } = useTranslation();

  const cards = [
    {
      key: "all",
      label: t("dashboard.totalEmployees", "Total Users"),
      value: stats?.totalUsers || 0,
      hint: t("dashboard.overviewStats", "Registered ERP user accounts"),
      icon: Users,
      gradient: "primary",
      bgClass: "from-primary/10 via-primary/5 to-transparent",
      badgeColor: "bg-primary/15 text-primary border-primary/20",
    },
    {
      key: "Active",
      label: t("dashboard.activeUsers", "Active Users"),
      value: stats?.activeUsers || 0,
      hint: t("common.active", "Current active sessions & accounts"),
      icon: UserCheck,
      gradient: "success",
      bgClass: "from-emerald-500/10 via-emerald-500/5 to-transparent",
      badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      key: "Inactive",
      label: t("common.inactive", "Inactive Users"),
      value: stats?.inactiveUsers || 0,
      hint: t("common.inactive", "On leave or decommissioned"),
      icon: UserX,
      gradient: "info",
      bgClass: "from-slate-500/10 via-slate-500/5 to-transparent",
      badgeColor: "bg-muted text-muted-foreground border-border",
    },
    {
      key: "Pending",
      label: t("attendance.status", "Pending Approvals"),
      value: stats?.pendingUsers || 0,
      hint: "Awaiting HR verification",
      icon: Clock,
      gradient: "warning",
      bgClass: "from-amber-500/10 via-amber-500/5 to-transparent",
      badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    {
      key: "Suspended",
      label: t("common.status", "Suspended Users"),
      value: stats?.suspendedUsers || 0,
      hint: "Access restricted / blocked",
      icon: ShieldAlert,
      gradient: "info",
      bgClass: "from-rose-500/10 via-rose-500/5 to-transparent",
      badgeColor: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20",
    },
    {
      key: "roles",
      label: t("dashboard.totalRoles", "Total Roles"),
      value: stats?.totalRoles || 0,
      hint: t("userManagement.rolesTab", "Custom & system role sets"),
      icon: ShieldCheck,
      gradient: "primary",
      bgClass: "from-purple-500/10 via-purple-500/5 to-transparent",
      badgeColor: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20",
    },
  ];

  const getGradient = (type) => {
    switch (type) {
      case "primary":
        return "bg-gradient-primary text-primary-foreground";
      case "success":
        return "bg-emerald-600 text-white";
      case "warning":
        return "bg-amber-600 text-white";
      case "info":
        return "bg-slate-700 text-white";
      default:
        return "bg-gradient-primary text-primary-foreground";
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeFilter === card.key;
        return (
          <div
            key={card.label}
            onClick={() => onFilterClick && onFilterClick(card.key)}
            className={`relative overflow-hidden rounded-2xl bg-card border p-4 transition-all duration-200 cursor-pointer ${
              isSelected
                ? "border-primary shadow-glow ring-2 ring-primary/20 -translate-y-0.5"
                : "border-border shadow-card hover:shadow-elegant hover:-translate-y-0.5"
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.bgClass} pointer-events-none`} />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                  {card.label}
                </div>
                <div className="mt-1.5 text-2xl font-black tracking-tight text-foreground font-mono">
                  {card.value}
                </div>
              </div>
              <div
                className={`h-9 w-9 rounded-xl ${getGradient(
                  card.gradient
                )} flex items-center justify-center shadow-sm shrink-0`}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="relative mt-2 text-[10px] text-muted-foreground truncate" title={card.hint}>
              {card.hint}
            </div>
          </div>
        );
      })}
    </div>
  );
}
