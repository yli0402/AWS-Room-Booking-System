import { USERS_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: `${USERS_URL}/login`,
        method: "POST",
        body: credentials,
      }),
    }),

    getUsers: builder.query({
      query: () => ({
        url: USERS_URL,
      }),
      providesTags: ["User"],
      keepUnusedDataFor: 5,
    }),

    getAllEmails: builder.query({
      query: () => ({
        url: `${USERS_URL}/all-email`,
      }),
      providesTags: ["User"],
      keepUnusedDataFor: 5,
    }),

    getUserById: builder.query({
      query: (userId) => ({
        url: `${USERS_URL}/${userId}`,
      }),
      providesTags: ["User"],
      keepUnusedDataFor: 5,
    }),

    createUser: builder.mutation({
      query: (newUser) => ({
        url: `${USERS_URL}/create`,
        method: "POST",
        body: newUser,
      }),
      invalidatesTags: ["User"],
    }),

    updateUser: builder.mutation({
      query: ({ id, user }) => ({
        url: `${USERS_URL}/update/${id}`,
        method: "PUT",
        body: user,
      }),
      invalidatesTags: ["User"],
    }),

    uploadUserCSV: builder.mutation({
      query: (formData) => ({
        url: `${USERS_URL}/upload`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useGetAllEmailsQuery,
  useUpdateUserMutation,
  useUploadUserCSVMutation,
} = usersApiSlice;
