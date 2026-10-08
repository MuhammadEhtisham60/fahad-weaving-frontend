import React, { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Download, ArrowLeft, ShieldCheck } from "lucide-react";
import { PageHeader, Button } from "../../components/ui-kit.jsx";
import { useUserStore } from "./utils/userStore.js";
import { UserTable } from "./table/UserTable.jsx";
import { UserStatsCards } from "./components/UserStatsCards.jsx";
import { ResetPasswordModal } from "./components/ResetPasswordModal.jsx";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal.jsx";
import { downloadUsersPdf } from "./utils/userPdfExport.js";

export const Route = createFileRoute("/user-management/users/")({
  component: UsersListPage,
});

function UsersListPage() {
  const navigate = useNavigate();
  const {
    users,
    stats,
    updateUser,
    deleteUser,
    toggleStatus,
    resetPassword,
  } = useUserStore();

  const [selectedUserForPwd, setSelectedUserForPwd] = useState(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState(null);

  return (
    <div className="space-y-6 pb-12">
      <div className="mb-2">
        <Link
          to="/user-management"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to User Management Hub
        </Link>
        <PageHeader
          title="Users Directory"
          subtitle={`${users.length} registered ERP team accounts across all factory divisions`}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadUsersPdf(users, "Users List")}
                className="text-xs"
              >
                <Download className="h-3.5 w-3.5" /> Export PDF
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate({ to: "/user-management/roles/add" })}
                className="text-xs"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Add Role
              </Button>
              <Button
                type="button"
                size="sm"
                className="text-xs"
                onClick={() => navigate({ to: "/user-management/users/add" })}
              >
                <Plus className="h-3.5 w-3.5" /> Add New User
              </Button>
            </div>
          }
        />
      </div>

      <UserStatsCards stats={stats} />

      <UserTable
        users={users}
        onViewUser={(u) => navigate({ to: `/user-management/users/${u.id}` })}
        onEditUser={(u) => navigate({ to: `/user-management/users/${u.id}/edit` })}
        onDeleteUser={(u) => setSelectedUserForDelete(u)}
        onToggleStatus={(id, st) => toggleStatus(id, st)}
        onResetPassword={(u) => setSelectedUserForPwd(u)}
        onAddUser={() => navigate({ to: "/user-management/users/add" })}
      />

      {selectedUserForPwd && (
        <ResetPasswordModal
          user={selectedUserForPwd}
          onConfirm={(id, pwd) => {
            resetPassword(id, pwd);
            setSelectedUserForPwd(null);
          }}
          onClose={() => setSelectedUserForPwd(null)}
        />
      )}

      {selectedUserForDelete && (
        <DeleteConfirmModal
          title="Delete User Account"
          message="Are you sure you want to delete this user? This action cannot be undone."
          itemName={`${selectedUserForDelete.fullName} (@${selectedUserForDelete.username})`}
          onConfirm={() => {
            deleteUser(selectedUserForDelete.id);
            setSelectedUserForDelete(null);
          }}
          onClose={() => setSelectedUserForDelete(null)}
        />
      )}
    </div>
  );
}
