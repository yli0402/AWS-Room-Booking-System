import React from "react";
import { DateRangePicker } from "rsuite";
import "rsuite/dist/rsuite-no-reset.min.css";
import { setSuggestedTimeInput } from "../slices/bookingSlice";
import { useDispatch, useSelector } from "react-redux";
import { nextDayAtTen, sevenDaysLaterAtMidnight } from "../utils/getDateTime";
import dayjs from "dayjs";
import {
  allowedMaxDays,
  beforeToday,
  combine,
} from "rsuite/cjs/DateRangePicker/disabledDateUtils";
import MoreInfo from "./MoreInfo";

const SuggestedTimeInput = () => {
  const dispatch = useDispatch();
  const { suggestedTimeInput } = useSelector((state) => state.booking);

  const predefinedRanges = [
    {
      label: "Next 7 Days",
      value: [nextDayAtTen, sevenDaysLaterAtMidnight],
    },
  ];

  const handleDurationChange = (e) => {
    const newDuration = e.target.value;
    dispatch(
      setSuggestedTimeInput({
        ...suggestedTimeInput,
        duration: newDuration,
      }),
    );
  };

  const handleUnitChange = (e) => {
    const newUnit = e.target.value;
    dispatch(
      setSuggestedTimeInput({
        ...suggestedTimeInput,
        unit: newUnit,
      }),
    );
  };

  const handleDateRangeChange = (value) => {
    if (!value) return;
    const formattedStartTime = dayjs(value[0]).format("YYYY-MM-DD HH:mm");
    const formattedEndTime = dayjs(value[1]).format("YYYY-MM-DD HH:mm");
    dispatch(
      setSuggestedTimeInput({
        ...suggestedTimeInput,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
      }),
    );
  };

  return (
    <div className="flex w-80 flex-col rounded-lg bg-gray-200 p-4">
      <div className="mb-2 flex items-center justify-start">
        <div className="mr-1">Flexible Start Time Range:</div>
        <MoreInfo
          info={
            "Select the (range) start time on the left panel and the end time on the right. If you need to select a range within the same day, please click on the same date twice."
          }
        />
      </div>

      <DateRangePicker
        format="yy-MMM-dd HH:mm"
        ranges={predefinedRanges}
        shouldDisableDate={combine(beforeToday(), allowedMaxDays(30))}
        onChange={handleDateRangeChange}
        cleanable={false}
        value={[
          new Date(suggestedTimeInput?.startTime),
          new Date(suggestedTimeInput?.endTime),
        ]}
      />
      <div className="mb-2 flex items-center justify-start">
        <div className="mr-1">Duration:</div>
        <MoreInfo
          info={
            "Meeting durations can range from a minimum of 30 minutes to a maximum of 24 hours, in increments of 30 minutes."
          }
        />
      </div>
      <div className="flex items-center justify-between">
        <input
          type="number"
          min={suggestedTimeInput.unit === "hours" ? ".5" : "30"}
          max={suggestedTimeInput.unit === "hours" ? "24" : "1440"}
          value={suggestedTimeInput?.duration}
          onChange={handleDurationChange}
          className="w-48 rounded-lg border px-4 py-1 focus:outline-none"
          placeholder="Duration"
          step={suggestedTimeInput.unit === "hours" ? ".5" : "30"}
        />

        <select
          value={suggestedTimeInput?.unit}
          onChange={handleUnitChange}
          className="cursor-pointer rounded-lg border px-1 py-1 focus:outline-none"
        >
          <option value="minutes">Minutes</option>
          <option value="hours">Hours</option>
        </select>
      </div>
    </div>
  );
};

export default SuggestedTimeInput;
