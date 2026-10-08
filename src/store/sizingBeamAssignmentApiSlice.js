import { apiSlice } from "./apiSlice.js";

export const sizingBeamAssignmentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ─── GET /sizing-beam-assignments/ ─────────────────────────
    getSizingBeamAssignments: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.set("page", String(params.page));
        if (params.page_size) searchParams.set("page_size", String(params.page_size));
        if (params.beam) searchParams.set("beam", String(params.beam));
        if (params.sizing_outcome) searchParams.set("sizing_outcome", String(params.sizing_outcome));
        if (params.status) searchParams.set("status", params.status);
        if (params.ordering) searchParams.set("ordering", params.ordering);

        const qs = searchParams.toString();
        return `/sizing-beam-assignments/${qs ? `?${qs}` : ""}`;
      },
      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map((a) => ({ type: "SizingBeamAssignment", id: a.id })),
              { type: "SizingBeamAssignment", id: "LIST" },
            ]
          : [{ type: "SizingBeamAssignment", id: "LIST" }],
    }),

    // ─── GET /sizing-beam-assignments/{id}/ ─────────────────────
    getSizingBeamAssignmentById: builder.query({
      query: (id) => `/sizing-beam-assignments/${id}/`,
      providesTags: (result, error, id) => [{ type: "SizingBeamAssignment", id }],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── POST /sizing-beam-assignments/{id}/transition/ ────────
    transitionBeamAssignment: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/sizing-beam-assignments/${id}/transition/`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "SizingBeamAssignment", id },
        { type: "SizingBeamAssignment", id: "LIST" },
        "AvailableBeams",
        { type: "Beam", id: "LIST" },
      ],
    }),

    // ─── POST /sizing-beam-assignments/{id}/release/ ───────────
    releaseBeamAssignment: builder.mutation({
      query: (id) => ({
        url: `/sizing-beam-assignments/${id}/release/`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "SizingBeamAssignment", id },
        { type: "SizingBeamAssignment", id: "LIST" },
        "AvailableBeams",
        { type: "Beam", id: "LIST" },
        "SizingOutcome",
      ],
    }),
  }),
});

export const {
  useGetSizingBeamAssignmentsQuery,
  useLazyGetSizingBeamAssignmentsQuery,
  useGetSizingBeamAssignmentByIdQuery,
  useLazyGetSizingBeamAssignmentByIdQuery,
  useTransitionBeamAssignmentMutation,
  useReleaseBeamAssignmentMutation,
} = sizingBeamAssignmentApiSlice;
