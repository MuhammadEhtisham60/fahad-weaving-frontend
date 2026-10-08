import React, { useState } from "react";
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Lock,
  Search,
  Users,
  KeyRound,
  Shield,
  Layers,
  Copy,
} from "lucide-react";
import { Button } from "../../../components/ui-kit.jsx";
import { ALL_PERMISSION_IDS } from "../utils/constants.js";

export function RoleTable({
  roles = [],
  onViewRole,
  onEditRole,
  onDeleteRole,
  onManagePermissions,
  onAddRole,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRoles = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles by title or scope..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted border border-transparent focus:bg-background focus:border-ring outline-none text-xs"
          />
        </div>

        {/* {onAddRole && (
          <Button type="button" size="sm" onClick={onAddRole} className="text-xs shrink-0">
            <Plus className="h-3.5 w-3.5" /> Add New Role
          </Button>
        )} */}
      </div>

      {/* Roles Table */}
      <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/70 text-muted-foreground uppercase font-bold tracking-wider text-[10px] border-b border-border">
              <tr>
                <th className="p-3.5">Role Name</th>
                <th className="p-3.5 text-center">Assigned Users</th>
                <th className="p-3.5 text-center">Granted Permissions</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRoles.map((role) => {
                const isSuperAdmin = role.name === "Super Admin";
                const permCount = role.permissions ? role.permissions.length : 0;
                const totalPerms = ALL_PERMISSION_IDS.length;
                const permPercentage = Math.round((permCount / totalPerms) * 100);

                return (
                  <tr key={role.id} className="hover:bg-muted/40 transition-colors">
                    {/* Role Title & System Badge */}
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        {/* <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <ShieldCheck className="h-4 w-4" />
                        </div> */}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground">{role.name}</span>
                            {role.isSystem && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                                <Lock className="h-2.5 w-2.5" /> System
                              </span>
                            )}
                          </div>
                          {/* <span className="text-[10px] text-muted-foreground font-mono">
                            {role.id}
                          </span> */}
                        </div>
                      </div>
                    </td>


                    {/* Users Count */}
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 font-mono">
                        <Users className="h-3 w-3" />
                        {role.userCount || 0}
                      </span>
                    </td>

                    {/* Permissions Badge & Progress */}
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <div className="inline-flex flex-col items-center gap-1">
                        <span className="text-xs font-bold text-foreground font-mono">
                          {permCount} / {totalPerms}{" "}
                          <span className="text-muted-foreground text-[10px]">({permPercentage}%)</span>
                        </span>
                        <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              permPercentage > 75
                                ? "bg-primary"
                                : permPercentage > 40
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                            }`}
                            style={{ width: `${permPercentage}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {role.status || "Active"}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onViewRole && onViewRole(role)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                          title="View Role Scope"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onManagePermissions && onManagePermissions(role)}
                          className="p-1.5 rounded-lg text-primary hover:bg-primary/10 font-bold"
                          title="Configure Permission Matrix"
                        >
                          <ShieldCheck className="h-4 w-4" />
                        </button>
                        {!role.isSystem && (
                          <button
                            type="button"
                            onClick={() => onEditRole && onEditRole(role)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                            title="Edit Role Details"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}
                        {!role.isSystem && (
                          <button
                            type="button"
                            onClick={() => onDeleteRole && onDeleteRole(role)}
                            className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10"
                            title="Delete Custom Role"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredRoles.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No roles found matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
