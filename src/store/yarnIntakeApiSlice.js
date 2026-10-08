import { apiSlice } from "./apiSlice.js";

export const yarnIntakeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ─── GET /yarn-intakes/stats/ ──────────────────────────────
    getYarnIntakeStats: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.search) searchParams.set("search", params.search);
        if (params.supplier) searchParams.set("supplier", params.supplier);
        if (params.yarn_type) searchParams.set("yarn_type", params.yarn_type);
        if (params.yarn_count) searchParams.set("yarn_count", params.yarn_count);
        if (params.date_after) searchParams.set("date_after", params.date_after);
        if (params.date_before) searchParams.set("date_before", params.date_before);
        const qs = searchParams.toString();
        return `/yarn-intakes/stats/${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["YarnIntakeStats"],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── GET /yarn-intakes/ (paginated + filters) ──────────────
    getYarnIntakes: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.set("page", String(params.page));
        if (params.page_size) searchParams.set("page_size", String(params.page_size));
        if (params.search) searchParams.set("search", params.search);
        if (params.supplier) searchParams.set("supplier", params.supplier);
        if (params.yarn_type) searchParams.set("yarn_type", params.yarn_type);
        if (params.yarn_count) searchParams.set("yarn_count", params.yarn_count);
        if (params.date_after) searchParams.set("date_after", params.date_after);
        if (params.date_before) searchParams.set("date_before", params.date_before);
        if (params.ordering) searchParams.set("ordering", params.ordering);

        const qs = searchParams.toString();
        return `/yarn-intakes/${qs ? `?${qs}` : ""}`;
      },
      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map((y) => ({ type: "YarnIntake", id: y.id })),
              { type: "YarnIntake", id: "LIST" },
            ]
          : [{ type: "YarnIntake", id: "LIST" }],
    }),

    // ─── GET /yarn-intakes/{id}/ ───────────────────────────────
    getYarnIntakeById: builder.query({
      query: (id) => `/yarn-intakes/${id}/`,
      providesTags: (result, error, id) => [{ type: "YarnIntake", id }],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── POST /yarn-intakes/ (Create) ──────────────────────────
    createYarnIntake: builder.mutation({
      query: (payload) => ({
        url: "/yarn-intakes/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "YarnIntake", id: "LIST" }, "YarnIntakeStats"],
    }),

    // ─── PUT /yarn-intakes/{id}/ (Full Update) ─────────────────
    updateYarnIntake: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/yarn-intakes/${id}/`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "YarnIntake", id },
        { type: "YarnIntake", id: "LIST" },
        "YarnIntakeStats",
      ],
    }),

    // ─── PATCH /yarn-intakes/{id}/ (Partial Update) ────────────
    patchYarnIntake: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/yarn-intakes/${id}/`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "YarnIntake", id },
        { type: "YarnIntake", id: "LIST" },
        "YarnIntakeStats",
      ],
    }),

    // ─── DELETE /yarn-intakes/{id}/ ────────────────────────────
    deleteYarnIntake: builder.mutation({
      query: (id) => ({
        url: `/yarn-intakes/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "YarnIntake", id: "LIST" }, "YarnIntakeStats"],
    }),
  }),
});

export const {
  useGetYarnIntakeStatsQuery,
  useGetYarnIntakesQuery,
  useLazyGetYarnIntakesQuery,
  useGetYarnIntakeByIdQuery,
  useLazyGetYarnIntakeByIdQuery,
  useCreateYarnIntakeMutation,
  useUpdateYarnIntakeMutation,
  usePatchYarnIntakeMutation,
  useDeleteYarnIntakeMutation,
} = yarnIntakeApiSlice;
