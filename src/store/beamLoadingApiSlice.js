import { apiSlice } from "./apiSlice.js";

export const beamLoadingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ─── GET /factory/beam-loadings/ (paginated + filters) ─────
    getBeamLoadings: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.set("page", String(params.page));
        if (params.page_size) searchParams.set("page_size", String(params.page_size));
        if (params.search) searchParams.set("search", params.search);
        if (params.beam) searchParams.set("beam", String(params.beam));
        if (params.loom) searchParams.set("loom", String(params.loom));
        if (params.sizing_outcome) searchParams.set("sizing_outcome", String(params.sizing_outcome));
        if (params.status) searchParams.set("status", params.status);
        if (params.installation_date_after) searchParams.set("installation_date_after", params.installation_date_after);
        if (params.installation_date_before) searchParams.set("installation_date_before", params.installation_date_before);
        if (params.ordering) searchParams.set("ordering", params.ordering);

        const qs = searchParams.toString();
        return `/factory/beam-loadings/${qs ? `?${qs}` : ""}`;
      },
      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map((l) => ({ type: "BeamLoading", id: l.id })),
              { type: "BeamLoading", id: "LIST" },
            ]
          : [{ type: "BeamLoading", id: "LIST" }],
    }),

    // ─── GET /factory/beam-loadings/active/ ────────────────────
    getActiveBeamLoadings: builder.query({
      query: () => "/factory/beam-loadings/active/",
      providesTags: ["ActiveBeamLoading", { type: "BeamLoading", id: "LIST" }],
      transformResponse: (response) => response?.data ?? response?.results ?? response,
    }),

    // ─── GET /factory/beam-loadings/{id}/ ──────────────────────
    getBeamLoadingById: builder.query({
      query: (id) => `/factory/beam-loadings/${id}/`,
      providesTags: (result, error, id) => [{ type: "BeamLoading", id }],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── POST /factory/beam-loadings/ (Create) ─────────────────
    createBeamLoading: builder.mutation({
      query: (payload) => ({
        url: "/factory/beam-loadings/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        { type: "BeamLoading", id: "LIST" },
        "ActiveBeamLoading",
        "AvailableBeams",
        { type: "Beam", id: "LIST" },
        { type: "Loom", id: "LIST" },
        "LoomStats",
      ],
    }),

    // ─── POST /factory/beam-loadings/batch/ (Batch Create) ─────
    createBatchBeamLoading: builder.mutation({
      query: (payload) => ({
        url: "/factory/beam-loadings/batch/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        { type: "BeamLoading", id: "LIST" },
        "ActiveBeamLoading",
        "AvailableBeams",
        { type: "Beam", id: "LIST" },
        { type: "Loom", id: "LIST" },
        "LoomStats",
      ],
    }),

    // ─── PATCH /factory/beam-loadings/{id}/ (Partial Update) ───
    patchBeamLoading: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/factory/beam-loadings/${id}/`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "BeamLoading", id },
        { type: "BeamLoading", id: "LIST" },
        "ActiveBeamLoading",
      ],
    }),

    // ─── DELETE /factory/beam-loadings/{id}/ ───────────────────
    deleteBeamLoading: builder.mutation({
      query: (id) => ({
        url: `/factory/beam-loadings/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "BeamLoading", id: "LIST" },
        "ActiveBeamLoading",
        "AvailableBeams",
        { type: "Beam", id: "LIST" },
        { type: "Loom", id: "LIST" },
        "LoomStats",
      ],
    }),

    // ─── POST /factory/beam-loadings/{id}/empty/ ───────────────
    emptyBeamLoading: builder.mutation({
      query: (id) => ({
        url: `/factory/beam-loadings/${id}/empty/`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "BeamLoading", id },
        { type: "BeamLoading", id: "LIST" },
        "ActiveBeamLoading",
        "AvailableBeams",
        { type: "Beam", id: "LIST" },
        { type: "Loom", id: "LIST" },
        "LoomStats",
      ],
    }),
  }),
});

export const {
  useGetBeamLoadingsQuery,
  useLazyGetBeamLoadingsQuery,
  useGetActiveBeamLoadingsQuery,
  useLazyGetActiveBeamLoadingsQuery,
  useGetBeamLoadingByIdQuery,
  useLazyGetBeamLoadingByIdQuery,
  useCreateBeamLoadingMutation,
  useCreateBatchBeamLoadingMutation,
  usePatchBeamLoadingMutation,
  useDeleteBeamLoadingMutation,
  useEmptyBeamLoadingMutation,
} = beamLoadingApiSlice;
