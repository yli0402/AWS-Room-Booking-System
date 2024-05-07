import React from "react";
import CloseIconSVG from "../assets/close-icon.svg";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import dayjs from "dayjs";
import moment from "moment-timezone";

const EventDetailsModal = ({ event, onClose, onEdit, onDelete, type }) => {
  // const handleTest = () => {
  //   console.log("startDate " + event.startTime);
  //   console.log(
  //     "first: " + dayjs(event.startTime).format("YYYY-MM-DD hh:mm A"),
  //   );
  // };
  const formattedStartTime = moment(event.startTime)
    .tz(moment.tz.guess())
    .format("YYYY-MM-DD HH:mm z");
  const formattedEndTime = moment(event.endTime)
    .tz(moment.tz.guess())
    .format("YYYY-MM-DD HH:mm z");

  const userTimezone = moment.tz(moment.tz.guess()).zoneAbbr();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="group relative pl-3">
        <div className="absolute inset-0 transform rounded-3xl bg-gradient-to-br from-orange-300 to-theme-orange shadow-lg duration-300 group-hover:-rotate-3"></div>
        <div className="relative w-80 flex-col rounded-3xl bg-white p-6 pb-10 shadow-lg lg:w-96">
          <h1 className="font-natural mb-5 mt-1 text-3xl text-theme-dark-orange  lg:mt-2 ">
            {event.title}
          </h1>

          <p className="pb-2 text-lg  text-gray-800">Start Time:</p>
          <div className="mb-2 block w-full appearance-none rounded-md bg-orange-50 px-4 py-2 leading-tight text-black focus:bg-orange-50 focus:outline-none lg:mb-4">
            <p className="">
              <span>{dayjs(event.startTime).format("YYYY-MM-DD")}</span>
              <span className="ml-2">
                {dayjs(event.startTime).format("hh:mm A")}
              </span>
              <span className="ml-2">{userTimezone}</span>
            </p>
          </div>

          <p className="pb-2 text-lg  text-gray-800">End Time:</p>
          <div className="mb-2 block w-full appearance-none rounded-md bg-orange-50 px-4 py-2 leading-tight text-black focus:bg-orange-50 focus:outline-none lg:mb-4">
            <p>
              <span>{dayjs(event.endTime).format("YYYY-MM-DD")}</span>
              <span className="ml-2">
                {dayjs(event.endTime).format("hh:mm A")}
              </span>
              <span className="ml-2">{userTimezone}</span>
            </p>
          </div>
          {event.type === "event" && (
            <div className="flex justify-end gap-2">
              <button
                className="text-indigo-600 hover:text-indigo-900"
                onClick={() => onEdit(event.eventId)}
              >
                <FaEdit className="h-[27px] w-[25px]" />
              </button>
              <button
                className="text-red-600 hover:text-red-900"
                onClick={() => onDelete(event.eventId)}
              >
                <MdDelete className="h-7 w-7" />
              </button>
            </div>
          )}
        </div>
        <button
          className="absolute right-2 top-2 cursor-pointer p-2"
          onClick={onClose}
        >
          <img src={CloseIconSVG} alt="Close Icon" className="h-6 w-6" />
        </button>
      </div>
      {/* <div className="flex justify-center">
        <button
          onClick={handleTest}
          className="my-4 rounded bg-theme-orange px-12 py-2 text-black transition-colors duration-300 ease-in-out hover:bg-theme-dark-orange hover:text-white"
        >
          test
        </button>
      </div> */}
    </div>
  );
};

export default EventDetailsModal;
