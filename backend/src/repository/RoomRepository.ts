import AbstractRepository from "./AbstractRepository";
import RoomDTO from "../model/dto/RoomDTO";
import {toRoomDTO} from "../util/Mapper/RoomMapper";
import {PrismaClient} from "@prisma/client";

export default class RoomRepository extends AbstractRepository {
    constructor(database: PrismaClient) {
        super(database);
    }

    public async findAll(): Promise<RoomDTO[]> {
        const roomList = await this.db.rooms.findMany({
            include: {
                buildings: {
                    include: {
                        cities: true
                    }
                },
                rooms_equipments: {
                    include: {
                        equipments: true
                    }
                }
            },
            orderBy: {
                room_id: "asc"
            }
        });
        const roomDTOs: RoomDTO[] = [];
        for (const room of roomList) {
            roomDTOs.push(toRoomDTO(room, room.buildings.cities, room.buildings, room.rooms_equipments));
        }
        return roomDTOs;
    }

    public async findById(id: number): Promise<RoomDTO> {
        const room = await this.db.rooms.findUniqueOrThrow({
            where: {
                room_id: id
            },
            include: {
                buildings: {
                    include: {
                        cities: true
                    }
                },
                rooms_equipments: {
                    include: {
                        equipments: true
                    }
                }
            }
        });

        return toRoomDTO(room, room.buildings.cities, room.buildings, room.rooms_equipments);
    }

    public async create(dto: RoomDTO): Promise<RoomDTO> {
        const newRoom = await this.db.$transaction(async (tx) => {
            const roomAdded = await tx.rooms.create({
                data: {
                    building_id: dto.building!.buildingId!,
                    floor: dto.floorNumber!,
                    code: dto.roomCode!.trim(),
                    name: dto.roomName!.trim(),
                    seats: dto.numberOfSeats!,
                    is_active: dto.isActive!
                }
            });

            await Promise.all(
                dto.equipmentList!.map((equipment) =>
                    tx.rooms_equipments.create({
                        data: {
                            room_id: roomAdded.room_id,
                            equipment_id: equipment.equipmentId!
                        }
                    })
                )
            );

            return roomAdded;
        });

        const roomDTO = new RoomDTO();
        roomDTO.roomId = newRoom.room_id;
        return roomDTO;
    }

    public async updateById(id: number, dto: RoomDTO): Promise<RoomDTO> {
        return this.db.$transaction(async (tx) => {
            const updatedRoom = await tx.rooms.update({
                where: {
                    room_id: id
                },
                data: {
                    building_id: dto.building!.buildingId!,
                    floor: dto.floorNumber!,
                    code: dto.roomCode!.trim(),
                    seats: dto.numberOfSeats!,
                    name: dto.roomName!.trim(),
                    is_active: dto.isActive!,
                    rooms_equipments: {
                        deleteMany: {},
                        create: dto.equipmentList!.map((equipment) => ({
                            equipment_id: equipment.equipmentId!
                        }))
                    }
                },
                include: {
                    buildings: {
                        include: {
                            cities: true
                        }
                    },
                    rooms_equipments: {
                        include: {
                            equipments: true
                        }
                    }
                }
            });
            if (!updatedRoom.is_active) {
                const relatedFutureBookings = await tx.users_bookings.findMany({
                    where: {
                        room_id: id,
                        bookings: {
                            start_time: {
                                gt: new Date()
                            },
                            status: "confirmed"
                        }
                    },
                    select: {
                        booking_id: true
                    }
                });
                if (relatedFutureBookings.length > 0) {
                    await tx.bookings.updateMany({
                        where: {
                            booking_id: {
                                in: relatedFutureBookings.map((booking) => booking.booking_id)
                            }
                        },
                        data: {
                            status: "canceled"
                        }
                    });
                }
            }
            return toRoomDTO(
                updatedRoom,
                updatedRoom.buildings.cities,
                updatedRoom.buildings,
                updatedRoom.rooms_equipments
            );
        });
    }
}
