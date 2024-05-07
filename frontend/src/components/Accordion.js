import React from "react";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { Collapse } from "react-collapse";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { useSelector } from "react-redux";

const Accordion = ({
  groupId,
  open,
  toggle,
  handleChange,
  options,
  initialValue,
}) => {
  const animatedComponents = makeAnimated();
  const { groupedAttendees, loggedInUser } = useSelector(
    (state) => state.booking,
  );
  // find the group by groupId
  const group = groupedAttendees?.find((group) => group.groupId === groupId);

  const initialAttendeesCount = group ? group.attendees.length : 0;

  // if loggedInUser's group matches groupId and adjust count
  const attendeesCount =
    loggedInUser?.group === groupId
      ? initialAttendeesCount + 1
      : initialAttendeesCount;

  // The selectedRoom logic remains unchanged
  const selectedRoom = group?.selectedRoom || null;

  return (
    <>
      <div
        className="flex cursor-pointer items-center justify-between bg-white px-4 py-2"
        onClick={toggle}
      >
        <div>
          <p className="font-semibold text-theme-orange">{groupId}</p>
          <p className="mt-2 text-sm ">{`${attendeesCount} ${attendeesCount > 1 ? "Attendees" : "Attendee"} `}</p>
          {groupId !== "Ungrouped" ? (
            <p className="mt-2 text-sm ">
              {selectedRoom ? (
                <span className="text-theme-blue">
                  Room:{" "}
                  {`${selectedRoom.cityId}${selectedRoom.buildingCode} ${selectedRoom.floor.toString().padStart(2, "0")}.${selectedRoom.roomCode} ${selectedRoom.roomName ? selectedRoom.roomName : ""} `}
                </span>
              ) : (
                <span className="text-theme-dark-blue">Room: Unselected</span>
              )}
            </p>
          ) : (
            <p className="mt-2 text-xs text-gray-400">
              Not sure which room to put people in? Leave them here to trigger
              reassignment!
            </p>
          )}
        </div>

        <div className="text-lg">
          {open ? <IoIosArrowUp /> : <IoIosArrowDown />}
        </div>
      </div>
      <Collapse isOpened={open}>
        <div className="bg-white p-4">
          <Select
            defaultValue={initialValue}
            closeMenuOnSelect={false}
            components={animatedComponents}
            isMulti
            options={options}
            placeholder="Select Emails..."
            onChange={(selected) => handleChange(selected, groupId)}
            styles={{
              control: (provided) => ({
                ...provided,
                backgroundColor: "white",
                border: "none",

                "&:hover": {
                  boxShadow: "0 2px 4px 0 rgba(0,0,0,.2)",
                },
              }),
              option: (provided, state) => ({
                ...provided,
                "&:hover": {
                  backgroundColor: "#f19e38",
                  color: "white",
                },
              }),
              multiValue: (provided) => ({
                ...provided,
                backgroundColor: "#f2f2f2",
              }),
            }}
          />
        </div>
      </Collapse>
    </>
  );
};

export default Accordion;
