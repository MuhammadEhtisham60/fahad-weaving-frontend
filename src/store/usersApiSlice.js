import { apiSlice } from "./apiSlice.js";

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ─── GET /users/stats/ ──────────────────────────────────────
    getUserStats: builder.query({
      query: () => "/users/stats/",
      providesTags: ["UserStats"],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── GET /users/ (paginated + filters) ──────────────────────
    getUsers: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.search) searchParams.set("search", params.search);
        if (params.role) searchParams.set("role", params.role);
        if (params.department) searchParams.set("department", params.department);
        if (params.status) searchParams.set("status", params.status);
        if (params.company) searchParams.set("company", params.company);
        if (params.branch) searchParams.set("branch", params.branch);
        if (params.ordering) searchParams.set("ordering", params.ordering);
        if (params.page) searchParams.set("page", String(params.page));
        if (params.page_size) searchParams.set("page_size", String(params.page_size));

        const qs = searchParams.toString();
        return `/users/${qs ? `?${qs}` : ""}`;
      },
      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map((u) => ({ type: "User", id: u.id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    // ─── GET /users/{id}/ ───────────────────────────────────────
    getUserById: builder.query({
      query: (id) => `/users/${id}/`,
      providesTags: (result, error, id) => [{ type: "User", id }],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── POST /users/ (Create) ──────────────────────────────────
    createUser: builder.mutation({
      query: (userData) => ({
        url: "/users/",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: [
        { type: "User", id: "LIST" },
        "UserStats",
      ],
    }),

    // ─── PUT|PATCH /users/{id}/ (Update) ────────────────────────
    updateUser: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/users/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
        "UserStats",
      ],
    }),

    // ─── POST /users/{id}/status/ ───────────────────────────────
    changeUserStatus: builder.mutation({
      query: ({ id, status, reason }) => ({
        url: `/users/${id}/status/`,
        method: "POST",
        body: { status, reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
        "UserStats",
      ],
    }),

    // ─── POST /users/{id}/reset-password/ ───────────────────────
    resetUserPassword: builder.mutation({
      query: ({ id, newPassword }) => ({
        url: `/users/${id}/reset-password/`,
        method: "POST",
        body: { newPassword },
      }),
    }),

    // ─── DELETE /users/{id}/ ────────────────────────────────────
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "User", id: "LIST" },
        "UserStats",
      ],
    }),
  }),
});

export const {
  useGetUserStatsQuery,
  useGetUsersQuery,
  useLazyGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useChangeUserStatusMutation,
  useResetUserPasswordMutation,
  useDeleteUserMutation,
} = usersApiSlice;
