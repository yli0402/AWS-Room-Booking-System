import React from "react";
import BookingStepper from "../components/BookingStepper";
import MeetingRoomImg from "../assets/meeting-room.jpg";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  useConfirmBookingMutation,
  useGetAvailableRoomsMutation,
} from "../slices/bookingApiSlice";
import {
  resetBooking,
  startLoading,
  startSearch,
  stopLoading,
  updateRoomsAndSelectedRoomForGroup,
} from "../slices/bookingSlice";
import { toast } from "react-toastify";
import moment from "moment-timezone";
import Loader from "../components/Loader";
import dayjs from "dayjs";

const BookingReviewPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    startDate,
    startTime,
    duration,
    unit,
    equipments,
    priority,
    roomCount,
    groupedAttendees,
    loggedInUser,
  } = useSelector((state) => state.booking);
  const { userInfo } = useSelector((state) => state.auth);

  const startDateTime = dayjs(`${startDate} ${startTime}`, "YYYY-MM-DD HH:mm");

  const startDateTimeUTC = startDateTime.toISOString();
  const endDateTime = startDateTime.add(duration, unit);
  const endDateTimeUTC = endDateTime.toISOString();

  const formattedStartTime = moment(startDateTimeUTC)
    .tz(moment.tz.guess())
    .format("YYYY-MM-DD HH:mm z");
  const formattedEndTime = moment(endDateTimeUTC)
    .tz(moment.tz.guess())
    .format("YYYY-MM-DD HH:mm z");

  const [confirmBooking, { isLoading, error }] = useConfirmBookingMutation();
  const [
    getAvailableRooms,
    { isLoading: getAvailableRoomsLoading, error: getAvailableRoomsError },
  ] = useGetAvailableRoomsMutation();

  const createRequestBodyForConfirm = () => {
    const rooms = [];
    const users = [];

    groupedAttendees.forEach((group) => {
      if (group.selectedRoom) {
        rooms.push(group.selectedRoom?.roomId);
        const groupUsers =
          group.groupId === loggedInUser?.group ? [userInfo.userId] : [];
        group.attendees.forEach((attendee) => {
          groupUsers.push(attendee.userId);
        });
        users.push(groupUsers);
      }
    });

    const reqBody = {
      createdBy: userInfo.userId,
      startTime: startDateTimeUTC,
      endTime: endDateTimeUTC,
      rooms,
      users,
    };

    return reqBody;
  };

  const createRequestBodyForGetAvailableRooms = () => {
    const equipmentCodes = equipments.map((equip) => equip.id);

    let attendeeEmails = [];

    groupedAttendees.forEach((group) => {
      // check if the group has attendees
      if (group.groupId !== "Ungrouped") {
        const emails = group.attendees.map((attendee) => attendee.email);
        attendeeEmails.push(emails);
      }
    });

    // Check if logged in user has a group and add them to it
    const loggedInUserGroupIndex = groupedAttendees.findIndex(
      (group) => group.groupId === loggedInUser?.group,
    );
    if (loggedInUserGroupIndex !== -1) {
      attendeeEmails[loggedInUserGroupIndex].push(userInfo.email);
    } else {
      // unlikely to happen, but just in case
      attendeeEmails.push([userInfo.email]);
    }

    const reqBody = {
      startTime: startDateTimeUTC,
      endTime: endDateTimeUTC,
      attendees: attendeeEmails,
      equipments: equipmentCodes,
      roomCount: roomCount,
      regroup: false,
      priority: priority.map((entry) => entry.item),
    };

    return reqBody;
  };

  const handleOnClick = async () => {
    try {
      const reqBodyConfirm = createRequestBodyForConfirm();
      const response = await confirmBooking(reqBodyConfirm).unwrap();
      dispatch(resetBooking());
      navigate("/bookingComplete", { state: response });
      toast.success("Booking confirmed successfully");
    } catch (err) {
      try {
        dispatch(startLoading());
        const reqBodyRooms = createRequestBodyForGetAvailableRooms();
        const availableRooms = await getAvailableRooms(reqBodyRooms).unwrap();
        updateGroupedAttendees(availableRooms?.result.groups);
        dispatch(startSearch());
        toast.error(err?.data?.error || "Failed to confirm booking");
      } catch (err) {
        console.log(err);
        const errorMessage = formatUnavailableMessage(err?.data?.error);
        toast.error(errorMessage || "Failed to refetch available rooms");
      } finally {
        navigate("/booking");
        dispatch(stopLoading());
      }
    }
  };
  function formatUnavailableMessage(message) {
    if (!message) return "Failed to get available rooms";
    const match = message.match(/Attendee\(s\) Unavailable: (.+)/);
    if (!match) return message;
    const participantString = match[1];
    const participants = participantString.split(", ");
    let otherParticipants = [];
    let loggedInUserUnavailable = false;

    participants.forEach((participant) => {
      const [name, emailWithParentheses] = participant.split(" (");
      const email = emailWithParentheses.slice(0, -1);

      if (email === userInfo.email) {
        loggedInUserUnavailable = true;
      } else {
        otherParticipants.push(`${name} (${email})`);
      }
    });

    if (!loggedInUserUnavailable) {
      return message;
    }

    if (otherParticipants.length === 0) {
      return "You aren't available during this time.";
    }

    const others = otherParticipants.join(", ");
    const areOrIs = otherParticipants.length > 1 ? "are" : "is";
    return `You aren't available during this time and ${others} ${areOrIs} also unavailable.`;
  }

  const updateGroupedAttendees = (newGroups) => {
    groupedAttendees.forEach((localGroup) => {
      const matchingGroup = findMatchingGroup(localGroup, newGroups);
      if (matchingGroup) {
        const updatedRooms = matchingGroup.rooms;
        dispatch(
          updateRoomsAndSelectedRoomForGroup({
            groupId: localGroup.groupId,
            rooms: updatedRooms,
          }),
        );
      }
    });
  };

  const findMatchingGroup = (localGroup, newGroups) => {
    if (localGroup.groupId !== "Ungrouped") {
      if (localGroup.attendees.length > 0) {
        const localFirstAttendeeId = localGroup.attendees[0].userId;
        const matchedGroup = newGroups.find((newGroup) =>
          newGroup.attendees.some(
            (attendee) => attendee.user_id === localFirstAttendeeId,
          ),
        );
        if (matchedGroup) {
          return matchedGroup;
        }
      } else {
        return newGroups.find((newGroup) =>
          newGroup.attendees.some(
            (attendee) => attendee.user_id === userInfo.userId,
          ),
        );
      }
    }

    return null;
  };

  const displayableGroups = groupedAttendees.filter(
    (group) => group.groupId !== "Ungrouped",
  );

  return (
    <div>
      <div className="flex w-full flex-col gap-y-12 font-amazon-ember ">
        <BookingStepper currentStage={2} />

        <div className="mx-6 rounded-xl border-4 border-transparent bg-theme-orange px-5 py-5 text-center transition-all duration-300 hover:border-theme-orange hover:bg-white hover:text-theme-orange md:w-1/2 md:text-start lg:w-1/4">
          <div>
            <span className="font-semibold">
              {` ${groupedAttendees.length - 1} Room${groupedAttendees.length - 1 > 1 ? "s" : ""}`}
            </span>
          </div>
          <div>
            <span className="font-semibold">{`From ${formattedStartTime}`}</span>{" "}
          </div>
          <div>
            <span className="font-semibold">{`To ${formattedEndTime}`}</span>{" "}
          </div>
        </div>

        {displayableGroups.map((group) => (
          <div
            key={group.groupId}
            className="mx-6 bg-white px-5 pb-5  shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="flex flex-col items-center justify-between lg:flex-row">
              <div>
                <h1 className="py-3 text-center text-2xl font-bold text-theme-orange lg:text-start">
                  {group.groupId}
                </h1>
                <img
                  src={MeetingRoomImg}
                  alt="meeting room"
                  className="h-[25vh] object-cover"
                />
              </div>
              <div className="mt-6 flex flex-col  justify-start gap-1">
                <div>
                  <span className=" text-theme-orange">Room: </span>{" "}
                  {`${group?.selectedRoom?.cityId}${group?.selectedRoom?.buildingCode} ${group?.selectedRoom?.floor.toString().padStart(2, "0")}.${group?.selectedRoom?.roomCode} ${group?.selectedRoom?.roomName ? group?.selectedRoom?.roomName : ""} `}{" "}
                </div>
                <div>
                  <span className=" text-theme-orange">Capacity: </span>
                  {group?.selectedRoom?.seats}
                </div>
                <div>
                  <span className=" text-theme-orange">Equipments: </span>
                  {group?.selectedRoom?.hasAV && group?.selectedRoom?.hasVC
                    ? "AV / VC"
                    : group?.selectedRoom?.hasAV
                      ? "AV"
                      : group?.selectedRoom?.hasVC
                        ? "VC"
                        : "None"}
                </div>
              </div>

              <div className="mt-10 flex flex-col lg:mt-0">
                <div className="mb-2 text-center font-semibold">
                  {/* Calculate total attendees and determine singular or plural form */}
                  <h2>
                    {`${group.groupId === loggedInUser?.group ? group.attendees.length + 1 : group.attendees.length} Attendee${group.groupId === loggedInUser.group ? (group.attendees.length + 1 !== 1 ? "s" : "") : group.attendees.length !== 1 ? "s" : ""}`}
                  </h2>
                </div>
                <div className="h-32 w-80 overflow-y-auto rounded-lg bg-gray-200 pl-4 pt-2">
                  {/* Check if the logged-in user is in this group and display them */}
                  {group.groupId === loggedInUser?.group && (
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-theme-orange"></div>
                      <div className="ml-2">{`${userInfo.email} (Me)`}</div>
                    </div>
                  )}
                  {/* Map over attendees to display each */}
                  {group.attendees.map((attendee, idx) => (
                    <div key={idx} className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-theme-orange"></div>
                      <div className="ml-2">{attendee.email}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center">
        <div className="mt-10 flex justify-center">
          {getAvailableRoomsLoading && <Loader />}
        </div>
        <div className="mt-10 flex justify-center">
          <button
            className="rounded bg-theme-orange px-12 py-2 text-black transition-colors duration-300  ease-in-out hover:bg-theme-dark-orange hover:text-white"
            onClick={handleOnClick}
          >
            Confirm
          </button>
        </div>
        <div className="my-2 flex justify-center">
          <Link
            to="/booking"
            className="rounded bg-theme-dark-blue px-[59px] py-2 text-white transition-colors duration-300 ease-in-out hover:bg-theme-blue hover:text-white"
          >
            Back
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingReviewPage;
