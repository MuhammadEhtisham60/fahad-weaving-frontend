import { apiSlice } from "./apiSlice.js";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ─── POST /auth/signup/ ───────────────────────────────────────
    signup: builder.mutation({
      query: (userData) => ({
        url: "/auth/signup/",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User", "UserStats", "Role", "Permission", "Activity", "Me"],
    }),

    // ─── POST /auth/login/ ───────────────────────────────────────
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login/",
        method: "POST",
        body: credentials, // { username, password }
      }),
      // Invalidate everything after login so pages fetch fresh data
      invalidatesTags: ["User", "UserStats", "Role", "Permission", "Activity", "Me"],
    }),

    // ─── POST /auth/logout/ ─────────────────────────────────────
    logoutApi: builder.mutation({
      query: (refreshToken) => ({
        url: "/auth/logout/",
        method: "POST",
        body: { refresh: refreshToken },
      }),
    }),

    // ─── POST /auth/refresh/ ────────────────────────────────────
    refreshToken: builder.mutation({
      query: (refreshToken) => ({
        url: "/auth/refresh/",
        method: "POST",
        body: { refresh: refreshToken },
      }),
    }),

    // ─── GET /auth/me/ ──────────────────────────────────────────
    getMe: builder.query({
      query: () => "/auth/me/",
      providesTags: ["Me"],
      transformResponse: (response) => response?.data?.user ?? response?.data ?? response,
    }),
  }),
});

export const {
  useSignupMutation,
  useLoginMutation,
  useLogoutApiMutation,
  useRefreshTokenMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
} = authApiSlice;
