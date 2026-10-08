import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  Lock,
  MapPin,
  Clock,
  Shield,
  ShieldCheck,
  KeyRound,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Printer,
  History,
  Info,
  ShieldAlert,
  Smartphone,
  Globe,
} from "lucide-react";
import { Button, StatusBadge } from "../../../components/ui-kit.jsx";
import { PermissionMatrix } from "../components/PermissionMatrix.jsx";
import { ActivityTimeline } from "../components/ActivityTimeline.jsx";
import { INITIAL_ROLES } from "../utils/constants.js";

export function UserDetailView({
  user,
  onEdit,
  onDelete,
  onResetPassword,
  onToggleStatus,
  activities = [],
  roles = INITIAL_ROLES,
  onBack,
}) {
  const [activeTab, setActiveTab] = useState("overview"); // overview, work, account, permissions, activity

  if (!user) {
    return (
      <div className="p-12 text-center bg-card rounded-2xl border border-border">
        <ShieldAlert className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-foreground">User Record Not Found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          The requested user account does not exist or has been removed.
        </p>
        {onBack && (
          <Button onClick={onBack} variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4" /> Back to User Directory
          </Button>
        )}
      </div>
    );
  }

  // Find user's role definition to show permissions
  const userRole = roles.find((r) => r.name === user.role) || {
    permissions: [],
    name: user.role,
  };

  // Filter activities for this user
  const userActivities = activities.filter(
    (act) => act.username === user.username || act.userId === user.id
  );

  const getStatusChip = (status) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "Inactive":
        return "bg-muted text-muted-foreground border-border";
      case "Suspended":
        return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
      case "Pending":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "Super Admin":
        return "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30";
      case "Admin":
        return "bg-primary/15 text-primary border-primary/30";
      case "Production Manager":
        return "bg-emerald-500/15 text-emerald-600 border-emerald-500/30";
      case "Accountant":
        return "bg-amber-500/15 text-amber-600 border-amber-500/30";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Back & Top Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Users Directory
          </button>
        )}

        <div className="flex flex-wrap items-center gap-2 ml-auto">

          {onResetPassword && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onResetPassword(user)}
              className="text-xs"
            >
              <KeyRound className="h-3.5 w-3.5" /> Reset Password
            </Button>
          )}
          {onToggleStatus && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                onToggleStatus(
                  user.id,
                  user.status === "Active" ? "Inactive" : "Active"
                )
              }
              className={`text-xs ${
                user.status === "Active"
                  ? "text-amber-500 hover:text-amber-600"
                  : "text-emerald-500 hover:text-emerald-600"
              }`}
            >
              {user.status === "Active" ? (
                <>
                  <XCircle className="h-3.5 w-3.5" /> Deactivate
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Activate
                </>
              )}
            </Button>
          )}
          {onEdit && (
            <Button type="button" size="sm" onClick={() => onEdit(user)} className="text-xs">
              <Edit2 className="h-3.5 w-3.5" /> Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Profile Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-card border border-border shadow-card">
        <div className="h-32 bg-gradient-to-r from-primary via-purple-600 to-indigo-700 relative opacity-90">
          <div className="absolute inset-0 bg-black/10" />
        </div>

        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 -mt-16 mb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <img
                src={user.avatar}
                alt={user.fullName}
                className="h-28 w-28 rounded-2xl object-cover ring-4 ring-card shadow-xl bg-card"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-black text-foreground">{user.fullName}</h2>
                  <span className="font-mono text-sm font-bold text-primary">
                    @{user.username}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getStatusChip(
                      user.status
                    )}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {user.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap font-medium">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[11px] border ${getRoleBadge(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                  <span>·</span>
                  <span className="text-foreground font-semibold">{user.designation || "Staff"}</span>
                  <span>·</span>
                  <span className="font-mono text-muted-foreground">{user.id}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-500" />
                <span className="font-medium text-foreground">{user.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-t border-border flex items-center gap-2 overflow-x-auto">
          {[
            { id: "overview", label: "Personal & Contact", icon: User },
            { id: "account", label: "Account & Security", icon: Lock },
            { id: "permissions", label: "Assigned Permissions", icon: ShieldCheck },
            { id: "activity", label: `User Activity (${userActivities.length})`, icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Personal & Contact */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information Card */}
          <div className="rounded-2xl bg-card border border-border p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <User className="h-5 w-5 text-primary" />
              <h4 className="font-bold text-foreground">Personal Profile</h4>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  Full Name
                </span>
                <span className="font-semibold text-foreground text-sm">{user.fullName || user.username}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  Username
                </span>
                <span className="font-mono font-bold text-primary text-sm">@{user.username}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  Gender
                </span>
                <span className="font-medium text-foreground">{user.gender || "—"}</span>
              </div>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="rounded-2xl bg-card border border-border p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <MapPin className="h-5 w-5 text-primary" />
              <h4 className="font-bold text-foreground">Contact & Address</h4>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  Email Address
                </span>
                <span className="font-semibold text-foreground">{user.email || "—"}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  Primary Mobile
                </span>
                <span className="font-semibold text-foreground">{user.phone || "—"}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  Residential Address
                </span>
                <span className="font-medium text-foreground">{user.address || "—"}</span>
              </div>
            </div>
          </div>

          {/* Notes Card */}
          {user.notes && (
            <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-6 shadow-card space-y-2">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Info className="h-4 w-4 text-primary" />
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
                  Administrative Remarks
                </h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{user.notes}</p>
            </div>
          )}
        </div>
      )}



      {/* Tab 3: Account & Security */}
      {activeTab === "account" && (
        <div className="rounded-2xl bg-card border border-border p-6 shadow-card space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Lock className="h-5 w-5 text-primary" />
            <h4 className="font-bold text-foreground">Account Status & Security Policies</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                Account Status
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mt-2 border ${getStatusChip(
                  user.status
                )}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {user.status}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                System Role
              </span>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mt-2 border ${getRoleBadge(
                  user.role
                )}`}
              >
                {user.role}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                Designation
              </span>
              <span className="font-bold text-foreground text-sm mt-2 block">
                {user.designation || "Staff Member"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                Two-Factor Auth (2FA)
              </span>
              <span
                className={`inline-flex items-center gap-1 text-xs font-bold mt-2 ${
                  user.twoFactorEnabled ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {user.twoFactorEnabled ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Enabled
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4" /> Not Configured
                  </>
                )}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                Last Active Login
              </span>
              <span className="font-mono font-bold text-foreground text-sm mt-1 block">
                {user.lastLogin || "Never"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                Account Expiry Date
              </span>
              <span className="font-mono font-bold text-foreground text-sm mt-1 block">
                {user.accountExpiry || "2030-12-31"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                Created Date
              </span>
              <span className="font-mono font-semibold text-foreground text-sm mt-1 block">
                {user.createdDate || "2024-01-01"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Assigned Permissions */}
      {activeTab === "permissions" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between">
            <div>
              <h4 className="font-bold text-foreground">
                Permissions Inherited from Role: {user.role}
              </h4>
              <p className="text-xs text-muted-foreground">
                This user has access to {userRole.permissions?.length || 0} active operations based
                on their {user.role} assignment.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/20">
              {userRole.permissions?.length || 0} Permissions
            </span>
          </div>

          <PermissionMatrix
            selectedPermissions={userRole.permissions || []}
            readOnly={true}
            roleName={user.role}
          />
        </div>
      )}

      {/* Tab 5: User Activity */}
      {activeTab === "activity" && (
        <div className="space-y-4">
          <ActivityTimeline activities={userActivities} users={[user]} />
        </div>
      )}
    </div>
  );
}
