import AbstractRepository from "./AbstractRepository";
import UserDTO from "../model/dto/UserDTO";
import {PrismaClient} from "@prisma/client/extension";
import {toUserDTO} from "../util/Mapper/UserMapper";
import {NotFoundError, UnauthorizedError} from "../util/exception/AWSRoomBookingSystemError";

export default class UserRepository extends AbstractRepository {
    constructor(database: PrismaClient) {
        super(database);
    }

    public async findAll(): Promise<UserDTO[]> {
        const userList = await this.db.users.findMany({
            include: {
                buildings: {
                    include: {
                        cities: true
                    }
                }
            },
            orderBy: {
                user_id: "asc"
            }
        });
        const userDTOs: UserDTO[] = [];
        for (const user of userList) {
            userDTOs.push(toUserDTO(user, user.buildings.cities, user.buildings));
        }
        return userDTOs;
    }

    public async findAllEmail(): Promise<UserDTO[]> {
        const userList = await this.db.users.findMany({
            where: {
                is_active: true
            },
            select: {
                user_id: true,
                email: true,
                first_name: true,
                last_name: true
            }
        });
        const userDTOs: UserDTO[] = [];
        for (const user of userList) {
            const userDTO = new UserDTO();
            userDTO.userId = user.user_id;
            userDTO.email = user.email;
            userDTO.firstName = user.first_name;
            userDTO.lastName = user.last_name;
            userDTOs.push(userDTO);
        }
        return userDTOs;
    }

    public async findById(id: number): Promise<UserDTO> {
        const user = await this.db.users.findUniqueOrThrow({
            where: {
                user_id: id
            },
            include: {
                buildings: {
                    include: {
                        cities: true
                    }
                }
            }
        });
        return toUserDTO(user, user.buildings.cities, user.buildings);
    }

    public async findByEmail(email: string): Promise<UserDTO> {
        const user = await this.db.users.findUnique({
            where: {
                email: email
            },
            include: {
                buildings: {
                    include: {
                        cities: true
                    }
                }
            }
        });

        if (!user) {
            throw new NotFoundError(`User not found with email: ${email}`);
        }

        return toUserDTO(user, user.buildings.cities, user.buildings);
    }

    public async create(user: UserDTO): Promise<UserDTO> {
        const newUser = await this.db.users.create({
            data: {
                username: user.username!,
                first_name: user.firstName!,
                last_name: user.lastName!,
                email: user.email!,
                building_id: user.building!.buildingId!,
                floor: user.floor!,
                desk: user.desk!,
                role: user.role!,
                is_active: user.isActive!
            }
        });
        return toUserDTO(newUser);
    }

    public async update(userID: number, user: UserDTO): Promise<UserDTO> {
        const toUpdate = await this.db.users.findUniqueOrThrow({
            where: {
                user_id: userID
            }
        });
        if (toUpdate.role === "admin") {
            throw new UnauthorizedError(
                "cannot make changes to an admin user, please contact the database administrator for help"
            );
        }
        const updatedUser = await this.db.users.update({
            where: {
                user_id: userID
            },
            data: {
                username: user.username!,
                first_name: user.firstName!,
                last_name: user.lastName!,
                email: user.email!,
                building_id: user.building!.buildingId!,
                floor: user.floor!,
                desk: user.desk!,
                role: user.role!,
                is_active: user.isActive!
            }
        });
        return toUserDTO(updatedUser);
    }

    public async upload(users: UserDTO[]): Promise<UserDTO[]> {
        return this.db.$transaction(async (tx) => {
            return Promise.all(
                users.map(async (dto) => {
                    const building = await tx.buildings.findUnique({
                        where: {
                            city_id_code: {
                                city_id: dto.buildingStr!.substring(0, 3).toUpperCase(),
                                code: parseInt(dto.buildingStr!.substring(3))
                            }
                        }
                    });

                    if (!building) {
                        throw new NotFoundError("building does not exist, no users were added");
                    }

                    return tx.users.create({
                        data: {
                            username: dto.username!.trim(),
                            first_name: dto.firstName!.trim(),
                            last_name: dto.lastName!.trim(),
                            email: dto.email!,
                            building_id: building.building_id,
                            floor: dto.floor!,
                            desk: dto.desk!,
                            role: "staff",
                            is_active: true
                        }
                    });
                })
            );
        });
    }
}
