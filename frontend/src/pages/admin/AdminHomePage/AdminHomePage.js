import React from "react";
import { Link } from "react-router-dom";
import RoomMngtSVG from "../../../assets/room-mngt.svg";
import UserMngtSVG from "../../../assets/user-mngt.svg";
import RoomIconSVG from "../../../assets/room-icon.svg";
import UserIconSVG from "../../../assets/user-icon.svg";
import QuestionMarkIconSVG from "../../../assets/question-mark-icon.svg";
import Tooltip from "@mui/material/Tooltip";

function AdminHomePage() {
  return (
    <div className="flex  flex-col items-center justify-center font-amazon-ember">
      <h1 className="mx-10 mb-16 mt-6 text-center text-4xl text-theme-dark-blue  lg:text-5xl">
        Booking Administration System
      </h1>
      <div className="mb-14 flex-col gap-4 sm:flex">
        <div className="flex flex-col items-center md:flex-row">
          <div className="min-w-16">
            <img src={RoomIconSVG} alt="Room Mngt Icon" className="h-10 w-16" />
          </div>
          <p className="w-96 px-4  text-center md:ml-10 md:w-[550px]  md:text-start lg:w-[770px]">
            Room Management allows you to add/change/deactivate rooms into the
            system and record various features of the room.
          </p>
        </div>
        <div className="flex flex-col items-center md:flex-row">
          <div className="min-w-16">
            <img src={UserIconSVG} alt="User Mngt Icon" className="h-10 w-16" />
          </div>
          <p className="w-96 px-4 text-center md:ml-10 md:w-[550px] md:text-start lg:w-[775px]">
            User Management allows you to import and input user information (up
            to 1000 users) into the profile database and to perform
            change/deactivate staff information.
          </p>
        </div>
      </div>
      <div className="my-1 flex flex-col gap-5 md:flex-row md:gap-10">
        <div className="mx-10 flex w-auto flex-col items-center bg-white px-5 py-5 shadow-xl transition-all duration-300 hover:shadow-2xl md:mx-0 md:w-8/12 md:px-9">
          <img
            className="h-40 object-cover md:h-60"
            alt="Room Management"
            src={RoomMngtSVG}
          />
          <div className="flex flex-row items-center justify-center">
            <h2 className="p-3 text-2xl">Room Management</h2>
            <Tooltip title="Manage your rooms effectively by adding, changing, or deactivating room.">
              <img
                className="size-5"
                alt="question mark"
                src={QuestionMarkIconSVG}
              />
            </Tooltip>
          </div>

          <div className="m-5">
            <Link
              to="/roomManagementPage"
              className="rounded bg-theme-orange px-10 py-2 text-black transition-colors duration-300  ease-in-out hover:bg-theme-dark-orange hover:text-white"
            >
              Go
            </Link>
          </div>
        </div>
        <div className="mx-10 flex w-auto flex-col items-center bg-white px-5 py-5 shadow-xl transition-all duration-300 hover:shadow-2xl md:mx-0 md:w-8/12 md:px-9">
          <img
            className="h-40 object-cover md:h-60"
            alt="User Management"
            src={UserMngtSVG}
          />
          <div className="flex items-center justify-center">
            <h2 className="p-3 text-2xl">User Management</h2>
            <Tooltip title="Manage user profiles by importing user data, and performing updates or deactivations.">
              <img
                className="size-5"
                alt="question mark"
                src={QuestionMarkIconSVG}
              />
            </Tooltip>
          </div>

          <div className="m-5">
            <Link
              to="/userManagementPage"
              className="rounded bg-theme-orange px-10 py-2 text-theme-dark-blue transition-colors duration-300  ease-in-out hover:bg-theme-dark-orange hover:text-white"
            >
              Go
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminHomePage;
