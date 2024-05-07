import React, { useEffect, useState } from "react";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials, logout } from "../slices/authSlice";
import { useLoginMutation } from "../slices/usersApiSlice";
import { setUngroupedAttendees } from "../slices/bookingSlice";
import { toast } from "react-toastify";

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading }] = useLoginMutation();
  const { search } = useLocation(); // 'useLocation' hook returns the location object from the current URL
  // 'search' returns a string containing all the query parameters.
  const searchParams = new URLSearchParams(search); // extract the query parameter and its value
  const redirect = searchParams.get("redirect");

  const handleLogin = async (res) => {
    try {
      const response = await login({ token: res.credential }).unwrap();
      const decodedUserInfo = jwtDecode(response?.token);
      const avatarLink = jwtDecode(res.credential).picture; // get the user's avatar link from the token
      dispatch(
        setCredentials({
          ...decodedUserInfo,
          avatar: avatarLink,
          token: response?.token,
        }),
      );

      // If the user's role is "admin", navigate to the redirect page if it exists, otherwise navigate to the admin home page.
      if (decodedUserInfo.role === "admin") {
        navigate(redirect || "/adminHomePage");
      } else {
        navigate(redirect || "/");
      }
    } catch (err) {
      toast.error(err?.data?.error || "Login failed");
    }
  };

  const handleLogout = () => {
    try {
      dispatch(logout());
      googleLogout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center">
      <div className="flex h-96 w-auto flex-col items-center  bg-white shadow-2xl">
        <p className="w-80 border-b-[1.4px] border-zinc-400 px-5 py-4 text-center text-lg font-extralight text-zinc-500 opacity-60">
          Log In and Get Started
        </p>
        <div className="group relative shadow-xl">
          <div className="mt-7 rounded-md bg-theme-orange opacity-40 duration-300 group-hover:translate-x-3 group-hover:translate-y-3"></div>
          {/* Google Login Button */}
          <GoogleLogin
            onSuccess={handleLogin}
            onError={() => {
              toast.error("Login failed");
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
