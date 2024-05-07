import React, { useEffect, useState } from "react";
import { Outlet, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const AdminRoute = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is not logged in
    if (!userInfo) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
    } else if (userInfo.role !== "admin") {
      // Check if user is not an admin
      toast.warn("Access denied.");
      navigate("/");
    } else {
      setIsAdmin(true); // User is an admin
    }
  }, [userInfo, navigate, location.pathname]);

  return isAdmin ? <Outlet /> : null;
};

export default AdminRoute;
