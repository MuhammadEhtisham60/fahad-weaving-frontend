import { apiSlice } from "./apiSlice.js";

export const yarnOutcomeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ─── GET /yarn-outcomes/ (paginated + filters) ─────────────
    getYarnOutcomes: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.set("page", String(params.page));
        if (params.page_size) searchParams.set("page_size", String(params.page_size));
        if (params.yarn_intake) searchParams.set("yarn_intake", String(params.yarn_intake));
        if (params.outcome_type) searchParams.set("outcome_type", params.outcome_type);
        if (params.sizing) searchParams.set("sizing", String(params.sizing));
        if (params.yarn_buyer) searchParams.set("yarn_buyer", String(params.yarn_buyer));
        if (params.date_after) searchParams.set("date_after", params.date_after);
        if (params.date_before) searchParams.set("date_before", params.date_before);
        if (params.ordering) searchParams.set("ordering", params.ordering);

        const qs = searchParams.toString();
        return `/yarn-outcomes/${qs ? `?${qs}` : ""}`;
      },
      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map((y) => ({ type: "YarnOutcome", id: y.id })),
              { type: "YarnOutcome", id: "LIST" },
            ]
          : [{ type: "YarnOutcome", id: "LIST" }],
    }),

    // ─── GET /yarn-outcomes/{id}/ ──────────────────────────────
    getYarnOutcomeById: builder.query({
      query: (id) => `/yarn-outcomes/${id}/`,
      providesTags: (result, error, id) => [{ type: "YarnOutcome", id }],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── POST /yarn-outcomes/ (Create) ─────────────────────────
    createYarnOutcome: builder.mutation({
      query: (payload) => ({
        url: "/yarn-outcomes/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        { type: "YarnOutcome", id: "LIST" },
        { type: "YarnIntake", id: "LIST" },
        "YarnIntakeStats",
      ],
    }),

    // ─── PUT /yarn-outcomes/{id}/ (Full Update) ────────────────
    updateYarnOutcome: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/yarn-outcomes/${id}/`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "YarnOutcome", id },
        { type: "YarnOutcome", id: "LIST" },
        { type: "YarnIntake", id: "LIST" },
        "YarnIntakeStats",
      ],
    }),

    // ─── PATCH /yarn-outcomes/{id}/ (Partial Update) ───────────
    patchYarnOutcome: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/yarn-outcomes/${id}/`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "YarnOutcome", id },
        { type: "YarnOutcome", id: "LIST" },
        { type: "YarnIntake", id: "LIST" },
        "YarnIntakeStats",
      ],
    }),

    // ─── DELETE /yarn-outcomes/{id}/ ───────────────────────────
    deleteYarnOutcome: builder.mutation({
      query: (id) => ({
        url: `/yarn-outcomes/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "YarnOutcome", id: "LIST" },
        { type: "YarnIntake", id: "LIST" },
        "YarnIntakeStats",
      ],
    }),
  }),
});

export const {
  useGetYarnOutcomesQuery,
  useLazyGetYarnOutcomesQuery,
  useGetYarnOutcomeByIdQuery,
  useLazyGetYarnOutcomeByIdQuery,
  useCreateYarnOutcomeMutation,
  useUpdateYarnOutcomeMutation,
  usePatchYarnOutcomeMutation,
  useDeleteYarnOutcomeMutation,
} = yarnOutcomeApiSlice;
