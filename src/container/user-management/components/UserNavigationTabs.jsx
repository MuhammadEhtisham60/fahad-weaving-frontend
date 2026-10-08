import React from "react";
import { Users, ShieldCheck, UserPlus } from "lucide-react";
import { useTranslation } from "../../../context/LanguageContext.jsx";

export function UserNavigationTabs({
  activeTab,
  onTabChange,
  usersCount,
  rolesCount,
  onAddUserClick,
  onAddRoleClick,
}) {
  const { t } = useTranslation();

  const tabs = [
    {
      id: "users",
      label: t("userManagement.usersTab", "Users Directory"),
      icon: Users,
      count: usersCount,
    },
    {
      id: "roles",
      label: t("userManagement.rolesTab", "Roles & Permissions"),
      icon: ShieldCheck,
      count: rolesCount,
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 p-1.5 rounded-2xl bg-card border border-border shadow-sm">
      <div className="flex flex-wrap items-center gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? "bg-gradient-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold font-mono ${
                    isActive
                      ? "bg-white/25 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {onAddRoleClick && (
          <button
            type="button"
            onClick={onAddRoleClick}
            className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-smooth ${
              activeTab === "roles"
                ? "bg-primary text-primary-foreground shadow-sm hover:opacity-95"
                : "bg-muted hover:bg-muted/80 text-foreground border border-border"
            }`}
          >
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>{t("userManagement.createRole", "Add Role")}</span>
          </button>
        )}
        {onAddUserClick && (
          <button
            type="button"
            onClick={onAddUserClick}
            className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-smooth ${
              activeTab === "users"
                ? "bg-primary text-primary-foreground shadow-sm hover:opacity-95"
                : "bg-muted hover:bg-muted/80 text-foreground border border-border"
            }`}
          >
            <UserPlus className="h-4 w-4 shrink-0" />
            <span>{t("userManagement.addUser", "Add User")}</span>
          </button>
        )}
      </div>
    </div>
  );
}
