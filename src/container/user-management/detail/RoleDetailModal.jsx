import React from "react";
import { X, ShieldCheck, Edit2, Lock } from "lucide-react";
import { Button } from "../../../components/ui-kit.jsx";
import { PermissionMatrix } from "../components/PermissionMatrix.jsx";

export function RoleDetailModal({ role, onClose, onEditPermissions }) {
  if (!role) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] rounded-3xl bg-card border border-border shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">{role.name}</h3>
                {role.isSystem && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                    <Lock className="h-2.5 w-2.5" /> System Protected
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{role.description}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 scrollbar-custom space-y-6">
          <div className="p-4 rounded-2xl bg-muted/20 border border-border">
            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider block mb-2">
              Description & Scope
            </span>
            <p className="text-sm text-foreground leading-relaxed">
              {role.description || "No description available for this role."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-muted/40 border border-border">
              <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider block">
                Total Assigned Users
              </span>
              <span className="text-2xl font-black text-foreground font-mono mt-1 block">
                {role.userCount || 0}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border">
              <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider block">
                Granted Permissions
              </span>
              <span className="text-2xl font-black text-primary font-mono mt-1 block">
                {role.permissions?.length || 0}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border">
              <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider block">
                Role Status
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 mt-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {role.status || "Active"}
              </span>
            </div>
          </div>

          <PermissionMatrix
            selectedPermissions={role.permissions || []}
            readOnly={true}
            roleName={role.name}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-end gap-3 bg-muted/20">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEditPermissions && (
            <Button
              onClick={() => {
                onClose();
                onEditPermissions(role);
              }}
            >
              <Edit2 className="h-4 w-4" /> Edit Role Permissions
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
