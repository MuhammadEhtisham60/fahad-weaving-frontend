import React from "react";
import { X } from "lucide-react";
import { UserDetailView } from "./UserDetailView.jsx";

export function UserDetailModal({
  user,
  onClose,
  onEdit,
  onDelete,
  onResetPassword,
  onToggleStatus,
  activities = [],
  roles = [],
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] rounded-3xl bg-background border border-border shadow-2xl flex flex-col overflow-hidden">
        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-card/80 hover:bg-card text-foreground shadow-md backdrop-blur-sm transition-transform hover:scale-105"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-custom">
          <UserDetailView
            user={user}
            onEdit={(u) => {
              onClose();
              onEdit && onEdit(u);
            }}
            onDelete={(u) => {
              onClose();
              onDelete && onDelete(u);
            }}
            onResetPassword={(u) => {
              onClose();
              onResetPassword && onResetPassword(u);
            }}
            onToggleStatus={onToggleStatus}
            activities={activities}
            roles={roles}
          />
        </div>
      </div>
    </div>
  );
}
