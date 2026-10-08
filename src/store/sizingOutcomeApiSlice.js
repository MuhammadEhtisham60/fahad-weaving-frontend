import { apiSlice } from "./apiSlice.js";

export const sizingOutcomeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ─── GET /sizing-outcomes/ (paginated + filters) ───────────
    getSizingOutcomes: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.set("page", String(params.page));
        if (params.page_size) searchParams.set("page_size", String(params.page_size));
        if (params.search) searchParams.set("search", params.search);
        if (params.sizing_id) searchParams.set("sizing_id", String(params.sizing_id));
        if (params.outcome_date_after) searchParams.set("outcome_date_after", params.outcome_date_after);
        if (params.outcome_date_before) searchParams.set("outcome_date_before", params.outcome_date_before);
        if (params.ordering) searchParams.set("ordering", params.ordering);

        const qs = searchParams.toString();
        return `/sizing-outcomes/${qs ? `?${qs}` : ""}`;
      },
      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map((o) => ({ type: "SizingOutcome", id: o.id })),
              { type: "SizingOutcome", id: "LIST" },
            ]
          : [{ type: "SizingOutcome", id: "LIST" }],
    }),

    // ─── GET /sizing-outcomes/{id}/ ────────────────────────────
    getSizingOutcomeById: builder.query({
      query: (id) => `/sizing-outcomes/${id}/`,
      providesTags: (result, error, id) => [{ type: "SizingOutcome", id }],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── GET /sizing-outcomes/{id}/beams/ ──────────────────────
    getOutcomeBeams: builder.query({
      query: (id) => `/sizing-outcomes/${id}/beams/`,
      providesTags: (result, error, id) => [
        { type: "SizingOutcome", id },
        "SizingBeamAssignment",
      ],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── POST /sizing-outcomes/ (Create) ───────────────────────
    createSizingOutcome: builder.mutation({
      query: (payload) => ({
        url: "/sizing-outcomes/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        { type: "SizingOutcome", id: "LIST" },
        { type: "YarnOutcome", id: "LIST" },
        "SizingBeamAssignment",
        "AvailableBeams",
        { type: "Beam", id: "LIST" },
      ],
    }),

    // ─── PUT /sizing-outcomes/{id}/ (Full Update) ──────────────
    updateSizingOutcome: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/sizing-outcomes/${id}/`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "SizingOutcome", id },
        { type: "SizingOutcome", id: "LIST" },
        { type: "YarnOutcome", id: "LIST" },
        "SizingBeamAssignment",
      ],
    }),

    // ─── PATCH /sizing-outcomes/{id}/ (Partial Update) ─────────
    patchSizingOutcome: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/sizing-outcomes/${id}/`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "SizingOutcome", id },
        { type: "SizingOutcome", id: "LIST" },
        "SizingBeamAssignment",
      ],
    }),

    // ─── DELETE /sizing-outcomes/{id}/ ─────────────────────────
    deleteSizingOutcome: builder.mutation({
      query: (id) => ({
        url: `/sizing-outcomes/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "SizingOutcome", id: "LIST" },
        "SizingBeamAssignment",
        "AvailableBeams",
        { type: "Beam", id: "LIST" },
      ],
    }),

    // ─── POST /sizing-outcomes/{id}/assign-beams/ ──────────────
    assignBeamsToOutcome: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/sizing-outcomes/${id}/assign-beams/`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "SizingOutcome", id },
        { type: "SizingOutcome", id: "LIST" },
        "SizingBeamAssignment",
        "AvailableBeams",
        { type: "Beam", id: "LIST" },
      ],
    }),

    // ─── POST /sizing-outcomes/{id}/release-beam/ ──────────────
    releaseBeamFromOutcome: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/sizing-outcomes/${id}/release-beam/`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "SizingOutcome", id },
        { type: "SizingOutcome", id: "LIST" },
        "SizingBeamAssignment",
        "AvailableBeams",
        { type: "Beam", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetSizingOutcomesQuery,
  useLazyGetSizingOutcomesQuery,
  useGetSizingOutcomeByIdQuery,
  useLazyGetSizingOutcomeByIdQuery,
  useGetOutcomeBeamsQuery,
  useCreateSizingOutcomeMutation,
  useUpdateSizingOutcomeMutation,
  usePatchSizingOutcomeMutation,
  useDeleteSizingOutcomeMutation,
  useAssignBeamsToOutcomeMutation,
  useReleaseBeamFromOutcomeMutation,
} = sizingOutcomeApiSlice;
