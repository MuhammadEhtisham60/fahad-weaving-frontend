import { apiSlice } from "./apiSlice.js";

export const beamApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ─── GET /factory/beams/stats/ ─────────────────────────────
    getBeamStats: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.search) searchParams.set("search", params.search);
        if (params.status) searchParams.set("status", params.status);
        if (params.production_order) searchParams.set("production_order", params.production_order);
        if (params.yarn_count) searchParams.set("yarn_count", params.yarn_count);
        if (params.min_length !== undefined && params.min_length !== "") searchParams.set("min_length", params.min_length);
        if (params.max_length !== undefined && params.max_length !== "") searchParams.set("max_length", params.max_length);
        if (params.min_weight !== undefined && params.min_weight !== "") searchParams.set("min_weight", params.min_weight);
        if (params.max_weight !== undefined && params.max_weight !== "") searchParams.set("max_weight", params.max_weight);
        if (params.created_after) searchParams.set("created_after", params.created_after);
        if (params.created_before) searchParams.set("created_before", params.created_before);
        const qs = searchParams.toString();
        return `/factory/beams/stats/${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["BeamStats"],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── GET /factory/beams/choices/ ───────────────────────────
    getBeamChoices: builder.query({
      query: () => "/factory/beams/choices/",
      providesTags: ["BeamChoices"],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── GET /factory/beams/ (paginated + filters) ─────────────
    getBeams: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.set("page", String(params.page));
        if (params.page_size) searchParams.set("page_size", String(params.page_size));
        if (params.search) searchParams.set("search", params.search);
        if (params.status) searchParams.set("status", params.status);
        if (params.production_order) searchParams.set("production_order", params.production_order);
        if (params.yarn_count) searchParams.set("yarn_count", params.yarn_count);
        if (params.min_length !== undefined && params.min_length !== "") searchParams.set("min_length", params.min_length);
        if (params.max_length !== undefined && params.max_length !== "") searchParams.set("max_length", params.max_length);
        if (params.min_weight !== undefined && params.min_weight !== "") searchParams.set("min_weight", params.min_weight);
        if (params.max_weight !== undefined && params.max_weight !== "") searchParams.set("max_weight", params.max_weight);
        if (params.created_after) searchParams.set("created_after", params.created_after);
        if (params.created_before) searchParams.set("created_before", params.created_before);
        if (params.ordering) searchParams.set("ordering", params.ordering);

        const qs = searchParams.toString();
        return `/factory/beams/${qs ? `?${qs}` : ""}`;
      },
      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map((b) => ({ type: "Beam", id: b.id })),
              { type: "Beam", id: "LIST" },
            ]
          : [{ type: "Beam", id: "LIST" }],
    }),

    // ─── GET /factory/beams/{id}/ ──────────────────────────────
    getBeamById: builder.query({
      query: (id) => `/factory/beams/${id}/`,
      providesTags: (result, error, id) => [{ type: "Beam", id }],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── GET /factory/beams/available/ ────────────────────────
    getAvailableBeams: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.search) searchParams.set("search", params.search);
        if (params.yarn_count) searchParams.set("yarn_count", params.yarn_count);
        if (params.page) searchParams.set("page", String(params.page));
        if (params.page_size) searchParams.set("page_size", String(params.page_size));
        const qs = searchParams.toString();
        return `/factory/beams/available/${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["AvailableBeams", { type: "Beam", id: "LIST" }],
      transformResponse: (response) => response?.data ?? response?.results ?? response,
    }),

    // ─── GET /factory/beams/{id}/sizing-history/ ───────────────
    getBeamSizingHistory: builder.query({
      query: (id) => `/factory/beams/${id}/sizing-history/`,
      providesTags: (result, error, id) => [{ type: "Beam", id }, "SizingBeamAssignment"],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── GET /factory/beams/{id}/active-assignment/ ────────────
    getBeamActiveAssignment: builder.query({
      query: (id) => `/factory/beams/${id}/active-assignment/`,
      providesTags: (result, error, id) => [{ type: "Beam", id }, "SizingBeamAssignment"],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── POST /factory/beams/{id}/release/ ──────────────────────
    releaseBeam: builder.mutation({
      query: (id) => ({
        url: `/factory/beams/${id}/release/`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Beam", id },
        { type: "Beam", id: "LIST" },
        "BeamStats",
        "AvailableBeams",
        "SizingBeamAssignment",
        "SizingOutcome",
      ],
    }),

    // ─── GET /factory/beams/{id}/loading-history/ ──────────────
    getBeamLoadingHistory: builder.query({
      query: (id) => `/factory/beams/${id}/loading-history/`,
      providesTags: (result, error, id) => [{ type: "Beam", id }, "BeamLoading"],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── POST /factory/beams/ (Create) ─────────────────────────
    createBeam: builder.mutation({
      query: (payload) => ({
        url: "/factory/beams/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "Beam", id: "LIST" }, "BeamStats", "AvailableBeams"],
    }),

    // ─── PUT /factory/beams/{id}/ (Full Update) ────────────────
    updateBeam: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/factory/beams/${id}/`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Beam", id },
        { type: "Beam", id: "LIST" },
        "BeamStats",
        "AvailableBeams",
      ],
    }),

    // ─── PATCH /factory/beams/{id}/ (Partial Update) ───────────
    patchBeam: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/factory/beams/${id}/`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Beam", id },
        { type: "Beam", id: "LIST" },
        "BeamStats",
        "AvailableBeams",
      ],
    }),

    // ─── DELETE /factory/beams/{id}/ ───────────────────────────
    deleteBeam: builder.mutation({
      query: (id) => ({
        url: `/factory/beams/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Beam", id: "LIST" }, "BeamStats", "AvailableBeams"],
    }),
  }),
});

export const {
  useGetBeamStatsQuery,
  useGetBeamChoicesQuery,
  useGetBeamsQuery,
  useLazyGetBeamsQuery,
  useGetBeamByIdQuery,
  useLazyGetBeamByIdQuery,
  useGetAvailableBeamsQuery,
  useLazyGetAvailableBeamsQuery,
  useGetBeamSizingHistoryQuery,
  useLazyGetBeamSizingHistoryQuery,
  useGetBeamActiveAssignmentQuery,
  useLazyGetBeamActiveAssignmentQuery,
  useReleaseBeamMutation,
  useGetBeamLoadingHistoryQuery,
  useLazyGetBeamLoadingHistoryQuery,
  useCreateBeamMutation,
  useUpdateBeamMutation,
  usePatchBeamMutation,
  useDeleteBeamMutation,
} = beamApiSlice;
