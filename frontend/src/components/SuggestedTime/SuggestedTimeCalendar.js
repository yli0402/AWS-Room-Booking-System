import React, { useMemo } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./index.css";
import { useSelector } from "react-redux";

const SuggestedTimeCalendar = ({
  selectedDate,
  setSelectedDate,
  selectedTimeSlot,
  setSelectedTimeSlot,
}) => {
  const { suggestedTimeReceived } = useSelector((state) => state.booking);

  // Dynamically calculate allowedDates based on suggestedTimeReceived
  const allowedDates = useMemo(() => {
    // Ensure suggestedTimeReceived is an object before calling Object.keys
    const dates = suggestedTimeReceived
      ? Object.keys(suggestedTimeReceived)
      : [];
    return dates.map((dateStr) => new Date(dateStr + "T00:00:00"));
  }, [suggestedTimeReceived]);

  const tileDisabled = ({ date, view }) =>
    view === "month" && // Disable dates in month view
    !allowedDates.some(
      (allowedDate) =>
        date.getFullYear() === allowedDate.getFullYear() &&
        date.getMonth() === allowedDate.getMonth() &&
        date.getDate() === allowedDate.getDate(),
    );

  const tileClassName = ({ date: tileDate, view }) => {
    if (view === "month") {
      // If the tile date is today
      if (tileDate.toDateString() === new Date().toDateString()) {
        return "todayTile";
      }
    }
    return "";
  };

  return (
    <div>
      <Calendar
        className="myCalendar"
        onChange={(newDate) => {
          const newDateString = newDate.toISOString().split("T")[0];
          const selectedDateString = selectedDate.toISOString().split("T")[0];

          if (newDateString !== selectedDateString) {
            setSelectedTimeSlot(null); // reset time slot only if the date has changed
          }
          setSelectedDate(newDate);
        }}
        value={selectedDate}
        view="month"
        tileDisabled={tileDisabled}
        tileClassName={tileClassName}
      />
    </div>
  );
};

export default SuggestedTimeCalendar;
