import React, { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, Save, AlertTriangle } from "lucide-react";
import { PageHeader, Button } from "../../components/ui-kit.jsx";
import { useUserStore } from "./utils/userStore.js";
import { PermissionMatrix } from "./components/PermissionMatrix.jsx";
import { InputField, SelectField, TextareaField } from "../../common/sharefield/index.js";

export const Route = createFileRoute("/user-management/roles/add")({
  component: AddRolePage,
});

function AddRolePage() {
  const navigate = useNavigate();
  const { addRole } = useUserStore();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Active",
    permissions: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (field) => (e) => {
    const value = e && e.target !== undefined ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handlePermissionsChange = (newPerms) => {
    setFormData((prev) => ({ ...prev, permissions: newPerms }));
    if (errors.permissions) setErrors((prev) => ({ ...prev, permissions: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Role name is required.";
    }
    if (formData.permissions.length === 0) {
      newErrors.permissions = "Please grant at least one permission to this role.";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setIsSubmitting(true);
    try {
      await addRole(formData);
      setIsSubmitting(false);
      navigate({ to: "/user-management/roles" });
    } catch (err) {
      console.error("Role creation API error:", err);
      const errorMsg =
        err?.data?.message ||
        err?.data?.detail ||
        (typeof err?.data === "string" ? err.data : null) ||
        err?.message ||
        "Failed to create role. Please check the provided details and try again.";
      setErrors({ api: errorMsg });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-0 space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <Link
          to="/user-management/roles"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Roles &amp; Permissions
        </Link>
        <PageHeader
          title="Create New System Role"
          subtitle="Define a new access authorization profile with module-level operational boundaries"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Banner */}
        {Object.keys(errors).length > 0 && (
          <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errors.api || "Please fix the highlighted errors before saving."}</span>
          </div>
        )}

        {/* Role Metadata Card */}
        <div className="rounded-2xl bg-card border border-border p-6 shadow-card space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-foreground">Role Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Role Title"
              name="name"
              id="role-name"
              type="text"
              value={formData.name}
              onChange={handleFieldChange("name")}
              placeholder="e.g. Sizing Inspector"
              required
              error={errors.name}
            />

            <SelectField
              label="Status"
              name="status"
              id="role-status"
              value={formData.status}
              onChange={handleFieldChange("status")}
              options={[
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" },
              ]}
            />

            <div className="sm:col-span-2">
              <TextareaField
                label="Role Description & Scope"
                name="description"
                id="role-description"
                value={formData.description}
                onChange={handleFieldChange("description")}
                placeholder="e.g. Has operational access to yarn sizing batches, recipe tracking, and beam length logs."
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Permission Matrix */}
        <div>
          {errors.permissions && (
            <div className="mb-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errors.permissions}</span>
            </div>
          )}
          <PermissionMatrix
            selectedPermissions={formData.permissions}
            onChange={handlePermissionsChange}
            roleName={formData.name}
          />
        </div>

        {/* Footer Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/user-management/roles" })}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4" />
            <span>{isSubmitting ? "Saving Role..." : "Save New Role"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
