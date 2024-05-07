import React, { useState, useMemo } from "react";
import AddEventModal from "../AddEventModal";
import EditEventModal from "../EditEventModal";
import EventDetailsModal from "../EventDetailsModal";
import CancelConfirmationModal from "../CancelConfirmationModal";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./index.css";
import { useGetEventsQuery } from "../../slices/eventsApiSlice";
import { useGetBookingCurrentUserQuery } from "../../slices/bookingApiSlice";
import {
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} from "../../slices/eventsApiSlice";
import { toast } from "react-toastify";

const localizer = momentLocalizer(moment);

const EventCalendar = () => {
  const { data: events, isLoading: isGetEventsLoading } = useGetEventsQuery();
  const { data: booking, isLoading: isGetBookingsLoading } =
    useGetBookingCurrentUserQuery();

  const [createEvent] = useCreateEventMutation();
  const [updateEvent] = useUpdateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();

  const confirmDeleteMessage = "Are you sure you want to delete this event?";

  const eventsData = useMemo(() => {
    if (isGetEventsLoading || !events || !events.result) {
      return [];
    }
    return events.result.map((event) => ({
      ...event,
      type: "event",
    }));
  }, [isGetEventsLoading, events]);

  const bookingsData = useMemo(() => {
    if (isGetBookingsLoading || !booking || !booking.result) {
      return [];
    }
    return booking.result
      .filter((booking) => booking.status === "confirmed")
      .map((booking) => ({
        ...booking,
        title: "AWS Meeting",
        type: "booking",
      }));
  }, [isGetBookingsLoading, booking]);

  const calendarEvents = useMemo(() => {
    return [...eventsData, ...bookingsData];
  }, [eventsData, bookingsData]);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isDetails, setIsDetails] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleSelectEvent = (eventOrBooking) => {
    setSelectedEvent({ ...eventOrBooking, type: eventOrBooking.type });
    setIsDetails(true);
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setIsAdding(true);
  };

  const handleEditEvent = () => {
    setIsDetails(false);
    setIsEditing(true);
  };

  const handleDeleteEvent = (eventId) => {
    setEventToDelete(eventId);
    setIsDetails(false);
    setIsConfirmed(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteEvent(eventToDelete).unwrap();
      toast.success("Event deleted");
    } catch (err) {
      toast.error(err?.data?.error || "Failed to delete event");
    }
    handleCloseModal();
  };

  const handleSaveEvent = async (event) => {
    try {
      if (isEditing) {
        await updateEvent({
          eventId: selectedEvent.eventId,
          updatedEvent: event,
        }).unwrap();
        toast.success("Event updated");
      } else {
        await createEvent(event).unwrap();
        toast.success("Event created");
      }
      // Close the modal
      handleCloseModal();
    } catch (err) {
      // Display error toast message
      toast.error(err?.data?.error || "Failed to save event");
    }
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setSelectedDate(null);
    setIsEditing(false);
    setIsAdding(false);
    setIsDetails(false);
    setIsConfirmed(false);
  };

  // const handleTest = () => {
  //   bookingsData.forEach((book) => {
  //     console.log("event", book.status);
  //   });
  //   console.log("second");
  // };

  const eventStyleGetter = (event) => {
    let newStyle = {
      border: "0",
      borderLeftStyle: "solid",
      borderLeftWidth: "4px",
    };
    if (event.type === "event") {
      newStyle.backgroundColor = "#eacec3";
      newStyle.borderLeftColor = "#d3b5a9";
    } else if (event.type === "booking") {
      newStyle.backgroundColor = "#d8c7b3";
      newStyle.borderLeftColor = "#b7a79b";
    }
    return {
      style: newStyle,
    };
  };

  return (
    <div className="flex w-screen justify-center gap-10">
      <div className="flex w-screen flex-col lg:w-2/3 2xl:w-[1000px]">
        <div className="mb-6 flex items-center justify-between px-5 lg:mb-10">
          <h1 className="font-natural text-2xl md:font-semibold">
            My Schedule
          </h1>
          <button
            className="text-md rounded bg-theme-orange px-3 py-1 text-black transition-colors duration-300 ease-in-out hover:bg-theme-dark-orange  hover:text-white md:px-5 md:py-1 xl:px-6"
            onClick={(date) => handleSelectDate(date.start)}
          >
            New Personal Event
          </button>
        </div>
        <div className="h-[550px] px-5 md:h-[800px]">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor={(event) => {
              return new Date(event.startTime);
            }}
            endAccessor={(event) => {
              return new Date(event.endTime);
            }}
            selectable
            onSelectEvent={handleSelectEvent}
            onSelectSlot={(date) => handleSelectDate(date.start)}
            eventPropGetter={eventStyleGetter}
          />
        </div>

        {isDetails && (
          <EventDetailsModal
            event={selectedEvent}
            onClose={handleCloseModal}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
          />
        )}

        {isEditing && (
          <EditEventModal
            event={selectedEvent}
            onUpdate={handleSaveEvent}
            onClose={handleCloseModal}
          />
        )}

        {isConfirmed && (
          <CancelConfirmationModal
            confirmButton={"Confirm"}
            cancelButton={"Back"}
            onConfirm={handleConfirmDelete}
            onClose={handleCloseModal}
            onCancel={handleCloseModal}
            message={confirmDeleteMessage}
          />
        )}

        {isAdding && (
          <AddEventModal
            selectedDate={selectedDate}
            onAdd={handleSaveEvent}
            onClose={handleCloseModal}
          />
        )}
        {/* <div className="flex justify-center">
          <button
            onClick={handleTest}
            className="my-4 rounded bg-theme-orange px-12 py-2 text-black transition-colors duration-300 ease-in-out hover:bg-theme-dark-orange hover:text-white"
          >
            test
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default EventCalendar;
