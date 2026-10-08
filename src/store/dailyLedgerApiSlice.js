import { apiSlice } from "./apiSlice.js";

export const dailyLedgerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ─── GET /daily-ledger/summary/ (KPIs & Aggregates) ───────
    getDailyLedgerSummary: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.date_from) searchParams.set("date_from", params.date_from);
        if (params.date_to) searchParams.set("date_to", params.date_to);
        if (params.preset) searchParams.set("preset", params.preset);
        const qs = searchParams.toString();
        return `/daily-ledger/summary/${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["DailyLedgerSummary"],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── GET /daily-ledger/daily-view/ (Chronological Cash Sheet) ─
    getDailyLedgerSheetView: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.date) searchParams.set("date", params.date);
        const qs = searchParams.toString();
        return `/daily-ledger/daily-view/${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["DailyLedgerView"],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── GET /daily-ledger/ledgers/choices/ ────────────────────
    getDailyLedgerChoices: builder.query({
      query: () => "/daily-ledger/ledgers/choices/",
      providesTags: ["DailyLedgerChoices"],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── GET /daily-ledger/ledgers/stats/ ──────────────────────
    getDailyLedgerStats: builder.query({
      query: () => "/daily-ledger/ledgers/stats/",
      providesTags: ["DailyLedgerStats"],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── GET /daily-ledger/ledgers/ (Paginated List) ───────────
    getDailyLedgers: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.search) searchParams.set("search", params.search);
        if (params.date) searchParams.set("date", params.date);
        if (params.date_from) searchParams.set("date_from", params.date_from);
        if (params.date_to) searchParams.set("date_to", params.date_to);
        if (params.status) searchParams.set("status", params.status);
        if (params.preset) searchParams.set("preset", params.preset);
        if (params.ordering) searchParams.set("ordering", params.ordering);
        if (params.page) searchParams.set("page", String(params.page));
        if (params.page_size) searchParams.set("page_size", String(params.page_size));

        const qs = searchParams.toString();
        return `/daily-ledger/ledgers/${qs ? `?${qs}` : ""}`;
      },
      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map((l) => ({ type: "DailyLedger", id: l.id })),
              { type: "DailyLedger", id: "LIST" },
            ]
          : [{ type: "DailyLedger", id: "LIST" }],
    }),

    // ─── GET /daily-ledger/ledgers/{id}/ ───────────────────────
    getDailyLedgerById: builder.query({
      query: (id) => `/daily-ledger/ledgers/${id}/`,
      providesTags: (result, error, id) => [{ type: "DailyLedger", id }],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── GET /daily-ledger/ledgers/by-date/ ────────────────────
    getDailyLedgerByDate: builder.query({
      query: (date) => `/daily-ledger/ledgers/by-date/?date=${date}`,
      providesTags: ["DailyLedgerView"],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── POST /daily-ledger/ledgers/ (Create Ledger) ───────────
    createDailyLedger: builder.mutation({
      query: (payload) => ({
        url: "/daily-ledger/ledgers/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        { type: "DailyLedger", id: "LIST" },
        "DailyLedgerStats",
        "DailyLedgerSummary",
        "DailyLedgerView",
      ],
    }),

    // ─── PUT /daily-ledger/ledgers/{id}/ ───────────────────────
    updateDailyLedger: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/daily-ledger/ledgers/${id}/`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "DailyLedger", id },
        { type: "DailyLedger", id: "LIST" },
        "DailyLedgerStats",
        "DailyLedgerSummary",
        "DailyLedgerView",
      ],
    }),

    // ─── DELETE /daily-ledger/ledgers/{id}/ ────────────────────
    deleteDailyLedger: builder.mutation({
      query: (id) => ({
        url: `/daily-ledger/ledgers/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "DailyLedger", id: "LIST" },
        "DailyLedgerStats",
        "DailyLedgerSummary",
        "DailyLedgerView",
      ],
    }),

    // ─── POST /daily-ledger/ledgers/{id}/recalculate/ ──────────
    recalculateDailyLedger: builder.mutation({
      query: (id) => ({
        url: `/daily-ledger/ledgers/${id}/recalculate/`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "DailyLedger", id },
        { type: "DailyLedger", id: "LIST" },
        "DailyLedgerSummary",
        "DailyLedgerView",
      ],
    }),

    // ─── GET /daily-ledger/transactions/ (Transactions List) ───
    getLedgerTransactions: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.search) searchParams.set("search", params.search);
        if (params.transaction_date) searchParams.set("transaction_date", params.transaction_date);
        if (params.date_from) searchParams.set("date_from", params.date_from);
        if (params.date_to) searchParams.set("date_to", params.date_to);
        if (params.transaction_type) searchParams.set("transaction_type", params.transaction_type);
        if (params.category) searchParams.set("category", params.category);
        if (params.payment_method) searchParams.set("payment_method", params.payment_method);
        if (params.party_name) searchParams.set("party_name", params.party_name);
        if (params.min_amount) searchParams.set("min_amount", String(params.min_amount));
        if (params.max_amount) searchParams.set("max_amount", String(params.max_amount));
        if (params.preset) searchParams.set("preset", params.preset);
        if (params.ordering) searchParams.set("ordering", params.ordering);
        if (params.no_page) searchParams.set("no_page", String(params.no_page));
        if (params.page) searchParams.set("page", String(params.page));
        if (params.page_size) searchParams.set("page_size", String(params.page_size));

        const qs = searchParams.toString();
        return `/daily-ledger/transactions/${qs ? `?${qs}` : ""}`;
      },
      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map((tx) => ({ type: "LedgerTransaction", id: tx.id })),
              { type: "LedgerTransaction", id: "LIST" },
            ]
          : [{ type: "LedgerTransaction", id: "LIST" }],
    }),

    // ─── GET /daily-ledger/transactions/{id}/ ──────────────────
    getLedgerTransactionById: builder.query({
      query: (id) => `/daily-ledger/transactions/${id}/`,
      providesTags: (result, error, id) => [{ type: "LedgerTransaction", id }],
      transformResponse: (response) => response?.data ?? response,
    }),

    // ─── POST /daily-ledger/transactions/ (General Create) ─────
    createLedgerTransaction: builder.mutation({
      query: (payload) => ({
        url: "/daily-ledger/transactions/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        { type: "LedgerTransaction", id: "LIST" },
        { type: "DailyLedger", id: "LIST" },
        "DailyLedgerSummary",
        "DailyLedgerView",
        "DailyLedgerStats",
      ],
    }),

    // ─── POST /daily-ledger/transactions/incoming/ ─────────────
    createIncomingTransaction: builder.mutation({
      query: (payload) => ({
        url: "/daily-ledger/transactions/incoming/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        { type: "LedgerTransaction", id: "LIST" },
        { type: "DailyLedger", id: "LIST" },
        "DailyLedgerSummary",
        "DailyLedgerView",
        "DailyLedgerStats",
      ],
    }),

    // ─── POST /daily-ledger/transactions/outgoing/ ─────────────
    createOutgoingTransaction: builder.mutation({
      query: (payload) => ({
        url: "/daily-ledger/transactions/outgoing/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        { type: "LedgerTransaction", id: "LIST" },
        { type: "DailyLedger", id: "LIST" },
        "DailyLedgerSummary",
        "DailyLedgerView",
        "DailyLedgerStats",
      ],
    }),

    // ─── PUT /daily-ledger/transactions/{id}/ ──────────────────
    updateLedgerTransaction: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/daily-ledger/transactions/${id}/`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "LedgerTransaction", id },
        { type: "LedgerTransaction", id: "LIST" },
        { type: "DailyLedger", id: "LIST" },
        "DailyLedgerSummary",
        "DailyLedgerView",
        "DailyLedgerStats",
      ],
    }),

    // ─── DELETE /daily-ledger/transactions/{id}/ ───────────────
    deleteLedgerTransaction: builder.mutation({
      query: (id) => ({
        url: `/daily-ledger/transactions/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "LedgerTransaction", id: "LIST" },
        { type: "DailyLedger", id: "LIST" },
        "DailyLedgerSummary",
        "DailyLedgerView",
        "DailyLedgerStats",
      ],
    }),
  }),
});

export const {
  useGetDailyLedgerSummaryQuery,
  useLazyGetDailyLedgerSummaryQuery,
  useGetDailyLedgerSheetViewQuery,
  useLazyGetDailyLedgerSheetViewQuery,
  useGetDailyLedgerChoicesQuery,
  useGetDailyLedgerStatsQuery,
  useGetDailyLedgersQuery,
  useLazyGetDailyLedgersQuery,
  useGetDailyLedgerByIdQuery,
  useLazyGetDailyLedgerByIdQuery,
  useGetDailyLedgerByDateQuery,
  useLazyGetDailyLedgerByDateQuery,
  useCreateDailyLedgerMutation,
  useUpdateDailyLedgerMutation,
  useDeleteDailyLedgerMutation,
  useRecalculateDailyLedgerMutation,
  useGetLedgerTransactionsQuery,
  useLazyGetLedgerTransactionsQuery,
  useGetLedgerTransactionByIdQuery,
  useLazyGetLedgerTransactionByIdQuery,
  useCreateLedgerTransactionMutation,
  useCreateIncomingTransactionMutation,
  useCreateOutgoingTransactionMutation,
  useUpdateLedgerTransactionMutation,
  useDeleteLedgerTransactionMutation,
} = dailyLedgerApiSlice;
