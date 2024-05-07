import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = ({ handleLogout, handleNavbarClick, isAdmin = false }) => {
  // Inside your component
  const location = useLocation();
  const isRoomManagementPage = location.pathname === "/roomManagementPage";
  const isUserManagementPage = location.pathname === "/userManagementPage";
  const isBookingPage = location.pathname === "/booking";
  const isBookingHistoryPage = location.pathname === "/bookingHistory";
  const isUserSchedulePage = location.pathname === "/userSchedule";

  return (
    <>
      {" "}
      <div className="py-1">
        <Link
          to={"/booking"}
          className={`block  px-4 py-2 text-sm   ${isBookingPage ? "cursor-not-allowed text-gray-500 md:text-gray-300" : "text-white hover:text-theme-orange  md:text-gray-500"}`}
          id="booking"
          onClick={handleNavbarClick}
        >
          New Booking
        </Link>
        <Link
          to={"/bookingHistory"}
          className={`block  px-4 py-2 text-sm   ${isBookingHistoryPage ? "cursor-not-allowed text-gray-500 md:text-gray-300" : "text-white hover:text-theme-orange  md:text-gray-500"}`}
          id="booking-history"
          onClick={handleNavbarClick}
        >
          My Bookings
        </Link>
        <Link
          to={"/userSchedule"}
          className={`block  px-4 py-2 text-sm   ${isUserSchedulePage ? "cursor-not-allowed text-gray-500 md:text-gray-300" : "text-white hover:text-theme-orange  md:text-gray-500"}`}
          id="user-availability"
          onClick={handleNavbarClick}
        >
          My Schedule
        </Link>
      </div>
      <div className={`py-1 ${isAdmin ? "" : "hidden"}`}>
        <Link
          to={"/userManagementPage"}
          className={`block  px-4 py-2 text-sm   ${isUserManagementPage ? "cursor-not-allowed text-gray-500 md:text-gray-300" : "text-white hover:text-theme-orange md:text-gray-500"}`}
          id="user-management"
          onClick={handleNavbarClick}
        >
          Manage Users
        </Link>
        <Link
          to={"/roomManagementPage"}
          className={`block  px-4 py-2 text-sm   ${isRoomManagementPage ? "cursor-not-allowed text-gray-500 md:text-gray-300" : "text-white hover:text-theme-orange  md:text-gray-500"}`}
          id="room-management"
          onClick={handleNavbarClick}
        >
          Manage Rooms
        </Link>
      </div>
      <div className="py-1">
        <div
          className="cursor-pointer px-4 py-2 text-sm  text-white hover:text-red-500 md:text-gray-500"
          id="logout"
          onClick={handleLogout}
        >
          Log Out
        </div>
      </div>
    </>
  );
};

export default Navbar;
