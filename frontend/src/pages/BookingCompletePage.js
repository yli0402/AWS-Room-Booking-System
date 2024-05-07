import React from "react";
import BookingStepper from "../components/BookingStepper";
import MeetingRoomImg from "../assets/meeting-room.jpg";
import { Link, useLocation } from "react-router-dom";
import moment from "moment-timezone";

const BookingCompletePage = () => {
  const location = useLocation();
  const bookingData = location.state;
  const startTime = bookingData?.result.startTime;
  const endTime = bookingData?.result.endTime;

  const formattedStartTime = moment(startTime)
    .tz(moment.tz.guess())
    .format("YYYY-MM-DD HH:mm z");
  const formattedEndTime = moment(endTime)
    .tz(moment.tz.guess())
    .format("YYYY-MM-DD HH:mm z");
  return (
    <div>
      <div className="flex w-full flex-col gap-y-12 font-amazon-ember">
        <BookingStepper currentStage={3} />
        <div className="flex items-center justify-center">
          <div className="h-100 mx-10 w-1/2 md:w-1/2 lg:w-1/2">
            <h1 className="mb-4 text-xl font-semibold">Booking Confirmation</h1>
            <p className="mb-4">
              You have successfully booked:{" "}
              {bookingData?.result.groups.map((group, index) => {
                const { room } = group;
                const cityId = room.city.cityId;
                const buildingCode = room.building.code;
                const roomName = room.roomName;
                const roomCode = room.roomCode;
                const floorNumber = room.floorNumber;

                const roomInfo = `${roomName ? roomName : ""} ${roomCode}, Floor ${floorNumber.toString().padStart(2, "0")}`;
                const buildingInfo = `${cityId} ${buildingCode}`;

                return (
                  <p key={index} className="mb-4">
                    <span className="font-bold text-theme-orange">
                      {`Room ${roomInfo}`}
                    </span>{" "}
                    at{" "}
                    <span className="font-bold text-theme-orange">
                      {`Building ${buildingInfo}`}
                    </span>
                    !
                  </p>
                );
              })}
            </p>
            <p className="mb-4">
              From{" "}
              <span className="font-bold text-theme-orange">
                {formattedStartTime}
              </span>{" "}
              to{" "}
              <span className="font-bold text-theme-orange">
                {formattedEndTime}
              </span>
            </p>
            <h1 className="mb-2 text-xl font-semibold">Happy Meeting!</h1>
            <p className="mb-10 text-sm text-gray-500">
              If you have any questions or need further assistance, please
              contact our support team at support@email.com
            </p>
          </div>
        </div>
      </div>

      <div className="mb-10 mt-10 flex justify-center">
        <Link
          to="/booking"
          className="rounded bg-theme-orange px-12 py-2 text-black transition-colors duration-300  ease-in-out hover:bg-theme-dark-orange hover:text-white"
        >
          Make Another Booking
        </Link>
      </div>
    </div>
  );
};

export default BookingCompletePage;
