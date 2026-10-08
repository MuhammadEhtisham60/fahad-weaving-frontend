import React, { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, Plus, ArrowLeft, UserPlus } from "lucide-react";
import { PageHeader, Button } from "../../components/ui-kit.jsx";
import { useUserStore } from "./utils/userStore.js";
import { RoleTable } from "./table/RoleTable.jsx";
import { RoleDetailModal } from "./detail/RoleDetailModal.jsx";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal.jsx";

export const Route = createFileRoute("/user-management/roles/")({
  component: RolesIndexPage,
});

function RolesIndexPage() {
  const navigate = useNavigate();
  const { roles, deleteRole } = useUserStore();
  const [isRoleDetailOpen, setIsRoleDetailOpen] = useState(false);
  const [selectedRoleForDetail, setSelectedRoleForDetail] = useState(null);

  const [isDeleteRoleOpen, setIsDeleteRoleOpen] = useState(false);
  const [selectedRoleForDelete, setSelectedRoleForDelete] = useState(null);

  const handleOpenAdd = () => {
    navigate({ to: "/user-management/roles/add" });
  };

  const handleOpenEdit = (role) => {
    navigate({ to: `/user-management/roles/${role.id}` });
  };

  const handleOpenDetail = (role) => {
    setSelectedRoleForDetail(role);
    setIsRoleDetailOpen(true);
  };

  const handleOpenDelete = (role) => {
    setSelectedRoleForDelete(role);
    setIsDeleteRoleOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <Link
          to="/user-management"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to User Management
        </Link>
        <PageHeader
          title="Roles & Permissions"
          subtitle={`${roles.length} system and custom operational access profiles`}
          actions={
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleOpenAdd} className="text-xs">
                <Plus className="h-3.5 w-3.5" /> Create New Role
              </Button>
            </div>
          }
        />
      </div>

      <RoleTable
        roles={roles}
        onViewRole={(r) => navigate({ to: `/user-management/roles/${r.id}` })}
        onEditRole={handleOpenEdit}
        onDeleteRole={handleOpenDelete}
        onManagePermissions={(r) => navigate({ to: `/user-management/roles/${r.id}` })}
        onAddRole={handleOpenAdd}
      />

      {isRoleDetailOpen && (
        <RoleDetailModal
          role={selectedRoleForDetail}
          onEditPermissions={handleOpenEdit}
          onClose={() => setIsRoleDetailOpen(false)}
        />
      )}

      {selectedRoleForDelete && (
        <DeleteConfirmModal
          title="Delete Role"
          message="Are you sure you want to delete this custom role? This action cannot be undone."
          itemName={`Role: ${selectedRoleForDelete.name}`}
          onConfirm={() => {
            deleteRole(selectedRoleForDelete.id);
            setSelectedRoleForDelete(null);
          }}
          onClose={() => setSelectedRoleForDelete(null)}
        />
      )}
    </div>
  );
}
