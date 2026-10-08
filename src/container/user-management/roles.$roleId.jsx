import React, { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, ArrowLeft, Save, Lock, AlertTriangle } from "lucide-react";
import { PageHeader, Button } from "../../components/ui-kit.jsx";
import { useUserStore } from "./utils/userStore.js";
import { PermissionMatrix } from "./components/PermissionMatrix.jsx";

export const Route = createFileRoute("/user-management/roles/$roleId")({
  component: RoleDetailPage,
});

function RoleDetailPage() {
  const { roleId } = Route.useParams();
  const navigate = useNavigate();
  const { roles, updateRole } = useUserStore();

  const role = roles.find((r) => String(r.id) === String(roleId));

  const [selectedPermissions, setSelectedPermissions] = useState(() =>
    role?.permissions ? [...role.permissions] : []
  );
  const [description, setDescription] = useState(role?.description || "");
  const [isSaved, setIsSaved] = useState(false);

  if (!role) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center bg-card rounded-2xl border border-border">
        <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-foreground">Role Not Found</h3>
        <p className="text-xs text-muted-foreground mt-1">
          The requested role definition does not exist in the system.
        </p>
        <Link to="/user-management/roles">
          <Button variant="outline" className="mt-4 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Roles
          </Button>
        </Link>
      </div>
    );
  }

  const handleSave = () => {
    updateRole(role.id, {
      ...role,
      description,
      permissions: selectedPermissions,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/user-management/roles"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Roles & Permissions
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{role.name}</h1>
            {role.isSystem && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                <Lock className="h-3 w-3" /> System Role
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Configure system module permissions and feature boundaries for {role.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSaved && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              Changes Saved!
            </span>
          )}
          <Button onClick={handleSave}>
            <Save className="h-4 w-4" /> Save Permission Changes
          </Button>
        </div>
      </div>

      {/* Role Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
            Assigned Users
          </span>
          <span className="text-2xl font-black text-foreground font-mono mt-1 block">
            {role.userCount || 0} Team Members
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
            Active Permissions
          </span>
          <span className="text-2xl font-black text-primary font-mono mt-1 block">
            {selectedPermissions.length} Capabilities Granted
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
            Role Status
          </span>
          <span className="text-sm font-bold text-emerald-600 mt-2 block">
            ● {role.status || "Active"}
          </span>
        </div>
      </div>

      {/* Description Field */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
          Role Scope Description
        </label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 rounded-xl bg-muted border border-transparent focus:bg-background focus:border-ring outline-none text-xs leading-relaxed"
        />
      </div>

      {/* Permission Matrix */}
      <PermissionMatrix
        selectedPermissions={selectedPermissions}
        onChange={setSelectedPermissions}
        roleName={role.name}
      />
    </div>
  );
}
