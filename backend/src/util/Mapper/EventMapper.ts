import EventDTO from "../../model/dto/EventDTO";
import {events} from "@prisma/client";

export const toEventDTO = (event: events) => {
    const eventDTO = new EventDTO();
    eventDTO.eventId = event.event_id;
    eventDTO.title = event.title;
    eventDTO.startTime = event.start_time;
    eventDTO.endTime = event.end_time;
    return eventDTO;
};
