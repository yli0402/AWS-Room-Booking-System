import { BUILDINGS_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const buildingsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBuildings: builder.query({
      query: () => ({
        url: BUILDINGS_URL,
      }),
      providesTags: ["Building"],
      keepUnusedDataFor: 5,
    }),

    getBuildingById: builder.query({
      query: (id) => ({
        url: `${BUILDINGS_URL}/${id}`,
      }),
      providesTags: ["Building"],
      keepUnusedDataFor: 5,
    }),

    createBuilding: builder.mutation({
      query: (building) => ({
        url: `${BUILDINGS_URL}/create`,
        method: "POST",
        body: building,
      }),
      invalidatesTags: ["Building"],
    }),

    updateBuilding: builder.mutation({
      query: ({ id, building }) => ({
        url: `${BUILDINGS_URL}/${id}`,
        method: "PUT",
        body: building,
      }),
      invalidatesTags: ["Building"],
    }),
  }),
});

export const {
  useGetBuildingsQuery,
  useGetBuildingByIdQuery,
  useCreateBuildingMutation,
  useUpdateBuildingMutation,
} = buildingsApiSlice;
