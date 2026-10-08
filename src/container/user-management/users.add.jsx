import React, { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { PageHeader } from "../../components/ui-kit.jsx";
import { useUserStore } from "./utils/userStore.js";
import { UserForm } from "./form/UserForm.jsx";

export const Route = createFileRoute("/user-management/users/add")({
  component: AddUserPage,
});

function AddUserPage() {
  const navigate = useNavigate();
  const { users, addUser } = useUserStore();
  const [apiError, setApiError] = useState("");
  const [fieldErrors, setFieldErrors] = useState(null);

  const handleSave = async (userData) => {
    setApiError("");
    setFieldErrors(null);
    try {
      await addUser(userData);
      navigate({ to: "/user-management" });
    } catch (err) {
      console.error("User creation API failed:", err);
      const errorMsg =
        err?.data?.message ||
        err?.data?.detail ||
        (typeof err?.data === "string" ? err.data : null) ||
        err?.message ||
        "Failed to create user account. Please check the information and try again.";
      setApiError(errorMsg);

      if (err?.data?.errors) {
        setFieldErrors(err.data.errors);
      }
      throw err;
    }
  };

  return (
    <div className="mx-0 space-y-6 pb-12">
      <div>
        <Link
          to="/user-management"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to User Management
        </Link>
        <PageHeader
          title="Onboard New User"
          subtitle="Create a new ERP user profile, assign departmental roles, set access scopes and credentials"
        />
      </div>

      {apiError && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-bold text-destructive flex items-center gap-2 animate-in fade-in duration-200">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      <UserForm
        existingUsers={users}
        onSave={handleSave}
        onCancel={() => navigate({ to: "/user-management" })}
        apiError={fieldErrors || apiError}
      />
    </div>
  );
}
