import React, { useState } from "react";
import SuggestedTimeCalendar from "../components/SuggestedTime/SuggestedTimeCalendar";
import { useDispatch, useSelector } from "react-redux";
import {
  setStartTime,
  setStartDate,
  setDuration,
  setUnit,
  setSuggestedTimeReceived,
  setSuggestedTimeMode,
} from "../slices/bookingSlice";
import dayjs from "dayjs";
import { toast } from "react-toastify";

const TimeSuggestionModal = ({ onCancel, setIsModalOpen }) => {
  const { suggestedTimeReceived, suggestedTimeInput } = useSelector(
    (state) => state.booking,
  );
  const [selectedDate, setSelectedDate] = useState(
    Object.keys(suggestedTimeReceived)?.length > 0
      ? new Date(Object.keys(suggestedTimeReceived)[0] + "T00:00:00")
      : new Date(),
  );
  const dispatch = useDispatch();

  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  const formattedSelectedDate = selectedDate.toISOString().split("T")[0];

  const timeSlots = suggestedTimeReceived[formattedSelectedDate] || [];

  const onConfirm = () => {
    if (!selectedTimeSlot) {
      toast.warning("Please select a time slot");
      return;
    }

    const startDateTime = dayjs(
      `${formattedSelectedDate} ${selectedTimeSlot}`,
      "YYYY-MM-DD HH:mm",
    );

    dispatch(setStartDate(startDateTime.format("YYYY-MM-DD")));
    dispatch(setStartTime(startDateTime.format("HH:mm")));
    dispatch(setDuration(suggestedTimeInput.duration));
    dispatch(setUnit(suggestedTimeInput.unit));

    dispatch(setSuggestedTimeMode(false));
    dispatch(setSuggestedTimeReceived({}));
    setIsModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative max-h-full w-full flex-col rounded-3xl bg-white p-6 shadow-lg md:w-3/4">
        <div className="flex flex-col items-center justify-center">
          <div className="flex flex-col gap-4 xl:flex-row xl:gap-x-8">
            <SuggestedTimeCalendar
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedTimeSlot={selectedTimeSlot}
              setSelectedTimeSlot={setSelectedTimeSlot}
            />
            {/* Available Time Slot */}
            <div className="grid h-64 w-full grid-cols-3 gap-2 overflow-y-auto rounded-md  xl:h-[300px]  xl:min-w-96 xl:grid-cols-2 ">
              {timeSlots.map((time, index) => (
                <button
                  key={index}
                  className={`cursor-pointer rounded-lg py-1 text-sm transition-colors duration-300 ease-in-out hover:opacity-60 md:py-2  md:text-base
                    ${selectedTimeSlot === time ? "bg-[#dd7832] text-white" : "bg-[#ffe6c6] text-[#744400]"} `}
                  onClick={() => setSelectedTimeSlot(time)}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-6">
            <button
              className="h-8 w-24 rounded bg-theme-orange text-black transition-colors  duration-300 ease-in-out hover:bg-theme-dark-orange hover:text-white xl:h-10 xl:w-28"
              onClick={onConfirm}
            >
              Confirm
            </button>
            <button
              className="h-8 w-24 rounded bg-theme-dark-blue text-white transition-colors duration-300 ease-in-out hover:bg-theme-blue hover:text-white xl:h-10 xl:w-28"
              onClick={onCancel}
            >
              Back
            </button>
          </div>
          <div className="mt-4 text-center text-sm text-yellow-400 md:mx-6">
            After you confirm, the timeslot you chose will be automatically
            entered into the "Fixed" mode.
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSuggestionModal;
