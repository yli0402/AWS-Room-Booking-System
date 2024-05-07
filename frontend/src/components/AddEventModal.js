import React, { useState } from "react";
import CloseIconSVG from "../assets/close-icon.svg";
import dayjs from "dayjs";

const AddEventModal = ({ onAdd, onClose, selectedDate }) => {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(
    dayjs(selectedDate).format("YYYY-MM-DD"),
  );
  const [startTime, setStartTime] = useState("00:00");
  const [endDate, setEndDate] = useState(
    dayjs(selectedDate).format("YYYY-MM-DD"),
  );
  const [endTime, setEndTime] = useState("00:00");

  const handleAddEvent = (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    if (
      dayjs(startDateTime).isAfter(dayjs(endDateTime)) ||
      dayjs(startDateTime).isSame(dayjs(endDateTime))
    ) {
      alert("End time should be later than start time.");
      return;
    }

    const newEvent = {
      title,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
    };
    onAdd(newEvent);
  };

  // const handleTest = () => {
  //   console.log("startDate " + startDate + "" + startTime);
  //   const startDateTime = new Date(`${startDate}T${startTime}`);

  //   console.log("ASDFADF", startDateTime.toISOString());
  //   console.log(
  //     "first: " + dayjs.utc(startDateTime).format("YYYY-MM-DD HH:mm:ss"),
  //   );
  // };

  function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="group relative pl-3">
        <div className="absolute inset-0 transform rounded-3xl bg-gradient-to-br from-orange-300 to-theme-orange shadow-lg duration-300 group-hover:-rotate-3"></div>
        <form
          onSubmit={handleAddEvent}
          className="relative w-80 flex-col rounded-3xl bg-white p-6 shadow-lg lg:w-96"
        >
          <h1 className="font-natural mb-5 mt-1 text-2xl lg:mt-2 ">
            New Personal Event
          </h1>
          <label className="mb-1 block">
            Title <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-2 block w-full cursor-pointer appearance-none rounded-md bg-orange-50 px-4 py-2 leading-tight text-black focus:bg-orange-50 focus:outline-none"
            aria-label="Title"
            required
          />
          <label className="mb-1 block lg:mb-2">
            Start Date <span className="text-red-600">*</span>
          </label>
          <input
            type="date"
            min={getCurrentDate()}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mb-2 block w-full cursor-pointer appearance-none rounded-md bg-orange-50 px-4 py-2 leading-tight text-black focus:bg-orange-50 focus:outline-none lg:mb-4"
            aria-label="Date"
            required
          />
          <label className="mb-1 block lg:mb-2">
            Start Time <span className="text-red-600">*</span>
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mb-2 block w-full cursor-pointer appearance-none rounded-md bg-orange-50 px-4 py-2 leading-tight text-black focus:bg-orange-50 focus:outline-none lg:mb-4"
            aria-label="Start Time"
            required
          />
          <label className="mb-1 block lg:mb-2">
            End Date <span className="text-red-600">*</span>
          </label>
          <input
            type="date"
            min={getCurrentDate()}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mb-2 block w-full cursor-pointer appearance-none rounded-md bg-orange-50 px-4 py-2 leading-tight text-black focus:bg-orange-50 focus:outline-none lg:mb-4"
            aria-label="Date"
            required
          />
          <label className="mb-1 block lg:mb-2">
            End Time <span className="text-red-600">*</span>
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="mb-2 block w-full cursor-pointer appearance-none rounded-md bg-orange-50 px-4 py-2 leading-tight text-black focus:bg-orange-50 focus:outline-none lg:mb-4"
            aria-label="End Time"
            required
          />
          <div className="flex justify-center">
            <button
              type="submit"
              className="mb-3 mt-5 rounded bg-theme-orange px-12 py-2 text-black transition-colors duration-300 ease-in-out hover:bg-theme-dark-orange hover:text-white lg:mb-4"
            >
              Confirm
            </button>
          </div>
        </form>

        <button
          className="absolute right-4 top-5 cursor-pointer p-2"
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

export default AddEventModal;
