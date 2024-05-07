import "reflect-metadata";
import {PrismaClient} from "@prisma/client";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import BookingService from "../src/service/BookingService";
import BookingRepository from "../src/repository/BookingRepository";
import {getInitQueries, initDatabase} from "./Util";
import {
    BadRequestError,
    NotFoundError,
    RequestConflictError,
    UnavailableAttendeesError
} from "../src/util/exception/AWSRoomBookingSystemError";
import BookingDTO from "../src/model/dto/BookingDTO";
import {plainToInstance} from "class-transformer";

use(chaiAsPromised);

describe("Booking tests", () => {
    const db = new PrismaClient();
    const initQueries = getInitQueries();
    const bookingService = new BookingService(new BookingRepository(db));

    beforeEach(async () => {
        await initDatabase(initQueries, db);
    });

    describe("Fetching bookings", () => {
        it("should get current user's bookings", async () => {
            await bookingService.create(
                plainToInstance(BookingDTO, {
                    createdBy: 7,
                    createdAt: new Date(),
                    startTime: new Date("2025-01-01T14:00:00Z"),
                    endTime: new Date("2025-01-01T15:00:00Z"),
                    userDTOs: [
                        [
                            {
                                userId: 7
                            }
                        ]
                    ],
                    roomDTOs: [
                        {
                            roomId: 1
                        }
                    ]
                })
            );
            const result = await bookingService.getByUserId(7);
            expect(result).to.have.lengthOf(1);
        });
    });

    describe("Updating bookings", () => {
        it("should cancel booking not yet started", async () => {
            await bookingService.create(
                plainToInstance(BookingDTO, {
                    createdBy: 7,
                    createdAt: new Date(),
                    startTime: new Date("2025-01-01T14:00:00Z"),
                    endTime: new Date("2025-01-01T15:00:00Z"),
                    userDTOs: [
                        [
                            {
                                userId: 7
                            }
                        ]
                    ],
                    roomDTOs: [
                        {
                            roomId: 1
                        }
                    ]
                })
            );
            await bookingService.update(
                1,
                plainToInstance(BookingDTO, {
                    status: "canceled",
                    userDTOs: [
                        [
                            {
                                userId: 7
                            }
                        ]
                    ],
                    roomDTOs: [
                        {
                            roomId: 1
                        }
                    ]
                })
            );
            const result = await bookingService.getById(1);
            expect(result.status).to.equal("canceled");
        });

        // it("should reject cancel booking already started", async () => {
        //     const startTime = new Date();
        //     startTime.setSeconds(startTime.getSeconds() + 1);
        //     await bookingService.create(plainToInstance(BookingDTO, {
        //         createdBy: 7,
        //         createdAt: new Date(),
        //         startTime: startTime,
        //         endTime: new Date("2025-01-01T15:00:00Z"),
        //         userDTOs: [[
        //             {
        //                 userId: 7
        //             }
        //         ]],
        //         roomDTOs: [
        //             {
        //                 roomId: 1
        //             }
        //         ]
        //     }));
        //     setTimeout(async () => {
        //         await bookingService.update(
        //             1,
        //             plainToInstance(BookingDTO, {
        //                 status: "canceled",
        //                 userDTOs: [[{userId: 7}]],
        //                 roomDTOs: [{roomId: 1}]
        //             })
        //         );
        //         const result = await bookingService.getById(1);
        //         expect(result.status).to.equal("canceled");
        //     }, 4000);
        // });

        it("should reject cancel booking already canceled", async () => {
            await bookingService.create(
                plainToInstance(BookingDTO, {
                    createdBy: 7,
                    createdAt: new Date(),
                    startTime: new Date("2025-01-01T14:00:00Z"),
                    endTime: new Date("2025-01-01T15:00:00Z"),
                    userDTOs: [
                        [
                            {
                                userId: 7
                            }
                        ]
                    ],
                    roomDTOs: [
                        {
                            roomId: 1
                        }
                    ]
                })
            );
            await bookingService.update(
                1,
                plainToInstance(BookingDTO, {
                    status: "canceled",
                    userDTOs: [[{userId: 7}]],
                    roomDTOs: [{roomId: 1}]
                })
            );
            const result = bookingService.update(
                1,
                plainToInstance(BookingDTO, {
                    bookingId: 1,
                    status: "canceled",
                    userDTOs: [[{userId: 7}]],
                    roomDTOs: [{roomId: 1}]
                })
            );
            return expect(result).to.eventually.be.rejectedWith(NotFoundError, "Not Found: booking does not exist");
        });
    });

    describe("Creating bookings", () => {
        it("should reject create if room is no longer available", async () => {
            await bookingService.create(
                plainToInstance(BookingDTO, {
                    createdBy: 7,
                    createdAt: new Date(),
                    startTime: new Date("2025-01-01T14:00:00Z"),
                    endTime: new Date("2025-01-01T15:00:00Z"),
                    userDTOs: [
                        [
                            {
                                userId: 7
                            }
                        ]
                    ],
                    roomDTOs: [
                        {
                            roomId: 1
                        }
                    ]
                })
            );
            const result = bookingService.create(
                plainToInstance(BookingDTO, {
                    createdBy: 8,
                    createdAt: new Date(),
                    startTime: new Date("2025-01-01T14:00:00Z"),
                    endTime: new Date("2025-01-01T15:00:00Z"),
                    userDTOs: [
                        [
                            {
                                userId: 8
                            }
                        ]
                    ],
                    roomDTOs: [
                        {
                            roomId: 1
                        }
                    ]
                })
            );
            return expect(result).to.eventually.be.rejectedWith(
                RequestConflictError,
                "Conflict: room YVR32 1.101 Stanley is no longer available in the timeslot you selected"
            );
        });

        it("should reject create if room is deactivated", async () => {
            const result = bookingService.create(
                plainToInstance(BookingDTO, {
                    createdBy: 7,
                    createdAt: new Date(),
                    startTime: new Date("2025-01-01T14:00:00Z"),
                    endTime: new Date("2025-01-01T15:00:00Z"),
                    userDTOs: [
                        [
                            {
                                userId: 7
                            }
                        ]
                    ],
                    roomDTOs: [
                        {
                            roomId: 4
                        }
                    ]
                })
            );
            return expect(result).to.eventually.be.rejectedWith(
                RequestConflictError,
                "Conflict: room YVR32 1.405 Earles Casual has been deactivated"
            );
        });

        it("should reject create if user is no longer available", async () => {
            await bookingService.create(
                plainToInstance(BookingDTO, {
                    createdBy: 7,
                    createdAt: new Date(),
                    startTime: new Date("2025-01-01T14:00:00Z"),
                    endTime: new Date("2025-01-01T15:00:00Z"),
                    userDTOs: [
                        [
                            {
                                userId: 7
                            }
                        ]
                    ],
                    roomDTOs: [
                        {
                            roomId: 1
                        }
                    ]
                })
            );
            const result = bookingService.create(
                plainToInstance(BookingDTO, {
                    createdBy: 7,
                    createdAt: new Date(),
                    startTime: new Date("2025-01-01T14:00:00Z"),
                    endTime: new Date("2025-01-01T15:00:00Z"),
                    userDTOs: [
                        [
                            {
                                userId: 7
                            }
                        ]
                    ],
                    roomDTOs: [
                        {
                            roomId: 2
                        }
                    ]
                })
            );
            return expect(result).to.eventually.be.rejectedWith(
                UnavailableAttendeesError,
                "Attendee(s) Unavailable: First Last (YVR32_01_1@aws.ca)"
            );
        });

        it("should reject create if user is deactivated", async () => {
            const result = bookingService.create(
                plainToInstance(BookingDTO, {
                    createdBy: 9,
                    createdAt: new Date(),
                    startTime: new Date("2025-01-01T14:00:00Z"),
                    endTime: new Date("2025-01-01T15:00:00Z"),
                    userDTOs: [
                        [
                            {
                                userId: 9
                            }
                        ]
                    ],
                    roomDTOs: [
                        {
                            roomId: 1
                        }
                    ]
                })
            );
            return expect(result).to.eventually.be.rejectedWith(
                UnavailableAttendeesError,
                "Attendee(s) Unavailable: First Last (YVR32_01_off@aws.ca) has been deactivated"
            );
        });

        it("should create valid booking", async () => {
            const result = await bookingService.create(
                plainToInstance(BookingDTO, {
                    createdBy: 7,
                    createdAt: new Date(),
                    startTime: new Date("2025-01-01T14:00:00Z"),
                    endTime: new Date("2025-01-01T15:00:00Z"),
                    userDTOs: [
                        [
                            {
                                userId: 7
                            }
                        ]
                    ],
                    roomDTOs: [
                        {
                            roomId: 1
                        }
                    ]
                })
            );
            expect(result).to.exist;
        });

        it("should create valid bookings consecutively", async () => {
            await bookingService.create(
                plainToInstance(BookingDTO, {
                    createdBy: 7,
                    createdAt: new Date(),
                    startTime: new Date("2025-01-01T14:00:00Z"),
                    endTime: new Date("2025-01-01T15:00:00Z"),
                    userDTOs: [
                        [
                            {
                                userId: 7
                            }
                        ]
                    ],
                    roomDTOs: [
                        {
                            roomId: 1
                        }
                    ]
                })
            );
            const result = await bookingService.create(
                plainToInstance(BookingDTO, {
                    createdBy: 7,
                    createdAt: new Date(),
                    startTime: new Date("2025-01-01T15:00:00Z"),
                    endTime: new Date("2025-01-01T16:00:00Z"),
                    userDTOs: [
                        [
                            {
                                userId: 7
                            }
                        ]
                    ],
                    roomDTOs: [
                        {
                            roomId: 1
                        }
                    ]
                })
            );
            expect(result).to.exist;
        });

        it("should create bookings with same timeslot but different attendees and rooms", async () => {
            await bookingService.create(
                plainToInstance(BookingDTO, {
                    createdBy: 7,
                    createdAt: new Date(),
                    startTime: new Date("2025-01-01T14:00:00Z"),
                    endTime: new Date("2025-01-01T15:00:00Z"),
                    userDTOs: [
                        [
                            {
                                userId: 7
                            }
                        ]
                    ],
                    roomDTOs: [
                        {
                            roomId: 1
                        }
                    ]
                })
            );
            const result = await bookingService.create(
                plainToInstance(BookingDTO, {
                    createdBy: 8,
                    createdAt: new Date(),
                    startTime: new Date("2025-01-01T14:00:00Z"),
                    endTime: new Date("2025-01-01T15:00:00Z"),
                    userDTOs: [
                        [
                            {
                                userId: 8
                            }
                        ]
                    ],
                    roomDTOs: [
                        {
                            roomId: 2
                        }
                    ]
                })
            );
            expect(result).to.exist;
        });

        it("should reject if booking creator does not exist", () => {
            const result = bookingService.create(
                plainToInstance(BookingDTO, {
                    createdBy: 0,
                    createdAt: new Date(),
                    startTime: new Date("2025-01-01T14:00:00Z"),
                    endTime: new Date("2025-01-01T15:00:00Z"),
                    userDTOs: [
                        [
                            {
                                userId: 7
                            }
                        ]
                    ],
                    roomDTOs: [
                        {
                            roomId: 2
                        }
                    ]
                })
            );

            return expect(result).to.be.eventually.rejectedWith(NotFoundError, "Not Found: user does not exist");
        });

        it("should reject if start time has already passed", () => {
            const result = bookingService.create(
                plainToInstance(BookingDTO, {
                    createdBy: 7,
                    createdAt: new Date(),
                    startTime: new Date("2023-01-01T14:00:00Z"),
                    endTime: new Date("2023-01-01T15:00:00Z"),
                    userDTOs: [
                        [
                            {
                                userId: 7
                            }
                        ]
                    ],
                    roomDTOs: [
                        {
                            roomId: 1
                        }
                    ]
                })
            );

            return expect(result).to.be.eventually.rejectedWith(
                BadRequestError,
                "Bad Request: start time has already passed"
            );
        });

        it("should reject if end time is before start time", () => {
            const result = bookingService.create(
                plainToInstance(BookingDTO, {
                    createdBy: 7,
                    createdAt: new Date(),
                    startTime: new Date("2025-01-01T14:00:00Z"),
                    endTime: new Date("2025-01-01T14:00:00Z"),
                    userDTOs: [
                        [
                            {
                                userId: 7
                            }
                        ]
                    ],
                    roomDTOs: [
                        {
                            roomId: 1
                        }
                    ]
                })
            );

            return expect(result).to.be.eventually.rejectedWith(
                BadRequestError,
                "Bad Request: meeting cannot be shorter than 30 minutes"
            );
        });
    });

    describe("Checking for available rooms", () => {
        it("available rooms validation check", async () => {
            const result = await bookingService.getAvailableRooms(
                plainToInstance(BookingDTO, {
                    startTime: new Date("2025-01-01T14:00:00Z"),
                    endTime: new Date("2025-01-01T15:00:00Z"),
                    userDTOs: [
                        [{email: "YVR32_01_1@aws.ca"}, {email: "YVR32_01_2@aws.ca"}, {email: "YVR32_03_1@aws.ca"}]
                    ],
                    equipments: [
                        {
                            equipmentId: "VC"
                        }
                    ],
                    priority: ["distance", "seats", "equipments"],
                    roomCount: 2,
                    regroup: true
                })
            );
            // @ts-expect-error temp
            expect(result.groups[0].rooms).to.have.lengthOf(282);
        });

        // it("Auto-splitting check 1 room", async () => {
        //     const result = await bookingService.getAvailableRooms(
        //         basicBooking.startTime!.toISOString(),
        //         basicBooking.endTime!.toISOString(),
        //         [[
        //             "YVR32_01_1@aws.ca",
        //             "YVR32_01_2@aws.ca",
        //             "YVR32_03_1@aws.ca"
        //         ]],
        //         ["VC"],
        //         ["distance", "seats", "equipments"],
        //         2,
        //         true
        //     );
        //     // @ts-expect-error temp
        //     expect(result.groups[0].rooms).to.have.lengthOf(282);
        // });

        // it("Auto-splitting check", async () => {
        //     const result = await bookingService.getAvailableRooms(
        //         basicBooking.startTime!.toISOString(),
        //         basicBooking.endTime!.toISOString(),
        //         [
        //             [
        //                 "team7awsome98@gmail.com",
        //                 "team7awsomeuser12@gmail.com"
        //             ],
        //             [
        //                 "team7awsome02@gmail.com",
        //                 "team7awsome01@gmail.com"
        //             ],
        //             [
        //                 "team7awsomeuser01@gmail.com",
        //                 "team7awsomeuser22@gmail.com",
        //                 "YVR32_01_1@aws.ca"
        //             ]
        //         ],
        //         [],
        //         ["distance", "seats", "equipments"],
        //         3,
        //         true
        //     );
        //     // @ts-expect-error temp
        //     expect(result.groups[0].rooms).to.have.lengthOf(282);
        // });
        //
        // it("Auto-splitting check only 1 building in city", async () => {
        //     const result = await bookingService.getAvailableRooms(
        //         basicBooking.startTime!.toISOString(),
        //         basicBooking.endTime!.toISOString(),
        //         [
        //             [
        //                 "team7awsomeuser22@gmail.com"
        //             ]
        //         ],
        //         [],
        //         ["distance", "seats", "equipments"],
        //         1,
        //         true
        //     );
        //     // @ts-expect-error temp
        //     expect(result.groups[0].rooms).to.have.lengthOf(55);
        // });
        //
        // it("distance check YVR", async () => {
        //     const result = await bookingService.getAvailableRooms(
        //         basicBooking.startTime!.toISOString(),
        //         basicBooking.endTime!.toISOString(),
        //         [[
        //             "YVR32_01_1@aws.ca",
        //             "team7awsome01@gmail.com",
        //             "team7awsomeuser01@gmail.com",
        //             "hsiangyi1025@gmail.com"
        //         ]],
        //         ["VC"],
        //         ["seats", "equipments", "distance"],
        //         1,
        //         true
        //     );
        //     // @ts-expect-error temp
        //     expect(result.groups[0].rooms).to.have.lengthOf(282);
        // });
        //
        // it("room count check YVR", async () => {
        //     const result = await bookingService.getAvailableRooms(
        //         basicBooking.startTime!.toISOString(),
        //         basicBooking.endTime!.toISOString(),
        //         [["YVR32_01_1@aws.ca"]],
        //         ["AV", "VC"],
        //         ["distance", "seats", "equipments"],
        //         1,
        //         true
        //     );
        //     // @ts-expect-error temp
        //     expect(result.groups[0].rooms).to.have.lengthOf(282);
        // });
        //
        // // it("room count check YVR 1 conflict room", async () => {
        // //     await bookingService.create(basicBooking);
        // //     const result = await bookingService.getAvailableRooms(
        // //         "2025-03-26T19:00:00.000Z",
        // //         "2025-03-26T20:00:00.000Z",
        // //         [["YVR32_01_1@aws.ca"]],
        // //         ["AV", "VC"],
        // //         ["distance", "seats", "equipments"],
        // //         1,
        // //         true
        // //     );
        // //     // @ts-expect-error temp
        // //     expect(result.groups[0].rooms).to.have.lengthOf(281);
        // // });
        //
        // it("room count check YUL", async () => {
        //     const result = await bookingService.getAvailableRooms(
        //         basicBooking.startTime!.toISOString(),
        //         basicBooking.endTime!.toISOString(),
        //         [["YUL22_01_1@aws.ca"]],
        //         ["AV", "VC"],
        //         ["distance", "seats", "equipments"],
        //         1,
        //         true
        //     );
        //     // @ts-expect-error temp
        //     expect(result.groups[0].rooms).to.have.lengthOf(10);
        // });
        //
        // it("should resolve if no conflicting booking", async () => {
        //     await bookingService.create(basicBooking);
        //     const result = await bookingService.getAvailableRooms(
        //         basicBooking.startTime!.toISOString(),
        //         basicBooking.endTime!.toISOString(),
        //         [["YVR74_01_1@aws.ca"]],
        //         ["AV", "VC"],
        //         ["distance", "seats", "equipments"],
        //         1,
        //         true
        //     );
        //     expect(result).to.exist;
        // });
        //
        // it("should reject if conflicting booking as organizer", async () => {
        //     await bookingService.create(basicBooking);
        //     const result = bookingService.getAvailableRooms(
        //         basicBooking.startTime!.toISOString(),
        //         basicBooking.endTime!.toISOString(),
        //         [[basicBooking.userDTOs![0][0].email!]],
        //         ["AV", "VC"],
        //         ["distance", "seats", "equipments"],
        //         1,
        //         true
        //     );
        //     return expect(result).to.eventually.be.rejectedWith(
        //         UnavailableAttendeesError,
        //         "Attendee(s) Unavailable: Admin 1 Test (team7awsome01@gmail.com)"
        //     );
        // });
        //
        // it("should reject if conflicting booking as participant", async () => {
        //     await bookingService.create(basicBooking);
        //     const result = bookingService.getAvailableRooms(
        //         basicBooking.startTime!.toISOString(),
        //         basicBooking.endTime!.toISOString(),
        //         [[basicBooking.userDTOs![0][1].email!]],
        //         ["AV", "VC"],
        //         ["distance", "seats", "equipments"],
        //         1,
        //         true
        //     );
        //     return expect(result).to.eventually.be.rejectedWith(UnavailableAttendeesError);
        // });
        //
        // it("should resolve if no conflicting events", async () => {
        //     const event = new EventDTO();
        //     event.title = "event";
        //     event.created_by = ++basicBooking.createdBy!;
        //     event.startTime = basicBooking.startTime;
        //     event.endTime = basicBooking.endTime;
        //     await eventService.create(event);
        //     const result = await bookingService.getAvailableRooms(
        //         basicBooking.startTime!.toISOString(),
        //         basicBooking.endTime!.toISOString(),
        //         [[basicBooking.userDTOs![0][0].email!]],
        //         ["AV", "VC"],
        //         ["distance", "seats", "equipments"],
        //         1,
        //         true
        //     );
        //     expect(result).to.exist;
        // });
        //
        // it("should reject if conflicting events", async () => {
        //     const event = new EventDTO();
        //     event.title = "event";
        //     event.created_by = basicBooking.createdBy;
        //     event.startTime = basicBooking.startTime;
        //     event.endTime = basicBooking.endTime;
        //     await eventService.create(event);
        //     const result = bookingService.getAvailableRooms(
        //         basicBooking.startTime!.toISOString(),
        //         basicBooking.endTime!.toISOString(),
        //         [[basicBooking.userDTOs![0][0].email!]],
        //         ["AV", "VC"],
        //         ["distance", "seats", "equipments"],
        //         1,
        //         true
        //     );
        //     return expect(result).to.eventually.be.rejectedWith(UnavailableAttendeesError, "Attendee(s) Unavailable: Admin 1 Test (team7awsome01@gmail.com)");
        // });
    });
});
