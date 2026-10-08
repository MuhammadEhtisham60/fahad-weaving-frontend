import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1";

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

/**
 * Wrapper around baseQuery that handles automatic JWT token refresh.
 * If a 401 is received (and it's not from the login/refresh endpoint itself),
 * we attempt to refresh using the stored refresh token.
 */
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    const refreshToken = api.getState().auth.refreshToken;

    // Don't try to refresh if we don't have a refresh token
    // or if the failed request was already a refresh/login attempt
    const url = typeof args === "string" ? args : args.url;
    if (
      !refreshToken ||
      url?.includes("/auth/login/") ||
      url?.includes("/auth/refresh/")
    ) {
      // Force logout
      api.dispatch({ type: "auth/logout" });
    } else {
      // Attempt token refresh
      const refreshResult = await baseQuery(
        {
          url: "/auth/refresh/",
          method: "POST",
          body: { refresh: refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult?.data?.access) {
        // Store the new token
        api.dispatch({
          type: "auth/tokenRefreshed",
          payload: refreshResult.data.access,
        });

        // Retry the original query with new token
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed — force logout
        api.dispatch({ type: "auth/logout" });
      }
    }
  }

  // Global Error Toast Handler
  if (result?.error) {
    const data = result.error.data;
    let message = "An API error occurred";
    
    if (data?.errors && typeof data.errors === "object") {
      // Handle the { success: false, message: "...", errors: { field: ["msg"] } } format
      const firstErrorKey = Object.keys(data.errors)[0];
      if (firstErrorKey) {
        const firstErrorVal = data.errors[firstErrorKey];
        const errorText = Array.isArray(firstErrorVal) ? firstErrorVal[0] : firstErrorVal;
        message = `${firstErrorKey}: ${errorText}`;
      } else {
        message = data.message || "Validation failed";
      }
    } else if (data?.detail) {
      message = data.detail;
    } else if (data?.message) {
      message = data.message;
    } else if (data?.non_field_errors) {
      message = data.non_field_errors[0];
    } else if (typeof data === "object" && data !== null) {
      const firstKey = Object.keys(data)[0];
      if (firstKey) {
        const firstVal = data[firstKey];
        message = Array.isArray(firstVal) ? `${firstKey}: ${firstVal[0]}` : String(firstVal);
      }
    } else if (typeof data === "string") {
      message = data;
    } else if (result.error.error) {
      message = result.error.error;
    }
    
    // Show the error toast (AppShell already configures position="top-right")
    toast.error(message);
  }

  return result;
};

/**
 * Root API slice — all feature API slices inject endpoints into this.
 * Using a single createApi keeps one shared cache and middleware.
 */
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "User",
    "UserStats",
    "Role",
    "Permission",
    "Activity",
    "Me",
    "Supplier",
    "SupplierStats",
    "SupplierChoices",
    "Customer",
    "CustomerStats",
    "CustomerChoices",
    "Beam",
    "BeamStats",
    "BeamChoices",
    "AvailableBeams",
    "Loom",
    "LoomStats",
    "LoomChoices",
    "YarnIntake",
    "YarnIntakeStats",
    "YarnOutcome",
    "Sizing",
    "SizingChoices",
    "SizingOutcome",
    "SizingBeamAssignment",
    "BeamLoading",
    "ActiveBeamLoading",
    "Production",
    "ProductionStats",
    "DailyLedger",
    "DailyLedgerStats",
    "DailyLedgerSummary",
    "DailyLedgerView",
    "DailyLedgerChoices",
    "LedgerTransaction",
  ],
  endpoints: () => ({}), // injected by feature slices
});
