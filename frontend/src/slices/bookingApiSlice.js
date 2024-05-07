import { BOOKING_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const bookingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAvailableRooms: builder.mutation({
      query: (bookingData) => ({
        url: `${BOOKING_URL}/available-room`,
        method: "POST",
        body: bookingData,
      }),
      providesTags: ["Booking"],
    }),

    getSuggestedTime: builder.mutation({
      query: (timeData) => ({
        url: `${BOOKING_URL}/time-suggestion`,
        method: "POST",
        body: timeData,
      }),
      providesTags: ["Booking"],
    }),

    confirmBooking: builder.mutation({
      query: (bookingData) => ({
        url: `${BOOKING_URL}/create`,
        method: "POST",
        body: bookingData,
      }),
      invalidatesTags: ["Booking"],
    }),

    getBooking: builder.query({
      query: () => ({
        url: BOOKING_URL,
      }),
      providesTags: ["Booking"],
      keepUnusedDataFor: 5,
    }),

    getBookingCurrentUser: builder.query({
      query: () => ({
        url: `${BOOKING_URL}/currentUser`,
      }),
      providesTags: ["Booking"],
      keepUnusedDataFor: 5,
    }),

    updateBooking: builder.mutation({
      query: ({ bookingId, updatedBooking }) => ({
        url: `${BOOKING_URL}/${bookingId}`,
        method: "PUT",
        body: updatedBooking,
      }),
      invalidatesTags: ["Booking"],
    }),
  }),
});

export const {
  useGetAvailableRoomsMutation,
  useConfirmBookingMutation,
  useGetBookingCurrentUserQuery,
  useGetBookingQuery,
  useUpdateBookingMutation,
  useGetSuggestedTimeMutation,
} = bookingApiSlice;
