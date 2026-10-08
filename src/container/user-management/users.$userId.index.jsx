import React, { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useUserStore } from "./utils/userStore.js";
import { UserDetailView } from "./detail/UserDetailView.jsx";
import { ResetPasswordModal } from "./components/ResetPasswordModal.jsx";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal.jsx";

export const Route = createFileRoute("/user-management/users/$userId/")({
  component: UserDetailsPage,
});

function UserDetailsPage() {
  const { userId } = Route.useParams();
  const navigate = useNavigate();
  const {
    users,
    roles,
    activities,
    deleteUser,
    toggleStatus,
    resetPassword,
  } = useUserStore();

  const user = users.find(
    (u) => String(u.id) === String(userId) || (u.rawId && String(u.rawId) === String(userId))
  );

  const [isResetPwdOpen, setIsResetPwdOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <div className="mx-0 space-y-6 pb-12">
      <UserDetailView
        user={user}
        roles={roles}
        activities={activities}
        onBack={() => navigate({ to: "/user-management" })}
        onEdit={(u) => navigate({ to: `/user-management/users/${u.id}/edit` })}
        onDelete={() => setIsDeleteOpen(true)}
        onResetPassword={() => setIsResetPwdOpen(true)}
        onToggleStatus={(id, st) => toggleStatus(id, st)}
      />

      {isResetPwdOpen && user && (
        <ResetPasswordModal
          user={user}
          onConfirm={(id, pwd) => {
            resetPassword(id, pwd);
            setIsResetPwdOpen(false);
          }}
          onClose={() => setIsResetPwdOpen(false)}
        />
      )}

      {isDeleteOpen && user && (
        <DeleteConfirmModal
          title="Delete User Account"
          message="Are you sure you want to permanently delete this user account? This cannot be undone."
          itemName={`${user.fullName} (@${user.username})`}
          onConfirm={() => {
            deleteUser(user.id);
            setIsDeleteOpen(false);
            navigate({ to: "/user-management" });
          }}
          onClose={() => setIsDeleteOpen(false)}
        />
      )}
    </div>
  );
}
