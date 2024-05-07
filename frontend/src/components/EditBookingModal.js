import React from "react";
import CloseIconSVG from "../assets/close-icon.svg";
import UserEmailInputEdit from "./UserEmailInputEdit";

const EditBookingModal = ({ onClose, onUpdate, attendees, setAttendees }) => {
  const handleUpdate = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    onUpdate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="group relative pl-3">
        <div className="absolute inset-0 transform rounded-3xl bg-gradient-to-br from-orange-300 to-theme-orange shadow-lg duration-300 group-hover:-rotate-3"></div>
        <form
          onSubmit={handleUpdate}
          className="relative w-80 flex-col rounded-3xl bg-white p-6 shadow-lg lg:w-96"
        >
          <h1 className="font-natural mb-5 mt-1 text-2xl lg:mt-2 ">
            Edit Attendee(s)
          </h1>
          <label className="mb-1 block">
            Attendee(s) excluding yourself <span className="text-red-600">*</span>
          </label>
          <UserEmailInputEdit
            attendees={attendees}
            setAttendees={setAttendees}
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
    </div>
  );
};

export default EditBookingModal;
