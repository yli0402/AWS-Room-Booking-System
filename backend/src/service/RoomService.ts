import AbstractService from "./AbstractService";
import RoomRepository from "../repository/RoomRepository";
import RoomDTO from "../model/dto/RoomDTO";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime/library";
import {ROOMS} from "../model/dto/AbstractDTO";
import {BadRequestError} from "../util/exception/AWSRoomBookingSystemError";

export default class RoomService extends AbstractService {
    private roomRepo: RoomRepository;

    constructor(roomRepo: RoomRepository) {
        super();
        this.roomRepo = roomRepo;
    }

    public async getAll(): Promise<RoomDTO[]> {
        return await this.roomRepo.findAll();
    }

    public async getById(id: number): Promise<RoomDTO> {
        this.validateId(id, "room");
        try {
            return await this.roomRepo.findById(id);
        } catch (error) {
            this.handlePrismaError(error);
            throw error;
        }
    }

    public async create(dto: RoomDTO): Promise<RoomDTO> {
        await this.validateIncomingDTO(dto, {groups: [ROOMS]});
        if (dto.roomCode!.trim().length === 0) {
            throw new BadRequestError("room code cannot be empty");
        }
        try {
            return await this.roomRepo.create(dto);
        } catch (error) {
            this.handlePrismaError(error);
            throw error;
        }
    }

    public async update(id: number, dto: RoomDTO): Promise<RoomDTO> {
        this.validateId(id, "room");
        await this.validateIncomingDTO(dto, {groups: [ROOMS]});
        if (dto.roomCode!.trim().length === 0) {
            throw new BadRequestError("room code cannot be empty");
        }
        try {
            return await this.roomRepo.updateById(id, dto);
        } catch (error) {
            this.handlePrismaError(error);
            throw error;
        }
    }

    private handlePrismaError(error: unknown) {
        if (error instanceof PrismaClientKnownRequestError) {
            this.toKnownErrors(error, "room", "building, floor, and room code", "building");
        }
    }
}
