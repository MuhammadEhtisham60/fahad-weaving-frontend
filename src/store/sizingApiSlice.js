import { apiSlice } from "./apiSlice.js";

export const sizingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ─── GET /sizings/choices/ ─────────────────────────────────
    getSizingChoices: builder.query({
      query: () => "/sizings/choices/",
      providesTags: ["SizingChoices"],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── GET /sizings/ (paginated + filters) ───────────────────
    getSizings: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.set("page", String(params.page));
        if (params.page_size) searchParams.set("page_size", String(params.page_size));
        if (params.search) searchParams.set("search", params.search);
        if (params.status) searchParams.set("status", params.status);
        if (params.ordering) searchParams.set("ordering", params.ordering);

        const qs = searchParams.toString();
        return `/sizings/${qs ? `?${qs}` : ""}`;
      },
      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map((s) => ({ type: "Sizing", id: s.id })),
              { type: "Sizing", id: "LIST" },
            ]
          : [{ type: "Sizing", id: "LIST" }],
    }),

    // ─── GET /sizings/{id}/ ────────────────────────────────────
    getSizingById: builder.query({
      query: (id) => `/sizings/${id}/`,
      providesTags: (result, error, id) => [{ type: "Sizing", id }],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── GET /sizings/{id}/outcomes/ ───────────────────────────
    getSizingOutcomesBySizingId: builder.query({
      query: (id) => `/sizings/${id}/outcomes/`,
      providesTags: (result, error, id) => [{ type: "SizingOutcome", id: `SIZING_${id}` }],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── POST /sizings/ (Create) ───────────────────────────────
    createSizing: builder.mutation({
      query: (payload) => ({
        url: "/sizings/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "Sizing", id: "LIST" }, "SizingChoices"],
    }),

    // ─── PUT /sizings/{id}/ (Full Update) ──────────────────────
    updateSizing: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/sizings/${id}/`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Sizing", id },
        { type: "Sizing", id: "LIST" },
        "SizingChoices",
      ],
    }),

    // ─── PATCH /sizings/{id}/ (Partial Update) ─────────────────
    patchSizing: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/sizings/${id}/`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Sizing", id },
        { type: "Sizing", id: "LIST" },
        "SizingChoices",
      ],
    }),

    // ─── DELETE /sizings/{id}/ ─────────────────────────────────
    deleteSizing: builder.mutation({
      query: (id) => ({
        url: `/sizings/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Sizing", id: "LIST" }, "SizingChoices"],
    }),
  }),
});

export const {
  useGetSizingChoicesQuery,
  useGetSizingsQuery,
  useLazyGetSizingsQuery,
  useGetSizingByIdQuery,
  useLazyGetSizingByIdQuery,
  useGetSizingOutcomesBySizingIdQuery,
  useCreateSizingMutation,
  useUpdateSizingMutation,
  usePatchSizingMutation,
  useDeleteSizingMutation,
} = sizingApiSlice;
