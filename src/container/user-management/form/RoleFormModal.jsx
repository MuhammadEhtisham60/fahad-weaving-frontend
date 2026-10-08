import React, { useState } from "react";
import { X, ShieldCheck, Save, AlertTriangle } from "lucide-react";
import { Button } from "../../../components/ui-kit.jsx";
import { PermissionMatrix } from "../components/PermissionMatrix.jsx";

export function RoleFormModal({ role, onSave, onClose }) {
  const isEdit = Boolean(role?.id);

  const [formData, setFormData] = useState(() => ({
    id: role?.id || "",
    name: role?.name || "",
    description: role?.description || "",
    status: role?.status || "Active",
    permissions: role?.permissions ? [...role.permissions] : [],
    isSystem: role?.isSystem ?? false,
  }));

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Role name is required.");
      return;
    }
    if (formData.permissions.length === 0) {
      setError("Please grant at least one permission to this role.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onSave(formData);
      setIsSubmitting(false);
      onClose();
    }, 300);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] rounded-2xl bg-card border border-border shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">
                {isEdit ? `Configure Role: ${role.name}` : "Create New System Role"}
              </h3>
              <p className="text-xs text-muted-foreground">
                Define access authorization scope and module operational boundaries
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-custom space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Metadata Inputs */}
          <div className="rounded-2xl bg-card border border-border p-5 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Role Title <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  disabled={formData.isSystem}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, name: e.target.value }));
                    setError("");
                  }}
                  placeholder="e.g. Sizing Inspector"
                  className="w-full h-10 px-3 rounded-xl bg-muted border border-transparent focus:bg-background focus:border-ring outline-none text-xs font-bold disabled:opacity-60"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full h-10 px-3 rounded-xl bg-muted border border-transparent focus:bg-background focus:border-ring outline-none text-xs font-semibold"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Role Description & Scope
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="e.g. Has operational access to yarn sizing batches, recipe tracking, and beam length logs."
                  className="w-full p-3 rounded-xl bg-muted border border-transparent focus:bg-background focus:border-ring outline-none text-xs"
                />
              </div>
            </div>
          </div>

          {/* Permission Matrix */}
          <div>
            <PermissionMatrix
              selectedPermissions={formData.permissions}
              onChange={(newPerms) => {
                setFormData((prev) => ({ ...prev, permissions: newPerms }));
                setError("");
              }}
              roleName={formData.name}
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border sticky bottom-0 bg-card py-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? "Saving..." : isEdit ? "Update Role" : "Save New Role"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
