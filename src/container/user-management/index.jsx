import React, { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  UserCog,
  Users,
  ShieldCheck,
  History,
  Plus,
  Download,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { PageHeader, Button } from "../../components/ui-kit.jsx";
import { useUserStore } from "./utils/userStore.js";
import { UserStatsCards } from "./components/UserStatsCards.jsx";
import { UserNavigationTabs } from "./components/UserNavigationTabs.jsx";
import { UserTable } from "./table/UserTable.jsx";
import { RoleTable } from "./table/RoleTable.jsx";
import { RoleDetailModal } from "./detail/RoleDetailModal.jsx";
import { ResetPasswordModal } from "./components/ResetPasswordModal.jsx";
import { QuickStatusModal } from "./components/QuickStatusModal.jsx";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal.jsx";
import { downloadUsersPdf } from "./utils/userPdfExport.js";
import { useTranslation } from "../../context/LanguageContext.jsx";

export const Route = createFileRoute("/user-management/")({
  component: UserManagementDashboardPage,
});

function UserManagementDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    users,
    roles,
    activities,
    stats,
    addUser,
    updateUser,
    deleteUser,
    toggleStatus,
    resetPassword,
    addRole,
    updateRole,
    deleteRole,
  } = useUserStore();

  const [activeTab, setActiveTab] = useState("users"); // users, roles, activity
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");

  // Modal States
  const [isResetPwdOpen, setIsResetPwdOpen] = useState(false);
  const [selectedUserForPwd, setSelectedUserForPwd] = useState(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedUserForStatus, setSelectedUserForStatus] = useState(null);

  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState(null);

  const [isRoleDetailOpen, setIsRoleDetailOpen] = useState(false);
  const [selectedRoleForDetail, setSelectedRoleForDetail] = useState(null);

  const [isDeleteRoleOpen, setIsDeleteRoleOpen] = useState(false);
  const [selectedRoleForDelete, setSelectedRoleForDelete] = useState(null);

  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Stat Card click handler
  const handleStatCardClick = (key) => {
    if (key === "roles") {
      setActiveTab("roles");
    } else {
      setActiveTab("users");
      setActiveStatusFilter(key);
    }
  };

  // User Handlers
  const handleOpenAddUser = () => {
    navigate({ to: "/user-management/users/add" });
  };

  const handleOpenEditUser = (user) => {
    navigate({ to: `/user-management/users/${user.id}/edit` });
  };

  const handleSaveUser = (userData) => {
    if (userData.id) {
      updateUser(userData.id, userData);
      showToast(`User ${userData.fullName} updated successfully.`);
    } else {
      addUser(userData);
      showToast(`New user ${userData.fullName} created successfully.`);
    }
  };

  const handleOpenViewUser = (user) => {
    navigate({ to: `/user-management/users/${user.id}` });
  };

  const handleOpenDeleteUser = (user) => {
    setSelectedUserForDelete(user);
    setIsDeleteUserOpen(true);
  };

  const handleConfirmDeleteUser = () => {
    if (selectedUserForDelete) {
      deleteUser(selectedUserForDelete.id);
      showToast(`User ${selectedUserForDelete.fullName} removed.`);
      setIsDeleteUserOpen(false);
      setSelectedUserForDelete(null);
    }
  };

  const handleOpenResetPassword = (user) => {
    setSelectedUserForPwd(user);
    setIsResetPwdOpen(true);
  };

  const handleConfirmResetPassword = (id, newPassword) => {
    resetPassword(id, newPassword);
    showToast("Password updated successfully.");
    setIsResetPwdOpen(false);
    setSelectedUserForPwd(null);
  };

  const handleToggleStatusQuick = (id, newStatus) => {
    toggleStatus(id, newStatus);
    showToast(`Status updated to ${newStatus}.`);
  };

  // Role Handlers
  const handleOpenAddRole = () => {
    navigate({ to: "/user-management/roles/add" });
  };

  const handleOpenEditRole = (role) => {
    navigate({ to: `/user-management/roles/${role.id}` });
  };

  const handleSaveRole = (roleData) => {
    if (roleData.id) {
      updateRole(roleData.id, roleData);
      showToast(`Role '${roleData.name}' updated successfully.`);
    } else {
      addRole(roleData);
      showToast(`New role '${roleData.name}' created successfully.`);
    }
  };

  const handleOpenViewRole = (role) => {
    setSelectedRoleForDetail(role);
    setIsRoleDetailOpen(true);
  };

  const handleOpenDeleteRole = (role) => {
    setSelectedRoleForDelete(role);
    setIsDeleteRoleOpen(true);
  };

  const handleConfirmDeleteRole = () => {
    if (selectedRoleForDelete) {
      deleteRole(selectedRoleForDelete.id);
      showToast(`Role '${selectedRoleForDelete.name}' deleted.`);
      setIsDeleteRoleOpen(false);
      setSelectedRoleForDelete(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-card border border-emerald-500/30 text-foreground shadow-2xl animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title={t("userManagement.title", "User Management")}
        subtitle={t("userManagement.subtitle", "Manage factory ERP user accounts, role definitions, access control matrices, and audit logs")}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => downloadUsersPdf(users, "Complete Registry")}
              className="text-xs"
            >
              <Download className="h-3.5 w-3.5" /> {t("common.export", "Export PDF")}
            </Button>
          </div>
        }
      />

      {/* Dashboard Statistics Overview */}
      <UserStatsCards
        stats={stats}
        onFilterClick={handleStatCardClick}
        activeFilter={activeTab === "users" ? activeStatusFilter : "roles"}
      />

      {/* Navigation Sub-Tabs */}
      <UserNavigationTabs
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === "users") setActiveStatusFilter("all");
        }}
        usersCount={users.length}
        rolesCount={roles.length}
        onAddUser={handleOpenAddUser}
        onAddRole={handleOpenAddRole}
      />

      {/* Tab 1: Users Directory */}
      {activeTab === "users" && (
        <UserTable
          users={users}
          initialStatusFilter={activeStatusFilter}
          onViewUser={handleOpenViewUser}
          onEditUser={handleOpenEditUser}
          onDeleteUser={handleOpenDeleteUser}
          onToggleStatus={handleToggleStatusQuick}
          onResetPassword={handleOpenResetPassword}
          onAddUser={handleOpenAddUser}
        />
      )}

      {/* Tab 2: Roles & Permissions */}
      {activeTab === "roles" && (
        <RoleTable
          roles={roles}
          onViewRole={handleOpenViewRole}
          onEditRole={handleOpenEditRole}
          onDeleteRole={handleOpenDeleteRole}
          onManagePermissions={(r) => navigate({ to: `/user-management/roles/${r.id}` })}
          onAddRole={handleOpenAddRole}
        />
      )}

      {/* 3. Reset Password Modal */}
      {isResetPwdOpen && (
        <ResetPasswordModal
          user={selectedUserForPwd}
          onConfirm={handleConfirmResetPassword}
          onClose={() => {
            setIsResetPwdOpen(false);
            setSelectedUserForPwd(null);
          }}
        />
      )}

      {/* 4. Delete User Confirmation Modal */}
      {isDeleteUserOpen && (
        <DeleteConfirmModal
          title="Delete User Account"
          message="Are you sure you want to permanently delete this user account? All access will be revoked immediately."
          itemName={`${selectedUserForDelete?.fullName} (@${selectedUserForDelete?.username})`}
          onConfirm={handleConfirmDeleteUser}
          onClose={() => {
            setIsDeleteUserOpen(false);
            setSelectedUserForDelete(null);
          }}
        />
      )}

      {/* 6. Role Detail Modal */}
      {isRoleDetailOpen && (
        <RoleDetailModal
          role={selectedRoleForDetail}
          onEditPermissions={handleOpenEditRole}
          onClose={() => {
            setIsRoleDetailOpen(false);
            setSelectedRoleForDetail(null);
          }}
        />
      )}

      {/* 7. Delete Role Confirmation Modal */}
      {isDeleteRoleOpen && (
        <DeleteConfirmModal
          title="Delete Custom Role"
          message="Are you sure you want to delete this custom role? Users assigned to this role will lose their granted permissions."
          itemName={`Role: ${selectedRoleForDelete?.name}`}
          onConfirm={handleConfirmDeleteRole}
          onClose={() => {
            setIsDeleteRoleOpen(false);
            setSelectedRoleForDelete(null);
          }}
        />
      )}
    </div>
  );
}
