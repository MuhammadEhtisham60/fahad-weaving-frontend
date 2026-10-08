import React from "react";
import { X, UserPlus, Edit2 } from "lucide-react";
import { UserForm } from "./UserForm.jsx";

export function UserFormModal({ user, onSave, onClose, existingUsers = [] }) {
  const isEdit = Boolean(user?.id);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl max-h-[92vh] rounded-2xl bg-card border border-border shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              {isEdit ? <Edit2 className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="font-bold text-foreground">
                {isEdit ? `Edit User: ${user.fullName}` : "Create New User Account"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isEdit
                  ? `Update personal details, work assignments, and security credentials`
                  : "Onboard a new user into the factory management system"}
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

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-custom">
          <UserForm
            initialData={user}
            existingUsers={existingUsers}
            onSave={(data) => {
              onSave(data);
              onClose();
            }}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
