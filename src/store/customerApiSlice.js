import { apiSlice } from "./apiSlice.js";

export const customerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ─── GET /sales/customers/stats/ ──────────────────────────
    getCustomerStats: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.search) searchParams.set("search", params.search);
        if (params.status) searchParams.set("status", params.status);
        if (params.customer_type) searchParams.set("customer_type", params.customer_type);
        if (params.created_after) searchParams.set("created_after", params.created_after);
        if (params.created_before) searchParams.set("created_before", params.created_before);
        const qs = searchParams.toString();
        return `/sales/customers/stats/${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["CustomerStats"],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── GET /sales/customers/choices/ ────────────────────────
    getCustomerChoices: builder.query({
      query: () => "/sales/customers/choices/",
      providesTags: ["CustomerChoices"],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── GET /sales/customers/ (paginated + filters) ──────────
    getCustomers: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.search) searchParams.set("search", params.search);
        if (params.status) searchParams.set("status", params.status);
        if (params.customer_type) searchParams.set("customer_type", params.customer_type);
        if (params.created_after) searchParams.set("created_after", params.created_after);
        if (params.created_before) searchParams.set("created_before", params.created_before);
        if (params.ordering) searchParams.set("ordering", params.ordering);
        if (params.page) searchParams.set("page", String(params.page));
        if (params.page_size) searchParams.set("page_size", String(params.page_size));

        const qs = searchParams.toString();
        return `/sales/customers/${qs ? `?${qs}` : ""}`;
      },
      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map((c) => ({ type: "Customer", id: c.id })),
              { type: "Customer", id: "LIST" },
            ]
          : [{ type: "Customer", id: "LIST" }],
    }),

    // ─── GET /sales/customers/{id}/ ───────────────────────────
    getCustomerById: builder.query({
      query: (id) => `/sales/customers/${id}/`,
      providesTags: (result, error, id) => [{ type: "Customer", id }],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── POST /sales/customers/ (Create) ──────────────────────
    createCustomer: builder.mutation({
      query: (payload) => ({
        url: "/sales/customers/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "Customer", id: "LIST" }, "CustomerStats"],
    }),

    // ─── PUT /sales/customers/{id}/ (Full Update) ─────────────
    updateCustomer: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/sales/customers/${id}/`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Customer", id },
        { type: "Customer", id: "LIST" },
        "CustomerStats",
      ],
    }),

    // ─── PATCH /sales/customers/{id}/ (Partial Update) ────────
    patchCustomer: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/sales/customers/${id}/`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Customer", id },
        { type: "Customer", id: "LIST" },
        "CustomerStats",
      ],
    }),

    // ─── DELETE /sales/customers/{id}/ ────────────────────────
    deleteCustomer: builder.mutation({
      query: (id) => ({
        url: `/sales/customers/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Customer", id: "LIST" }, "CustomerStats"],
    }),
  }),
});

export const {
  useGetCustomerStatsQuery,
  useGetCustomerChoicesQuery,
  useGetCustomersQuery,
  useLazyGetCustomersQuery,
  useGetCustomerByIdQuery,
  useLazyGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  usePatchCustomerMutation,
  useDeleteCustomerMutation,
} = customerApiSlice;
