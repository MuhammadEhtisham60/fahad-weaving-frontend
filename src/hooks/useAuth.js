import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectAccessToken,
  logout as logoutAction,
  useLogoutApiMutation,
  useGetMeQuery,
} from "../store/index.js";

/**
 * Custom hook to easily access the authenticated user, auth state,
 * permissions, and authentication actions across any component.
 *
 * Usage:
 *   const { user, isAuthenticated, hasPermission, logout } = useAuth();
 */
export function useAuth() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const accessToken = useSelector(selectAccessToken);
  const [logoutApi] = useLogoutApiMutation();

  // Optionally revalidate or fetch latest profile from backend when token exists
  const { data: meData } = useGetMeQuery(undefined, {
    skip: !accessToken,
  });

  // Active user profile (prefer query data if updated, fallback to state user)
  const activeUser = meData || user;

  // Check if active user has superuser privileges
  const isSuperuser = Boolean(
    activeUser &&
      (activeUser.is_superuser === true ||
        activeUser.is_superuser === "true" ||
        activeUser.role === "Super Admin" ||
        activeUser.role === "superadmin" ||
        activeUser.role === "Superuser" ||
        activeUser.role === "superuser" ||
        activeUser.username === "superadmin" ||
        activeUser.username === "admin")
  );

  const hasPermission = useCallback(
    (permissionCode) => {
      // If superuser, grant complete system access & bypass all module/submodule restrictions
      if (isSuperuser) return true;
      if (!permissionCode) return true;
      if (!activeUser) return false;

      const perms = activeUser.permissions;
      if (!perms) return false;

      // Object format: { "dashboard.view": true, "users.view": true }
      if (typeof perms === "object" && !Array.isArray(perms)) {
        if (perms["*"] === true) return true;
        return Boolean(perms[permissionCode]);
      }

      // Array format: ["dashboard.view", "users.view"]
      if (Array.isArray(perms)) {
        if (perms.includes("*")) return true;
        return perms.includes(permissionCode);
      }

      return false;
    },
    [activeUser, isSuperuser]
  );

  const hasRole = useCallback(
    (roleName) => {
      if (isSuperuser) return true;
      if (!activeUser?.role) return false;
      return activeUser.role.toLowerCase() === roleName.toLowerCase();
    },
    [activeUser, isSuperuser]
  );

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await logoutApi(refreshToken).unwrap();
      }
    } catch {
      // ignore network errors
    } finally {
      dispatch(logoutAction());
      window.location.href = "/auth/login";
    }
  }, [dispatch, logoutApi]);

  return {
    user: activeUser,
    isAuthenticated,
    accessToken,
    isSuperuser,
    is_superuser: isSuperuser,
    permissions: activeUser?.permissions || [],
    hasPermission,
    hasRole,
    logout,
  };
}
