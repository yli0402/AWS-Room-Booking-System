import AbstractService from "./AbstractService";
import BuildingRepository from "../repository/BuildingRepository";
import BuildingDTO from "../model/dto/BuildingDTO";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime/library";
import {BUILDINGS} from "../model/dto/AbstractDTO";
import {BadRequestError} from "../util/exception/AWSRoomBookingSystemError";

export default class BuildingService extends AbstractService {
    private buildingRepo: BuildingRepository;

    constructor(buildingRepo: BuildingRepository) {
        super();
        this.buildingRepo = buildingRepo;
    }

    public async getAll(): Promise<BuildingDTO[]> {
        return this.buildingRepo.findAll();
    }

    public getById(id: number): Promise<BuildingDTO> {
        this.validateId(id, "building");
        return this.buildingRepo.findById(id);
    }

    public async create(dto: BuildingDTO): Promise<BuildingDTO> {
        await this.validateIncomingDTO(dto, {groups: [BUILDINGS]});
        if (dto.address!.trim().length === 0) {
            throw new BadRequestError("address cannot be empty");
        }
        try {
            return await this.buildingRepo.create(dto);
        } catch (error) {
            this.handlePrismaError(error);
            throw error;
        }
    }

    public async update(id: number, dto: BuildingDTO): Promise<BuildingDTO> {
        this.validateId(id, "building");
        await this.validateIncomingDTO(dto, {groups: [BUILDINGS]});
        if (dto.address!.trim().length === 0) {
            throw new BadRequestError("address cannot be empty");
        }
        try {
            return await this.buildingRepo.updateById(id, dto);
        } catch (error) {
            this.handlePrismaError(error);
            throw error;
        }
    }

    private handlePrismaError(error: unknown) {
        if (error instanceof PrismaClientKnownRequestError) {
            this.toKnownErrors(error, "building", "city and building number", "city");
        }
    }
}
