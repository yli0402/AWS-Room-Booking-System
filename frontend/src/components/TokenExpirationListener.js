import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../slices/authSlice";
import { resetBooking } from "../slices/bookingSlice";

const TokenExpirationListener = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    const handleTokenExpired = () => {
      console.log("listener works!");
      dispatch(logout());
      dispatch(resetBooking());
    };

    window.addEventListener("token-expired", handleTokenExpired);

    return () => {
      window.removeEventListener("token-expired", handleTokenExpired);
    };
  }, [navigate]);

  return null;
};
export default TokenExpirationListener;
