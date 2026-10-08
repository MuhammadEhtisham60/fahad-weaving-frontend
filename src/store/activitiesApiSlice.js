import { apiSlice } from "./apiSlice.js";

export const activitiesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ─── GET /activities/ (paginated + filters) ─────────────────
    getActivities: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.search) searchParams.set("search", params.search);
        if (params.action) searchParams.set("action", params.action);
        if (params.username) searchParams.set("username", params.username);
        if (params.date_from) searchParams.set("date_from", params.date_from);
        if (params.date_to) searchParams.set("date_to", params.date_to);
        if (params.page) searchParams.set("page", String(params.page));
        if (params.page_size) searchParams.set("page_size", String(params.page_size));

        const qs = searchParams.toString();
        return `/activities/${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Activity"],
    }),
  }),
});

export const { useGetActivitiesQuery, useLazyGetActivitiesQuery } =
  activitiesApiSlice;
