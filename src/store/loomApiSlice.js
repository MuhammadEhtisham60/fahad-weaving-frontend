import { apiSlice } from "./apiSlice.js";

export const loomApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ─── GET /factory/looms/stats/ ─────────────────────────────
    getLoomStats: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.search) searchParams.set("search", params.search);
        if (params.status) searchParams.set("status", params.status);
        if (params.location) searchParams.set("location", params.location);
        if (params.installed_after) searchParams.set("installed_after", params.installed_after);
        if (params.installed_before) searchParams.set("installed_before", params.installed_before);
        if (params.created_after) searchParams.set("created_after", params.created_after);
        if (params.created_before) searchParams.set("created_before", params.created_before);
        const qs = searchParams.toString();
        return `/factory/looms/stats/${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["LoomStats"],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── GET /factory/looms/choices/ ───────────────────────────
    getLoomChoices: builder.query({
      query: () => "/factory/looms/choices/",
      providesTags: ["LoomChoices"],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── GET /factory/looms/ (paginated + filters) ─────────────
    getLooms: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.set("page", String(params.page));
        if (params.page_size) searchParams.set("page_size", String(params.page_size));
        if (params.search) searchParams.set("search", params.search);
        if (params.status) searchParams.set("status", params.status);
        if (params.location) searchParams.set("location", params.location);
        if (params.installed_after) searchParams.set("installed_after", params.installed_after);
        if (params.installed_before) searchParams.set("installed_before", params.installed_before);
        if (params.created_after) searchParams.set("created_after", params.created_after);
        if (params.created_before) searchParams.set("created_before", params.created_before);
        if (params.ordering) searchParams.set("ordering", params.ordering);

        const qs = searchParams.toString();
        return `/factory/looms/${qs ? `?${qs}` : ""}`;
      },
      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map((l) => ({ type: "Loom", id: l.id })),
              { type: "Loom", id: "LIST" },
            ]
          : [{ type: "Loom", id: "LIST" }],
    }),

    // ─── GET /factory/looms/{id}/ ──────────────────────────────
    getLoomById: builder.query({
      query: (id) => `/factory/looms/${id}/`,
      providesTags: (result, error, id) => [{ type: "Loom", id }],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── POST /factory/looms/ (Create) ─────────────────────────
    createLoom: builder.mutation({
      query: (payload) => ({
        url: "/factory/looms/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "Loom", id: "LIST" }, "LoomStats"],
    }),

    // ─── PUT /factory/looms/{id}/ (Full Update) ────────────────
    updateLoom: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/factory/looms/${id}/`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Loom", id },
        { type: "Loom", id: "LIST" },
        "LoomStats",
      ],
    }),

    // ─── PATCH /factory/looms/{id}/ (Partial Update) ───────────
    patchLoom: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/factory/looms/${id}/`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Loom", id },
        { type: "Loom", id: "LIST" },
        "LoomStats",
      ],
    }),

    // ─── DELETE /factory/looms/{id}/ ───────────────────────────
    deleteLoom: builder.mutation({
      query: (id) => ({
        url: `/factory/looms/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Loom", id: "LIST" }, "LoomStats"],
    }),
  }),
});

export const {
  useGetLoomStatsQuery,
  useGetLoomChoicesQuery,
  useGetLoomsQuery,
  useLazyGetLoomsQuery,
  useGetLoomByIdQuery,
  useLazyGetLoomByIdQuery,
  useCreateLoomMutation,
  useUpdateLoomMutation,
  usePatchLoomMutation,
  useDeleteLoomMutation,
} = loomApiSlice;
