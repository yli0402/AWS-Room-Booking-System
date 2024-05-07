import AbstractRepository from "./AbstractRepository";
import BuildingDTO from "../model/dto/BuildingDTO";
import {toBuildingDTO} from "../util/Mapper/BuildingMapper";
import {buildings, PrismaClient} from "@prisma/client";
import haversine from "haversine";

export default class BuildingRepository extends AbstractRepository {
    constructor(database: PrismaClient) {
        super(database);
    }

    public async findAll(): Promise<BuildingDTO[]> {
        const buildingList = await this.db.buildings.findMany({
            include: {
                cities: true,
                rooms: true,
                users: true
            },
            orderBy: {
                city_id: "asc"
            }
        });
        const buildingDTOs: BuildingDTO[] = [];
        for (const building of buildingList) {
            buildingDTOs.push(toBuildingDTO(building));
        }
        return buildingDTOs;
    }

    public async findById(id: number): Promise<BuildingDTO> {
        const building = await this.db.buildings.findUniqueOrThrow({
            where: {
                building_id: id
            },
            include: {
                cities: true
            }
        });
        return toBuildingDTO(building);
    }

    public async create(dto: BuildingDTO): Promise<BuildingDTO> {
        return this.db.$transaction(async (tx) => {
            const buildingCreated = await tx.buildings.create({
                data: {
                    city_id: dto.city!.cityId!.toUpperCase(),
                    code: dto.code!,
                    address: dto.address!.trim(),
                    lat: dto.lat!,
                    lon: dto.lon!,
                    is_active: dto.isActive!
                }
            });

            const buildings = await tx.buildings.findMany({
                where: {
                    city_id: buildingCreated.city_id
                }
            });

            await Promise.all(
                buildings.map((building) => {
                    if (buildingCreated.building_id === building.building_id) {
                        return tx.distances.create({
                            data: {
                                building_id_from: buildingCreated.building_id,
                                building_id_to: building.building_id,
                                distance: 0
                            }
                        });
                    } else {
                        if (buildingCreated.building_id !== building.building_id) {
                            const distance = this.getDistance(buildingCreated, building);
                            return tx.distances.createMany({
                                data: [
                                    {
                                        building_id_from: buildingCreated.building_id,
                                        building_id_to: building.building_id,
                                        distance: distance
                                    },
                                    {
                                        building_id_from: building.building_id,
                                        building_id_to: buildingCreated.building_id,
                                        distance: distance
                                    }
                                ]
                            });
                        }
                    }
                    return undefined;
                })
            );

            return toBuildingDTO(buildingCreated);
        });
    }

    public async updateById(id: number, dto: BuildingDTO): Promise<BuildingDTO> {
        return this.db.$transaction(async (tx) => {
            const updatedBuilding = await tx.buildings.update({
                where: {
                    building_id: id
                },
                data: {
                    city_id: dto.city!.cityId!.toUpperCase(),
                    code: dto.code!,
                    lat: dto.lat!,
                    lon: dto.lon!,
                    address: dto.address!.trim(),
                    is_active: dto.isActive!
                }
            });

            const allBuildings = await tx.buildings.findMany({
                where: {
                    city_id: updatedBuilding.city_id
                }
            });

            await Promise.all(
                allBuildings.map((building) => {
                    if (updatedBuilding.building_id !== building.building_id) {
                        const distance = this.getDistance(updatedBuilding, building);
                        return tx.distances.updateMany({
                            where: {
                                OR: [
                                    {
                                        building_id_from: updatedBuilding.building_id,
                                        building_id_to: building.building_id
                                    },
                                    {
                                        building_id_from: building.building_id,
                                        building_id_to: updatedBuilding.building_id
                                    }
                                ]
                            },
                            data: {
                                distance: distance
                            }
                        });
                    }
                    return undefined;
                })
            );

            return toBuildingDTO(updatedBuilding);
        });
    }

    private getDistance(buildingA: buildings, buildingB: buildings) {
        return haversine(
            {latitude: buildingA.lat.toNumber(), longitude: buildingA.lon.toNumber()},
            {latitude: buildingB.lat.toNumber(), longitude: buildingB.lon.toNumber()},
            {unit: "meter"}
        );
    }
}
