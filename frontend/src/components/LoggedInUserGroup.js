import React from "react";
import Select from "react-select";
import { useSelector, useDispatch } from "react-redux";
import { setLoggedInUserGroup } from "../slices/bookingSlice";

const LoggedInUserGroup = () => {
  const dispatch = useDispatch();

  const { groupedAttendees, loggedInUser } = useSelector(
    (state) => state.booking,
  );
  const groupIdsExceptUngrouped = groupedAttendees
    .filter((group) => group.groupId !== "Ungrouped")
    .map((group) => ({
      value: group.groupId,
      label: group.groupId,
    }));

  const defaultGroup = {
    value: loggedInUser?.group,
    label: loggedInUser?.group,
  };
  const handleChange = (selectedOption) => {
    dispatch(setLoggedInUserGroup(selectedOption?.value));
  };

  return (
    <div className="flex w-80 flex-col rounded-lg bg-gray-200 p-4">
      <div className="relative">
        <Select
          className="basic-single"
          classNamePrefix="select"
          defaultValue={defaultGroup}
          isClearable={false}
          name="logged-in-user-room"
          options={groupIdsExceptUngrouped}
          onChange={handleChange}
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
    </div>
  );
};

export default LoggedInUserGroup;
