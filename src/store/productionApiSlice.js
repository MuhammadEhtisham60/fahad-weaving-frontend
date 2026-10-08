import { apiSlice } from "./apiSlice.js";

export const productionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ─── GET /factory/productions/stats/ ───────────────────────
    getProductionStats: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.date_after) searchParams.set("date_after", params.date_after);
        if (params.date_before) searchParams.set("date_before", params.date_before);
        if (params.loom) searchParams.set("loom", String(params.loom));
        if (params.beam) searchParams.set("beam", String(params.beam));
        const qs = searchParams.toString();
        return `/factory/productions/stats/${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["ProductionStats"],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── GET /factory/productions/ (paginated + filters) ───────
    getProductions: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.set("page", String(params.page));
        if (params.page_size) searchParams.set("page_size", String(params.page_size));
        if (params.search) searchParams.set("search", params.search);
        if (params.beam_loading) searchParams.set("beam_loading", String(params.beam_loading));
        if (params.beam) searchParams.set("beam", String(params.beam));
        if (params.loom) searchParams.set("loom", String(params.loom));
        if (params.shift) searchParams.set("shift", params.shift);
        if (params.date_after) searchParams.set("date_after", params.date_after);
        if (params.date_before) searchParams.set("date_before", params.date_before);
        if (params.ordering) searchParams.set("ordering", params.ordering);

        const qs = searchParams.toString();
        return `/factory/productions/${qs ? `?${qs}` : ""}`;
      },
      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map((p) => ({ type: "Production", id: p.id })),
              { type: "Production", id: "LIST" },
            ]
          : [{ type: "Production", id: "LIST" }],
    }),

    // ─── GET /factory/productions/{id}/ ────────────────────────
    getProductionById: builder.query({
      query: (id) => `/factory/productions/${id}/`,
      providesTags: (result, error, id) => [{ type: "Production", id }],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── POST /factory/productions/ (Create) ───────────────────
    createProduction: builder.mutation({
      query: (payload) => ({
        url: "/factory/productions/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        { type: "Production", id: "LIST" },
        "ProductionStats",
        { type: "BeamLoading", id: "LIST" },
        "ActiveBeamLoading",
        "AvailableBeams",
        { type: "Beam", id: "LIST" },
        { type: "Loom", id: "LIST" },
        "LoomStats",
      ],
    }),

    // ─── PATCH /factory/productions/{id}/ (Partial Update) ─────
    patchProduction: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/factory/productions/${id}/`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Production", id },
        { type: "Production", id: "LIST" },
        "ProductionStats",
      ],
    }),

    // ─── DELETE /factory/productions/{id}/ ─────────────────────
    deleteProduction: builder.mutation({
      query: (id) => ({
        url: `/factory/productions/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Production", id: "LIST" },
        "ProductionStats",
        { type: "BeamLoading", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetProductionStatsQuery,
  useGetProductionsQuery,
  useLazyGetProductionsQuery,
  useGetProductionByIdQuery,
  useLazyGetProductionByIdQuery,
  useCreateProductionMutation,
  usePatchProductionMutation,
  useDeleteProductionMutation,
} = productionApiSlice;
