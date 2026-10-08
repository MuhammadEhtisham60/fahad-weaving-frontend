import { apiSlice } from "./apiSlice.js";

export const supplierApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ─── GET /purchase/suppliers/stats/ ────────────────────────
    getSupplierStats: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.search) searchParams.set("search", params.search);
        if (params.status) searchParams.set("status", params.status);
        if (params.supplier_type) searchParams.set("supplier_type", params.supplier_type);
        if (params.created_after) searchParams.set("created_after", params.created_after);
        if (params.created_before) searchParams.set("created_before", params.created_before);
        const qs = searchParams.toString();
        return `/purchase/suppliers/stats/${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["SupplierStats"],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── GET /purchase/suppliers/choices/ ──────────────────────
    getSupplierChoices: builder.query({
      query: () => "/purchase/suppliers/choices/",
      providesTags: ["SupplierChoices"],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── GET /purchase/suppliers/ (paginated + filters) ────────
    getSuppliers: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.search) searchParams.set("search", params.search);
        if (params.status) searchParams.set("status", params.status);
        if (params.supplier_type) searchParams.set("supplier_type", params.supplier_type);
        if (params.created_after) searchParams.set("created_after", params.created_after);
        if (params.created_before) searchParams.set("created_before", params.created_before);
        if (params.ordering) searchParams.set("ordering", params.ordering);
        if (params.page) searchParams.set("page", String(params.page));
        if (params.page_size) searchParams.set("page_size", String(params.page_size));

        const qs = searchParams.toString();
        return `/purchase/suppliers/${qs ? `?${qs}` : ""}`;
      },
      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map((s) => ({ type: "Supplier", id: s.id })),
              { type: "Supplier", id: "LIST" },
            ]
          : [{ type: "Supplier", id: "LIST" }],
    }),

    // ─── GET /purchase/suppliers/{id}/ ─────────────────────────
    getSupplierById: builder.query({
      query: (id) => `/purchase/suppliers/${id}/`,
      providesTags: (result, error, id) => [{ type: "Supplier", id }],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── POST /purchase/suppliers/ (Create) ────────────────────
    createSupplier: builder.mutation({
      query: (payload) => ({
        url: "/purchase/suppliers/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "Supplier", id: "LIST" }, "SupplierStats"],
    }),

    // ─── PUT /purchase/suppliers/{id}/ (Full Update) ───────────
    updateSupplier: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/purchase/suppliers/${id}/`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Supplier", id },
        { type: "Supplier", id: "LIST" },
        "SupplierStats",
      ],
    }),

    // ─── PATCH /purchase/suppliers/{id}/ (Partial Update) ──────
    patchSupplier: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/purchase/suppliers/${id}/`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Supplier", id },
        { type: "Supplier", id: "LIST" },
        "SupplierStats",
      ],
    }),

    // ─── DELETE /purchase/suppliers/{id}/ ──────────────────────
    deleteSupplier: builder.mutation({
      query: (id) => ({
        url: `/purchase/suppliers/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Supplier", id: "LIST" }, "SupplierStats"],
    }),
  }),
});

export const {
  useGetSupplierStatsQuery,
  useGetSupplierChoicesQuery,
  useGetSuppliersQuery,
  useLazyGetSuppliersQuery,
  useGetSupplierByIdQuery,
  useLazyGetSupplierByIdQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  usePatchSupplierMutation,
  useDeleteSupplierMutation,
} = supplierApiSlice;
