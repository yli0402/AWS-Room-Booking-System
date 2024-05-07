import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSuggestedTimeMode,
  toggleShowRecommended,
} from "../slices/bookingSlice";
import MoreInfo from "./MoreInfo";

const ToggleSuggestedTime = () => {
  const dispatch = useDispatch();
  const { suggestedTimeMode } = useSelector((state) => state.booking);

  return (
    <div className="flex h-[40px] items-center justify-center">
      <label
        className={`mr-2 cursor-pointer ${suggestedTimeMode ? "text-gray-400" : "text-theme-blue"}`}
        onClick={() => {
          if (suggestedTimeMode) {
            dispatch(setSuggestedTimeMode(!suggestedTimeMode));
          }
        }}
      >
        Fixed
      </label>
      <div
        className="relative cursor-pointer"
        onClick={() => {
          dispatch(setSuggestedTimeMode(!suggestedTimeMode));
        }}
      >
        <div
          className={`block h-8 w-14 rounded-full ${suggestedTimeMode ? "bg-orange-300" : "bg-blue-300"}`}
        ></div>
        <div
          className={`dot absolute left-1 top-1 h-6 w-6 rounded-full transition ${suggestedTimeMode ? "translate-x-6 transform bg-theme-dark-orange" : "bg-theme-blue"}`}
        ></div>
      </div>
      <label
        className={`ml-2 cursor-pointer ${suggestedTimeMode ? "text-theme-dark-orange" : "text-gray-400"}`}
        onClick={() => {
          if (!suggestedTimeMode) {
            dispatch(setSuggestedTimeMode(!suggestedTimeMode));
          }
        }}
      >
        Flexible
      </label>
      <MoreInfo
        info={
          "Specify a flexible start time range for the meeting and enter all attendees. The system will then generate a list of timeslots where all attendees are available."
        }
      />
    </div>
  );
};

export default ToggleSuggestedTime;
