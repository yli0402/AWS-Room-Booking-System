import { EVENTS_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const eventsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query({
      query: () => ({
        url: EVENTS_URL,
      }),
      providesTags: ["Event"],
      keepUnusedDataFor: 5,
    }),

    createEvent: builder.mutation({
      query: (newEvent) => ({
        url: `${EVENTS_URL}/create`,
        method: "POST",
        body: newEvent,
      }),
      invalidatesTags: ["Event"],
    }),

    updateEvent: builder.mutation({
      query: ({ eventId, updatedEvent }) => ({
        url: `${EVENTS_URL}/${eventId}`,
        method: "PUT",
        body: updatedEvent,
      }),
      invalidatesTags: ["Event"],
    }),

    deleteEvent: builder.mutation({
      query: (eventId) => ({
        url: `${EVENTS_URL}/${eventId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Event"],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} = eventsApiSlice;
