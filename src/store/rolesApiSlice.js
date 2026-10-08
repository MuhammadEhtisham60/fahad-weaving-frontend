import { apiSlice } from "./apiSlice.js";

export const rolesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ─── GET /roles/ ────────────────────────────────────────────
    getRoles: builder.query({
      query: () => "/roles/",
      providesTags: (result) => {
        const roles = result?.data ?? result ?? [];
        return Array.isArray(roles)
          ? [
              ...roles.map((r) => ({ type: "Role", id: r.id })),
              { type: "Role", id: "LIST" },
            ]
          : [{ type: "Role", id: "LIST" }];
      },
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── POST /roles/ (Create) ─────────────────────────────────
    createRole: builder.mutation({
      query: (roleData) => ({
        url: "/roles/",
        method: "POST",
        body: roleData,
      }),
      invalidatesTags: [{ type: "Role", id: "LIST" }],
    }),

    // ─── PUT|PATCH /roles/{id}/ (Update) ────────────────────────
    updateRole: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/roles/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Role", id },
        { type: "Role", id: "LIST" },
      ],
    }),

    // ─── DELETE /roles/{id}/ ────────────────────────────────────
    deleteRole: builder.mutation({
      query: (id) => ({
        url: `/roles/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Role", id: "LIST" }],
    }),

    // ─── GET /permissions/ ──────────────────────────────────────
    getPermissions: builder.query({
      query: () => "/permissions/",
      providesTags: ["Permission"],
      transformResponse: (response) => response?.data ?? response,
    }),
  }),
});

export const {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetPermissionsQuery,
} = rolesApiSlice;
