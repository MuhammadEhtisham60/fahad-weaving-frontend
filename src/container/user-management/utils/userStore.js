import { useState, useEffect } from "react";
import {
  INITIAL_USERS,
  INITIAL_ROLES,
  INITIAL_ACTIVITIES,
  COMPANIES,
  BRANCHES,
  DEPARTMENTS,
  DESIGNATIONS,
  ROLES_LIST,
  USER_STATUSES,
  PERMISSION_MODULES,
  ALL_PERMISSION_IDS,
} from "./constants.js";

const USERS_STORAGE_KEY = "abc_weaving_user_mgmt_users_v1";
const ROLES_STORAGE_KEY = "abc_weaving_user_mgmt_roles_v1";
const ACTIVITIES_STORAGE_KEY = "abc_weaving_user_mgmt_activities_v1";
const STORE_EVENT = "abc_weaving_user_mgmt_change";

function safeGetStorage(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

function safeSetStorage(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(STORE_EVENT, { detail: { key } }));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

// In-memory / storage functions
export function getStoredUsers() {
  return safeGetStorage(USERS_STORAGE_KEY, INITIAL_USERS);
}

export function getStoredRoles() {
  return safeGetStorage(ROLES_STORAGE_KEY, INITIAL_ROLES);
}

export function getStoredActivities() {
  return safeGetStorage(ACTIVITIES_STORAGE_KEY, INITIAL_ACTIVITIES);
}

export function logActivityEvent({
  action,
  description,
  module = "User Management",
  userId = "USR-001",
  username = "admin",
  userFullName = "Muhammad Ahmed",
  status = "Success",
}) {
  const current = getStoredActivities();
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeFormatted = now.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }) + ", " + now.toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const newActivity = {
    id: `act_${Date.now()}`,
    timestamp: timeFormatted,
    date: dateStr,
    userId,
    username,
    userFullName,
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    action,
    description,
    module,
    ipAddress: "192.168.1.10",
    device: "Chrome on macOS / Windows",
    status,
  };

  const updated = [newActivity, ...current];
  safeSetStorage(ACTIVITIES_STORAGE_KEY, updated);
  return newActivity;
}

export function saveUser(userData, isEdit = false) {
  const currentUsers = getStoredUsers();
  let updatedUsers;
  let savedUser;

  if (isEdit && userData.id) {
    savedUser = {
      ...userData,
      updatedAt: new Date().toISOString(),
    };
    updatedUsers = currentUsers.map((u) => (u.id === userData.id ? { ...u, ...savedUser } : u));

    logActivityEvent({
      action: "Profile Updated",
      description: `Updated profile details for user ${savedUser.fullName} (@${savedUser.username}).`,
      module: "User Management",
    });
  } else {
    const nextNum = currentUsers.length + 1;
    const newId = `USR-${String(nextNum).padStart(3, "0")}`;
    savedUser = {
      ...userData,
      fullName: userData.fullName || userData.username,
      id: userData.id || newId,
      createdDate: userData.createdDate || new Date().toISOString().slice(0, 10),
      lastLogin: "—",
      status: userData.status || "Active",
      avatar: userData.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
    };
    updatedUsers = [savedUser, ...currentUsers];

    logActivityEvent({
      action: "User Created",
      description: `Created new user account for ${savedUser.fullName || savedUser.username} (@${savedUser.username}) with role ${savedUser.role}.`,
      module: "User Management",
    });
  }

  safeSetStorage(USERS_STORAGE_KEY, updatedUsers);
  updateRoleCounts(updatedUsers);
  return savedUser;
}

export function deleteUserById(id) {
  const currentUsers = getStoredUsers();
  const targetUser = currentUsers.find((u) => u.id === id);
  if (!targetUser) return false;

  const updatedUsers = currentUsers.filter((u) => u.id !== id);
  safeSetStorage(USERS_STORAGE_KEY, updatedUsers);

  logActivityEvent({
    action: "User Deleted",
    description: `Permanently removed user account ${targetUser.fullName} (@${targetUser.username}).`,
    module: "User Management",
  });

  updateRoleCounts(updatedUsers);
  return true;
}

export function toggleUserStatus(id, newStatus) {
  const currentUsers = getStoredUsers();
  const targetUser = currentUsers.find((u) => u.id === id);
  if (!targetUser) return null;

  const updatedUsers = currentUsers.map((u) => (u.id === id ? { ...u, status: newStatus } : u));
  safeSetStorage(USERS_STORAGE_KEY, updatedUsers);

  logActivityEvent({
    action: newStatus === "Active" ? "User Activated" : "User Deactivated",
    description: `Changed status for ${targetUser.fullName} (@${targetUser.username}) to ${newStatus}.`,
    module: "User Management",
  });

  return { ...targetUser, status: newStatus };
}

export function resetUserPassword(id, newPassword) {
  const currentUsers = getStoredUsers();
  const targetUser = currentUsers.find((u) => u.id === id);
  if (!targetUser) return false;

  const updatedUsers = currentUsers.map((u) =>
    u.id === id ? { ...u, passwordLastChanged: new Date().toISOString() } : u
  );
  safeSetStorage(USERS_STORAGE_KEY, updatedUsers);

  logActivityEvent({
    action: "Password Changed",
    description: `Admin reset credentials for user ${targetUser.fullName} (@${targetUser.username}).`,
    module: "Security",
  });

  return true;
}

export function saveRole(roleData, isEdit = false) {
  const currentRoles = getStoredRoles();
  let updatedRoles;
  let savedRole;

  if (isEdit && roleData.id) {
    savedRole = { ...roleData };
    updatedRoles = currentRoles.map((r) => (r.id === roleData.id ? { ...r, ...savedRole } : r));

    logActivityEvent({
      action: "Permission Updated",
      description: `Updated permissions and configuration for role '${savedRole.name}'.`,
      module: "Roles & Permissions",
    });
  } else {
    const slug = roleData.name.toLowerCase().replace(/\s+/g, "_");
    savedRole = {
      ...roleData,
      id: roleData.id || `role_${slug}_${Date.now()}`,
      userCount: 0,
      isSystem: false,
      status: roleData.status || "Active",
      color: roleData.color || "primary",
    };
    updatedRoles = [...currentRoles, savedRole];

    logActivityEvent({
      action: "Role Created",
      description: `Created new system role '${savedRole.name}' with ${savedRole.permissions?.length || 0} permissions.`,
      module: "Roles & Permissions",
    });
  }

  safeSetStorage(ROLES_STORAGE_KEY, updatedRoles);
  return savedRole;
}

export function deleteRoleById(id) {
  const currentRoles = getStoredRoles();
  const targetRole = currentRoles.find((r) => r.id === id);
  if (!targetRole || targetRole.isSystem) return false;

  const updatedRoles = currentRoles.filter((r) => r.id !== id);
  safeSetStorage(ROLES_STORAGE_KEY, updatedRoles);

  logActivityEvent({
    action: "Role Deleted",
    description: `Deleted custom role '${targetRole.name}'.`,
    module: "Roles & Permissions",
  });

  return true;
}

function updateRoleCounts(usersList) {
  const currentRoles = getStoredRoles();
  const counts = {};
  usersList.forEach((u) => {
    counts[u.role] = (counts[u.role] || 0) + 1;
  });

  const updatedRoles = currentRoles.map((r) => ({
    ...r,
    userCount: counts[r.name] || 0,
  }));
  safeSetStorage(ROLES_STORAGE_KEY, updatedRoles);
}

export function resetAllToDemoData() {
  safeSetStorage(USERS_STORAGE_KEY, INITIAL_USERS);
  safeSetStorage(ROLES_STORAGE_KEY, INITIAL_ROLES);
  safeSetStorage(ACTIVITIES_STORAGE_KEY, INITIAL_ACTIVITIES);
  updateRoleCounts(INITIAL_USERS);
}

import {
  useGetUsersQuery,
  useGetUserStatsQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useChangeUserStatusMutation,
  useResetUserPasswordMutation,
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetPermissionsQuery,
  useGetActivitiesQuery,
} from "../../../store/index.js";

// React hook for component reactivity + RTK Query integration
export function useUserStore(params = {}) {
  // Local storage state as immediate fallback
  const [localUsers, setLocalUsers] = useState(getStoredUsers);
  const [localRoles, setLocalRoles] = useState(getStoredRoles);
  const [localActivities, setLocalActivities] = useState(getStoredActivities);

  // RTK Query hooks
  const { data: apiUsersData, isLoading: isUsersLoading, refetch: refetchUsers } = useGetUsersQuery({
    page_size: 100,
    ...params,
  });
  const { data: apiStatsData } = useGetUserStatsQuery();
  const { data: apiRolesData, isLoading: isRolesLoading } = useGetRolesQuery();
  const { data: apiPermissionsData } = useGetPermissionsQuery();
  const { data: apiActivitiesData } = useGetActivitiesQuery({ page_size: 50 });

  // RTK Mutations
  const [createUserApi] = useCreateUserMutation();
  const [updateUserApi] = useUpdateUserMutation();
  const [deleteUserApi] = useDeleteUserMutation();
  const [changeStatusApi] = useChangeUserStatusMutation();
  const [resetPwdApi] = useResetUserPasswordMutation();
  const [createRoleApi] = useCreateRoleMutation();
  const [updateRoleApi] = useUpdateRoleMutation();
  const [deleteRoleApi] = useDeleteRoleMutation();

  useEffect(() => {
    const handleUpdate = () => {
      setLocalUsers(getStoredUsers());
      setLocalRoles(getStoredRoles());
      setLocalActivities(getStoredActivities());
    };

    window.addEventListener(STORE_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(STORE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Compute active dataset (prefer backend response, fallback to local store)
  const users = apiUsersData?.results || (Array.isArray(apiUsersData) ? apiUsersData : localUsers);
  const roles = apiRolesData?.results || (Array.isArray(apiRolesData) ? apiRolesData : localRoles);
  const activities = apiActivitiesData?.results || (Array.isArray(apiActivitiesData) ? apiActivitiesData : localActivities);

  const stats = apiStatsData || {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === "Active").length,
    inactiveUsers: users.filter((u) => u.status === "Inactive").length,
    pendingUsers: users.filter((u) => u.status === "Pending").length,
    suspendedUsers: users.filter((u) => u.status === "Suspended").length,
    totalRoles: roles.length,
  };

  const handleAddUser = async (data) => {
    try {
      const res = await createUserApi(data).unwrap();
      saveUser(res?.data || data, false);
      return res?.data || data;
    } catch (err) {
      console.error("API error creating user:", err);
      throw err;
    }
  };

  const handleUpdateUser = async (id, data) => {
    try {
      const res = await updateUserApi({ id, ...data }).unwrap();
      saveUser({ ...data, id }, true);
      return res?.data || { ...data, id };
    } catch (err) {
      console.error("API error updating user:", err);
      throw err;
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await deleteUserApi(id).unwrap();
    } catch (err) {
      console.error("API error deleting user:", err);
    }
    return deleteUserById(id);
  };

  const handleToggleStatus = async (id, newStatus) => {
    try {
      await changeStatusApi({ id, status: newStatus }).unwrap();
    } catch (err) {
      console.error("API error toggling status:", err);
    }
    return toggleUserStatus(id, newStatus);
  };

  const handleResetPassword = async (id, newPassword) => {
    try {
      await resetPwdApi({ id, newPassword }).unwrap();
    } catch (err) {
      console.error("API error resetting password:", err);
    }
    return resetUserPassword(id, newPassword);
  };

  const handleAddRole = async (data) => {
    try {
      const res = await createRoleApi(data).unwrap();
      saveRole(res?.data || data, false);
      return res?.data || data;
    } catch (err) {
      console.error("API error creating role:", err);
      throw err;
    }
  };

  const handleUpdateRole = async (id, data) => {
    try {
      const res = await updateRoleApi({ id, ...data }).unwrap();
      saveRole({ ...data, id }, true);
      return res?.data || { ...data, id };
    } catch (err) {
      console.error("API error updating role:", err);
      throw err;
    }
  };

  const handleDeleteRole = async (id) => {
    try {
      await deleteRoleApi(id).unwrap();
    } catch (err) {
      console.error("API error deleting role:", err);
    }
    return deleteRoleById(id);
  };

  return {
    users,
    roles,
    activities,
    stats,
    permissions: apiPermissionsData || [],
    isLoading: isUsersLoading || isRolesLoading,
    refetchUsers,
    addUser: handleAddUser,
    updateUser: handleUpdateUser,
    deleteUser: handleDeleteUser,
    toggleStatus: handleToggleStatus,
    resetPassword: handleResetPassword,
    addRole: handleAddRole,
    updateRole: handleUpdateRole,
    deleteRole: handleDeleteRole,
    logActivity: logActivityEvent,
    resetData: resetAllToDemoData,
  };
}
