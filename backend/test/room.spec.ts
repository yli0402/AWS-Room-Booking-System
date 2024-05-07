import "reflect-metadata";
import {PrismaClient} from "@prisma/client";
import RoomRepository from "../src/repository/RoomRepository";
import RoomService from "../src/service/RoomService";
import {expect, use} from "chai";
import {BadRequestError, NotFoundError, RequestConflictError} from "../src/util/exception/AWSRoomBookingSystemError";
import chaiAsPromised from "chai-as-promised";
import chaiSubset from "chai-subset";
import {getInitQueries, initDatabase} from "./Util";
import {plainToInstance} from "class-transformer";
import RoomDTO from "../src/model/dto/RoomDTO";

use(chaiAsPromised);
use(chaiSubset);

describe("Room tests", function () {
    const db = new PrismaClient();
    const initQueries = getInitQueries();
    const roomService = new RoomService(new RoomRepository(db));

    beforeEach(async function () {
        await initDatabase(initQueries, db);
    });

    describe("Get all rooms", function () {
        it("should return all rooms with complete db", async function () {
            const result = await roomService.getAll();
            expect(result).to.have.lengthOf(348);
            expect(result).to.containSubset([
                {
                    roomId: 1,
                    floorNumber: 1,
                    roomCode: "101",
                    roomName: "Stanley",
                    numberOfSeats: 4,
                    isActive: true,
                    city: {
                        cityId: "YVR",
                        name: "Vancouver",
                        province_state: "BC"
                    },
                    building: {
                        buildingId: 1,
                        code: 32,
                        address: "32 Vancouver St, Vancouver, BC A1B 2C3",
                        isActive: true
                    },
                    equipmentList: [
                        {
                            equipmentId: "AV",
                            description: "Audio visual equipment in room"
                        },
                        {
                            equipmentId: "VC",
                            description: "Video Conference equipment in room"
                        }
                    ]
                },
                {
                    roomId: 348,
                    floorNumber: 2,
                    roomCode: "F",
                    roomName: "Conference",
                    numberOfSeats: 5,
                    isActive: true,
                    city: {
                        cityId: "YUL",
                        name: "Montreal",
                        province_state: "QC"
                    },
                    building: {
                        buildingId: 7,
                        code: 22,
                        address: "22 Montreal St, Montreal, QC G1H 2I3",
                        isActive: true
                    },
                    equipmentList: []
                }
            ]);
        });
    });

    describe("Get rooms by id", function () {
        it("should get room by id", async function () {
            const result = await roomService.getById(17);
            expect(result).to.containSubset({
                roomId: 17,
                floorNumber: 3,
                roomCode: "406",
                roomName: "Ravine",
                numberOfSeats: 10,
                isActive: true,
                city: {
                    cityId: "YVR",
                    name: "Vancouver",
                    province_state: "BC"
                },
                building: {
                    buildingId: 1,
                    code: 32,
                    address: "32 Vancouver St, Vancouver, BC A1B 2C3",
                    isActive: true
                },
                equipmentList: [
                    {
                        equipmentId: "AV",
                        description: "Audio visual equipment in room"
                    },
                    {
                        equipmentId: "VC",
                        description: "Video Conference equipment in room"
                    }
                ]
            });
        });

        it("should reject get if room id does not exist", function () {
            const result = roomService.getById(0);
            return expect(result).to.eventually.be.rejectedWith(NotFoundError, "Not Found: room does not exist");
        });
    });

    describe("Creating rooms", function () {
        it("should create valid room", async function () {
            const createResult = await roomService.create(
                plainToInstance(RoomDTO, {
                    floorNumber: 1,
                    roomCode: "1012",
                    roomName: "Test",
                    numberOfSeats: 10,
                    isActive: true,
                    building: {
                        buildingId: 1
                    },
                    equipmentList: [
                        {
                            equipmentId: "AV"
                        }
                    ]
                })
            );
            expect(createResult).to.containSubset({roomId: 349});
            const getByIdResult = await roomService.getById(349);
            expect(getByIdResult).to.containSubset({
                roomId: 349,
                floorNumber: 1,
                roomCode: "1012",
                roomName: "Test",
                numberOfSeats: 10,
                isActive: true,
                city: {
                    cityId: "YVR",
                    name: "Vancouver",
                    province_state: "BC"
                },
                building: {
                    buildingId: 1,
                    code: 32,
                    address: "32 Vancouver St, Vancouver, BC A1B 2C3",
                    isActive: true
                },
                equipmentList: [
                    {
                        equipmentId: "AV",
                        description: "Audio visual equipment in room"
                    }
                ]
            });
        });

        it("should reject create with duplicate building + floor + code", function () {
            const result = roomService.create(
                plainToInstance(RoomDTO, {
                    floorNumber: 1,
                    roomCode: "101",
                    roomName: "",
                    numberOfSeats: 10,
                    isActive: true,
                    building: {
                        buildingId: 1
                    },
                    equipmentList: []
                })
            );
            return expect(result).to.eventually.be.rejectedWith(
                RequestConflictError,
                "onflict: another room with the same building, floor, and room code already exists"
            );
        });

        it("should reject create when building does not exist", function () {
            const result = roomService.create(
                plainToInstance(RoomDTO, {
                    floorNumber: 1,
                    roomCode: "1012",
                    roomName: "Test",
                    numberOfSeats: 10,
                    isActive: true,
                    building: {
                        buildingId: 0
                    },
                    equipmentList: []
                })
            );
            return expect(result).to.eventually.be.rejectedWith(NotFoundError, "Not Found: building does not exist");
        });

        it("should reject create with invalid equipments", function () {
            const result = roomService.create(
                plainToInstance(RoomDTO, {
                    floorNumber: 1,
                    roomCode: "1012",
                    roomName: "Test",
                    numberOfSeats: 10,
                    isActive: true,
                    building: {
                        buildingId: 1
                    },
                    equipmentList: [
                        {
                            equipmentId: "AA"
                        }
                    ]
                })
            );
            return expect(result).to.eventually.be.rejectedWith(
                BadRequestError,
                "Bad Request: equipmentId must be one of the following values: AV, VC"
            );
        });

        it("should reject create when floor number is not a number", function () {
            const result = roomService.create(
                plainToInstance(RoomDTO, {
                    floorNumber: "a",
                    roomCode: "1012",
                    roomName: "Test",
                    numberOfSeats: 10,
                    isActive: true,
                    building: {
                        buildingId: 1
                    },
                    equipmentList: []
                })
            );
            return expect(result).to.eventually.be.rejectedWith(
                BadRequestError,
                "Bad Request: floorNumber must not be less than 1, floorNumber must be an integer number"
            );
        });
    });

    describe("Updating rooms", function () {
        it("should update room with the exact same info", async function () {
            const updateResult = await roomService.update(
                1,
                plainToInstance(RoomDTO, {
                    floorNumber: 1,
                    roomCode: "101",
                    roomName: "Stanley",
                    numberOfSeats: 4,
                    isActive: true,
                    building: {
                        buildingId: 1
                    },
                    equipmentList: [
                        {
                            equipmentId: "AV"
                        },
                        {
                            equipmentId: "VC"
                        }
                    ]
                })
            );
            const expected = {
                roomId: 1,
                floorNumber: 1,
                roomCode: "101",
                roomName: "Stanley",
                numberOfSeats: 4,
                isActive: true,
                building: {
                    buildingId: 1
                },
                equipmentList: [
                    {
                        equipmentId: "AV"
                    },
                    {
                        equipmentId: "VC"
                    }
                ]
            };
            expect(updateResult).to.containSubset(expected);
            const getByIdResult = await roomService.getById(1);
            expect(getByIdResult).to.containSubset(expected);
        });

        it("should update room with complete info 1", async function () {
            await roomService.update(
                1,
                plainToInstance(RoomDTO, {
                    floorNumber: 200,
                    roomCode: "newCode",
                    roomName: "newName",
                    numberOfSeats: 100,
                    isActive: false,
                    building: {
                        buildingId: 7
                    },
                    equipmentList: []
                })
            );
            const expected = {
                roomId: 1,
                floorNumber: 200,
                roomCode: "newCode",
                roomName: "newName",
                numberOfSeats: 100,
                isActive: false,
                city: {
                    cityId: "YUL",
                    name: "Montreal",
                    province_state: "QC"
                },
                building: {
                    buildingId: 7,
                    code: 22,
                    address: "22 Montreal St, Montreal, QC G1H 2I3",
                    isActive: true
                },
                equipmentList: []
            };
            const getByIdResult = await roomService.getById(1);
            expect(getByIdResult).to.containSubset(expected);
        });

        it("should update room with complete info 2", async function () {
            const updateResult = await roomService.update(
                1,
                plainToInstance(RoomDTO, {
                    floorNumber: 300,
                    roomCode: "007.A",
                    roomName: "newName 2",
                    numberOfSeats: 1,
                    isActive: true,
                    building: {
                        buildingId: 7
                    },
                    equipmentList: [
                        {
                            equipmentId: "VC"
                        }
                    ]
                })
            );
            const expected = {
                roomId: 1,
                floorNumber: 300,
                roomCode: "007.A",
                roomName: "newName 2",
                numberOfSeats: 1,
                isActive: true,
                city: {
                    cityId: "YUL",
                    name: "Montreal",
                    province_state: "QC"
                },
                building: {
                    buildingId: 7,
                    code: 22,
                    address: "22 Montreal St, Montreal, QC G1H 2I3",
                    isActive: true
                },
                equipmentList: [
                    {
                        equipmentId: "VC"
                    }
                ]
            };
            expect(updateResult).to.containSubset(expected);
            const getByIdResult = await roomService.getById(1);
            expect(getByIdResult).to.containSubset(expected);
        });

        it("should reject update if new room does not exist", function () {
            const result = roomService.update(
                0,
                plainToInstance(RoomDTO, {
                    floorNumber: 1,
                    roomCode: "newCode",
                    roomName: "newName",
                    numberOfSeats: 10,
                    isActive: true,
                    building: {
                        buildingId: 0
                    },
                    equipmentList: []
                })
            );
            return expect(result).to.eventually.be.rejectedWith(NotFoundError, "Not Found: room does not exist");
        });

        it("should reject update if new building id does not exist", function () {
            const result = roomService.update(
                1,
                plainToInstance(RoomDTO, {
                    floorNumber: 1,
                    roomCode: "newCode",
                    roomName: "newName",
                    numberOfSeats: 10,
                    isActive: true,
                    building: {
                        buildingId: 0
                    },
                    equipmentList: []
                })
            );
            return expect(result).to.eventually.be.rejectedWith(NotFoundError, "Not Found: building does not exist");
        });

        it("should reject update with duplicate building + floor + code", function () {
            const result = roomService.update(
                1,
                plainToInstance(RoomDTO, {
                    floorNumber: 1,
                    roomCode: "102",
                    roomName: "",
                    numberOfSeats: 10,
                    isActive: true,
                    building: {
                        buildingId: 1
                    },
                    equipmentList: []
                })
            );
            return expect(result).to.eventually.be.rejectedWith(
                RequestConflictError,
                "Conflict: another room with the same building, floor, and room code already exists"
            );
        });
    });
});
