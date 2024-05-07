import AbstractService from "./AbstractService";
import EventDTO from "../model/dto/EventDTO";
import EventRepository from "../repository/EventRepository";
import {BadRequestError} from "../util/exception/AWSRoomBookingSystemError";

export default class EventService extends AbstractService {
    private eventRepo: EventRepository;

    constructor(eventRepo: EventRepository) {
        super();
        this.eventRepo = eventRepo;
    }

    public getAll = async (): Promise<EventDTO[]> => {
        return this.eventRepo.findAll();
    };

    public getById = async (id: number): Promise<EventDTO> => {
        return this.eventRepo.findById(id);
    };

    public getAllByCurrentUser = async (userId: number) => {
        return this.eventRepo.findByUserId(userId);
    };

    public create = async (dto: EventDTO): Promise<EventDTO> => {
        this.validateEventRequest(dto);
        return await this.eventRepo.create(dto);
    };

    private validateEventRequest(dto: EventDTO) {
        if (!dto.title || dto.title.trim().length === 0) {
            throw new BadRequestError("Invalid title");
        }
        if (dto.title.trim().length > 100) {
            throw new BadRequestError("Title cannot be more than 100 characters");
        }
        if (!dto.startTime) {
            throw new BadRequestError("Start time cannot be empty");
        }
        if (!dto.endTime) {
            throw new BadRequestError("End time cannot be empty");
        }
        dto.startTime = new Date(dto.startTime);
        dto.endTime = new Date(dto.endTime);
        if (isNaN(dto.startTime.getTime())) {
            throw new BadRequestError("Invalid start time");
        }
        if (isNaN(dto.endTime.getTime())) {
            throw new BadRequestError("Invalid end time");
        }
        if (dto.startTime >= dto.endTime) {
            throw new BadRequestError("Start time must be before end time");
        }
    }

    public update = async (id: number, dto: EventDTO): Promise<EventDTO> => {
        this.validateEventRequest(dto);
        return await this.eventRepo.update(id, dto);
    };

    public delete = async (id: number, dto: EventDTO): Promise<EventDTO> => {
        return await this.eventRepo.delete(id, dto);
    };
}
