import React, { useMemo } from "react";
import Accordion from "./Accordion";
import { useGetAllEmailsQuery } from "../slices/usersApiSlice";
import { useDispatch, useSelector } from "react-redux";
import { setGroupToDisplay, setGroupedAttendees } from "../slices/bookingSlice";
import Loader from "./Loader";
import Message from "./Message";

const UserEmailGroup = () => {
  const dispatch = useDispatch();
  const { data: userEmails, error, isLoading } = useGetAllEmailsQuery();

  const { groupedAttendees, groupToDisplay } = useSelector(
    (state) => state.booking,
  );
  const { userInfo } = useSelector((state) => state.auth);

  // Aggregate all selected emails across groups
  const allSelectedEmails = useMemo(
    () =>
      new Set(
        groupedAttendees.flatMap((group) =>
          group.attendees.map((attendee) => attendee.email),
        ),
      ),
    [groupedAttendees],
  );

  const toggle = (groupId) => {
    dispatch(setGroupToDisplay(groupId === groupToDisplay ? false : groupId));
  };
  const handleChange = (selectedOptions, groupId) => {
    // selectedOptions is an array of { value, label } objects representing the currently selected items
    const selectedAttendees = selectedOptions.map((option) => ({
      userId: option.value,
      email: option.label,
    }));

    // Dispatch an action to update the Redux store
    dispatch(setGroupedAttendees({ groupId, attendees: selectedAttendees }));
  };

  return (
    <>
      <div className="flex w-80 flex-col space-y-4 rounded-lg bg-gray-200 p-4">
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message severity="error">{error.message}</Message>
        ) : (
          groupedAttendees.map((group, index) => {
            const initialSelected = group.attendees.map((attendee) => ({
              value: attendee.userId,
              label: attendee.email,
            }));
            // filter out already selected emails and the logged-in user's email
            const availableOptions = userEmails.result
              .filter(
                (user) =>
                  !allSelectedEmails.has(user.email) &&
                  user.email !== userInfo.email,
              )
              .map((user) => ({ value: user.userId, label: user.email }));
            return (
              <div key={group.groupId} className="flex flex-col">
                <Accordion
                  groupId={group.groupId}
                  open={groupToDisplay === group.groupId}
                  toggle={() => toggle(group.groupId)}
                  handleChange={(selected) =>
                    handleChange(selected, group.groupId)
                  }
                  options={availableOptions}
                  initialValue={initialSelected}
                  selectedRoom={group.selectedRoom}
                />
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default UserEmailGroup;
