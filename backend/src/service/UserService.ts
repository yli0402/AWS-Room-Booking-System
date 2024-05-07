import AbstractService from "./AbstractService";
import UserDTO from "../model/dto/UserDTO";
import UserRepository from "../repository/UserRepository";
import {BadRequestError, NotFoundError, RequestConflictError} from "../util/exception/AWSRoomBookingSystemError";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime/library";
import {USERS, USERS_UPLOAD} from "../model/dto/AbstractDTO";

export default class UserService extends AbstractService {
    private userRepo: UserRepository;

    constructor(userRepo: UserRepository) {
        super();
        this.userRepo = userRepo;
    }

    public async getAll(): Promise<UserDTO[]> {
        return await this.userRepo.findAll();
    }

    public async getAllEmail(): Promise<UserDTO[]> {
        return await this.userRepo.findAllEmail();
    }

    public async getById(id: number): Promise<UserDTO> {
        this.validateId(id, "user");
        try {
            return await this.userRepo.findById(id);
        } catch (error) {
            this.convertPrismaError(error);
            throw error;
        }
    }

    public async create(user: UserDTO): Promise<UserDTO> {
        await this.validateIncomingDTO(user, {groups: [USERS]});
        try {
            return await this.userRepo.create(user);
        } catch (error) {
            this.convertPrismaError(error);
            throw error;
        }
    }

    public async update(id: number, user: UserDTO): Promise<UserDTO> {
        this.validateId(id, "user");
        await this.validateIncomingDTO(user, {groups: [USERS]});
        try {
            return await this.userRepo.update(id, user);
        } catch (error) {
            this.convertPrismaError(error);
            throw error;
        }
    }

    public async upload(users: UserDTO[]): Promise<UserDTO[]> {
        if (users.length === 0) {
            throw new BadRequestError("file contains no users");
        }
        if (users.length > 1000) {
            throw new BadRequestError("file contains too many rows, a maximum of 1000 users is supported");
        }
        try {
            await Promise.all(
                users.map((user) => {
                    return this.validateIncomingDTO(user, {groups: [USERS_UPLOAD]});
                })
            );
            return await this.userRepo.upload(users);
        } catch (error) {
            try {
                this.convertPrismaError(error);
            } catch (converted) {
                if (converted instanceof RequestConflictError || converted instanceof NotFoundError) {
                    converted.message += ", no users were added";
                }
                throw converted;
            }
            if (error instanceof BadRequestError) {
                error.message += ", no users were added";
            }
            throw error;
        }
    }

    private convertPrismaError(error: unknown) {
        if (error instanceof PrismaClientKnownRequestError) {
            this.toKnownErrors(error, "user", "username or email", "building");
        }
    }
}
