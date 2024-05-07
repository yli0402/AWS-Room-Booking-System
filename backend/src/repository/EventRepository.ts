import AbstractRepository from "./AbstractRepository";
import {PrismaClient} from "@prisma/client";
import EventDTO from "../model/dto/EventDTO";
import {BadRequestError, NotFoundError} from "../util/exception/AWSRoomBookingSystemError";
import {toEventDTO} from "../util/Mapper/EventMapper";

export default class EventRepository extends AbstractRepository {
    constructor(database: PrismaClient) {
        super(database);
    }

    //     model events {
    //     event_id   Int      @id @default(autoincrement())
    //     created_by Int
    //     title      String
    //     start_time DateTime @db.Timestamp(6)
    //     end_time   DateTime @db.Timestamp(6)
    //     users      users    @relation(fields: [created_by], references: [user_id], onDelete: NoAction, onUpdate: NoAction)
    // }

    public findAll = async (): Promise<EventDTO[]> => {
        const eventList = await this.db.events.findMany({});
        const eventDTOs: EventDTO[] = [];
        // Convert each room to a RoomDTO and add it to the array
        for (const event of eventList) {
            eventDTOs.push(toEventDTO(event));
        }
        return eventDTOs;
    };

    public findById = async (id: number): Promise<EventDTO> => {
        const event = await this.db.events.findUnique({
            where: {
                event_id: id
            }
        });
        if (!event) {
            return Promise.reject(new NotFoundError(`Event not found with id: ${id}`));
        }

        const eventDTO = toEventDTO(event);
        return eventDTO;
    };

    public findByUserId = async (id: number): Promise<EventDTO[]> => {
        const eventList = await this.db.events.findMany({
            where: {
                created_by: id
            }
        });
        const eventDTOs: EventDTO[] = [];
        // Convert each room to a RoomDTO and add it to the array
        for (const event of eventList) {
            eventDTOs.push(toEventDTO(event));
        }
        return eventDTOs;
    };

    public create = async (dto: EventDTO): Promise<EventDTO> => {
        try {
            const eventAdded = await this.db.events.create({
                data: {
                    created_by: dto.created_by!,
                    title: dto.title!,
                    start_time: dto.startTime!,
                    end_time: dto.endTime!
                }
            });

            const newEvent = toEventDTO(eventAdded);
            console.log("Event created: ", newEvent);
            return newEvent;
        } catch (error) {
            throw new BadRequestError("Failed to create event");
        }
    };

    public update = async (id: number, dto: EventDTO): Promise<EventDTO> => {
        try {
            const eventUpdated = await this.db.events.update({
                where: {
                    event_id: id,
                    created_by: dto.created_by
                },
                data: {
                    title: dto.title,
                    start_time: dto.startTime,
                    end_time: dto.endTime
                }
            });
            const result = toEventDTO(eventUpdated);
            console.log("Event updated: ", eventUpdated);
            return result;
        } catch (error) {
            return Promise.reject(new NotFoundError(`Event not found with id: ${dto.eventId}`));
        }
    };

    public delete = async (id: number, dto: EventDTO): Promise<EventDTO> => {
        try {
            const eventDeleted = await this.db.events.delete({
                where: {
                    event_id: id,
                    created_by: dto.created_by
                }
            });
            const result = toEventDTO(eventDeleted);
            console.log("Event deleted: ", eventDeleted);
            return result;
        } catch (error) {
            return Promise.reject(new NotFoundError(`Event not found with id: ${id}`));
        }
    };
}
