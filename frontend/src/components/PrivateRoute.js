import React, { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
// Outlet is what we want to return if we logged in
// If we don't log in, we need Navigate to redirect us

import { useSelector } from "react-redux";
// we can get state to check if we have access token

const PrivateRoute = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  useEffect(() => {
    if (!userInfo) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
    }
  }, [userInfo, navigate, location]);
  return userInfo ? <Outlet /> : null;
};

export default PrivateRoute;
