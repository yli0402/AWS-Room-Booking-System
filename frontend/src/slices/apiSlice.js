// parent to other API slices (needed for api/backend request)

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth?.userInfo?.token;
    if (token) {
      if (Date.now() >= jwtDecode(token).exp * 1000) {
        localStorage.setItem("userInfo", null);
        toast.error(`Your session has expired, please login again.`);

        const event = new CustomEvent("token-expired");
        window.dispatchEvent(event);
      }
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  },
});
export const apiSlice = createApi({
  baseQuery: baseQuery,
  tagTypes: ["Room", "User", "Event", "Booking"],
  endpoints: (builder) => ({}),
});
