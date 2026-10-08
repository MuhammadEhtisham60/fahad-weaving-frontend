import React, { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { PageHeader, Button } from "../../components/ui-kit.jsx";
import { useUserStore } from "./utils/userStore.js";
import { UserForm } from "./form/UserForm.jsx";

export const Route = createFileRoute("/user-management/users/$userId/edit")({
  component: EditUserPage,
});

function EditUserPage() {
  const { userId } = Route.useParams();
  const navigate = useNavigate();
  const { users, updateUser } = useUserStore();
  const [apiError, setApiError] = useState("");
  const [fieldErrors, setFieldErrors] = useState(null);

  const user = users.find(
    (u) => String(u.id) === String(userId) || (u.rawId && String(u.rawId) === String(userId))
  );

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center bg-card rounded-2xl border border-border">
        <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-foreground">User Not Found</h3>
        <p className="text-xs text-muted-foreground mt-1">
          The user record you are trying to edit does not exist.
        </p>
        <Link to="/user-management">
          <Button variant="outline" className="mt-4 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to User Management
          </Button>
        </Link>
      </div>
    );
  }

  const handleSave = async (userData) => {
    setApiError("");
    setFieldErrors(null);
    try {
      await updateUser(user.id, userData);
      navigate({ to: `/user-management/users/${user.id}` });
    } catch (err) {
      console.error("Failed to update user:", err);
      const errorMsg =
        err?.data?.message ||
        err?.data?.detail ||
        (typeof err?.data === "string" ? err.data : null) ||
        err?.message ||
        "Failed to update user. Please check the information and try again.";
      setApiError(errorMsg);
      if (err?.data?.errors) {
        setFieldErrors(err.data.errors);
      }
      throw err;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div>
        <Link
          to={`/user-management/users/${user.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to User Profile
        </Link>
        <PageHeader
          title={`Edit User: ${user.fullName}`}
          subtitle={`Update account credentials, department allocation, and contact details for @${user.username}`}
        />
      </div>

      {apiError && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-bold text-destructive flex items-center gap-2 animate-in fade-in duration-200">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      <UserForm
        initialData={user}
        existingUsers={users}
        onSave={handleSave}
        onCancel={() => navigate({ to: `/user-management/users/${user.id}` })}
        apiError={fieldErrors || apiError}
      />
    </div>
  );
}
