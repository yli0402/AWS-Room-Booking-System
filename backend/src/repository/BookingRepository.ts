import AbstractRepository from "./AbstractRepository";
import BookingDTO from "../model/dto/BookingDTO";
import AggregateAttendeeDTO from "../model/dto/AggregateAttendeeDTO";
import {bookings, Prisma, PrismaClient} from "@prisma/client";
import {
    BadRequestError,
    NotFoundError,
    RequestConflictError,
    UnavailableAttendeesError
} from "../util/exception/AWSRoomBookingSystemError";
import {toAvailableRoomDTO, toBookingDTO} from "../util/Mapper/BookingMapper";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime/library";

export default class BookingRepository extends AbstractRepository {
    constructor(database: PrismaClient) {
        super(database);
    }

    public async findAll(): Promise<BookingDTO[]> {
        const bookings = await this.db.bookings.findMany({
            include: {
                users: {include: {buildings: {include: {cities: true}}}},
                users_bookings: {include: {users: true, rooms: {include: {buildings: {include: {cities: true}}}}}}
            }
        });
        return bookings.map((booking) => {
            return toBookingDTO(booking, booking.users, booking.users_bookings);
        });
    }

    public async findById(id: number): Promise<BookingDTO> {
        const booking = await this.db.bookings.findUniqueOrThrow({
            where: {booking_id: id},
            include: {
                users: {include: {buildings: {include: {cities: true}}}},
                users_bookings: {include: {users: true, rooms: {include: {buildings: {include: {cities: true}}}}}}
            }
        });
        return toBookingDTO(booking, booking.users, booking.users_bookings);
    }

    public async findByUserId(id: number): Promise<BookingDTO[]> {
        const bookings = await this.db.bookings.findMany({
            where: {users_bookings: {some: {user_id: id}}},
            include: {
                users: true,
                users_bookings: {
                    include: {
                        users: true,
                        rooms: {
                            include: {
                                buildings: {include: {cities: true}},
                                rooms_equipments: {include: {equipments: true}}
                            }
                        }
                    }
                }
            },
            orderBy: {created_at: "desc"}
        });
        return bookings.map((booking) => toBookingDTO(booking, booking.users, booking.users_bookings));
    }

    public async create(
        createdBy: number,
        createdAt: Date,
        startTime: Date,
        endTime: Date,
        rooms: number[],
        attendees: number[][]
    ): Promise<BookingDTO> {
        const MAX_RETRIES = 5;
        let retries = 0;
        let newBooking;
        while (retries < MAX_RETRIES) {
            try {
                // eslint-disable-next-line no-await-in-loop
                newBooking = await this.db.$transaction(
                    async (tx) => {
                        await Promise.all([
                            this.checkAttendeeAvail(attendees.flat(), "user_id", startTime, endTime, null),
                            this.checkRoomAvail(rooms, endTime, startTime)
                        ]);

                        const booking = await tx.bookings.create({
                            data: {
                                created_by: createdBy,
                                created_at: createdAt,
                                start_time: startTime,
                                end_time: endTime,
                                status: "confirmed"
                            }
                        });

                        await tx.users_bookings.createMany({data: this.getUsersBookingData(attendees, rooms, booking)});

                        return tx.bookings.findUniqueOrThrow({
                            where: {booking_id: booking.booking_id},
                            include: {
                                users: true,
                                users_bookings: {
                                    include: {users: true, rooms: {include: {buildings: {include: {cities: true}}}}}
                                }
                            }
                        });
                    },
                    {isolationLevel: Prisma.TransactionIsolationLevel.Serializable}
                );
                break;
            } catch (error) {
                if (error instanceof PrismaClientKnownRequestError) {
                    if (error.code === "P2034") {
                        retries++;
                        continue;
                    }
                }
                throw error;
            }
        }
        if (!newBooking) {
            throw new RequestConflictError("too many users are trying to book the same rooms, please try again later");
        }
        return toBookingDTO(newBooking, newBooking.users, newBooking.users_bookings);
    }

    public async update(id: number, status: string, attendees: number[][], rooms: number[]): Promise<BookingDTO> {
        return this.db.$transaction(async (tx) => {
            const curr = await tx.bookings.findUniqueOrThrow({
                where: {booking_id: id, status: {not: "canceled"}}
            });
            if (curr.start_time <= new Date()) {
                throw new BadRequestError("start time has already passed");
            }
            if (status === "canceled") {
                await tx.bookings.update({where: {booking_id: id}, data: {status: status}});
                return {};
            }

            await this.checkAttendeeAvail(attendees.flat(), "user_id", curr.start_time, curr.end_time, curr.booking_id);

            await tx.users_bookings.deleteMany({where: {booking_id: id}});

            await tx.users_bookings.createMany({data: this.getUsersBookingData(attendees, rooms, curr)});

            return {};
        });
    }

    public async getAvailableRooms(
        startTime: Date,
        endTime: Date,
        attendees: string[][],
        equipments: string[],
        priority: string[],
        roomCount: number,
        regroup: boolean
    ): Promise<object> {
        const flatAttendees = attendees.flat();
        await this.checkAttendeeAvail(attendees.flat(), "email", startTime, endTime, null);
        const attendeeCityIds = await Promise.all(flatAttendees.map((attendee) => this.getCityId(attendee)));
        const uniqueCityIds = new Set(attendeeCityIds);
        const isMultiCity = uniqueCityIds.size > 1;
        let attendeeGroups: string[][];
        if (isMultiCity) {
            attendeeGroups = [...uniqueCityIds].map((cityId) =>
                flatAttendees.filter((_, i) => attendeeCityIds[i] === cityId)
            );
        } else {
            if (!regroup && roomCount !== attendees.length) {
                throw new BadRequestError(
                    "room count does not match the current attendee group structure, please enable 'Auto-Regroup' to re-assign attendees to match the room count"
                );
            }
            attendeeGroups = regroup ? await this.getGroupingSuggestion(flatAttendees, roomCount) : attendees;
        }
        const roomSearchResults = await Promise.all(
            attendeeGroups.map((group) => this.searchForRooms(group, startTime, endTime, equipments, priority))
        );
        return {isMultiCity: isMultiCity, groups: roomSearchResults};
    }

    public async getSuggestedTimes(
        startTime: Date,
        endTime: Date,
        duration: string,
        attendees: string[],
        stepSize: string
    ): Promise<object[]> {
        //@formatter:off
        return await this.db.$queryRawUnsafe(`
            WITH RECURSIVE
                 dates AS
                     (SELECT TIMESTAMP '${startTime.toISOString()}' AS dt
                      UNION ALL
                      SELECT dt + INTERVAL '${stepSize}'
                      FROM dates
                      WHERE dt + INTERVAL '${stepSize}' < TIMESTAMP '${endTime.toISOString()}'),
                 user_ids AS
                     (SELECT u.user_id
                      FROM users u
                      WHERE u.email IN (${attendees.map((attendee) => `'${attendee}'`).join(",")})),
                 user_bookings_overlap AS
                     (SELECT ub.user_id,
                             b.start_time,
                             b.end_time
                      FROM users_bookings ub
                               JOIN bookings b ON ub.booking_id = b.booking_id
                      WHERE b.start_time < TIMESTAMP '${endTime.toISOString()}'
                        AND b.end_time > TIMESTAMP '${startTime.toISOString()}'
                        AND b.status != 'canceled'
                        AND ub.user_id IN (SELECT user_id FROM user_ids)) ,
                 user_events_overlap AS
                     (SELECT e.created_by AS user_id,
                             e.start_time,
                             e.end_time
                      FROM events e
                      WHERE e.start_time < TIMESTAMP '${endTime.toISOString()}'
                        AND e.end_time > TIMESTAMP '${startTime.toISOString()}'
                        AND e.created_by IN (SELECT user_id FROM user_ids))
            SELECT d.dt AS start_time,
                   d.dt + INTERVAL '${duration}' AS end_time
            FROM dates d
            WHERE NOT EXISTS
                (SELECT 1 FROM user_bookings_overlap ub
                 WHERE (d.dt, d.dt + INTERVAL '${duration}') OVERLAPS (ub.start_time, ub.end_time))
              AND NOT EXISTS
                (SELECT 1 FROM user_events_overlap ue
                 WHERE (d.dt, d.dt + INTERVAL '${duration}') OVERLAPS (ue.start_time, ue.end_time))
        `);
        //@formatter:on
    }

    private getUsersBookingData(attendees: number[][], rooms: number[], curr: bookings) {
        const data = [];
        for (let i = 0; i < attendees.length; i++) {
            const roomId = rooms[i];
            for (const userId of attendees[i]) {
                data.push({
                    booking_id: curr.booking_id,
                    user_id: userId,
                    room_id: roomId
                });
            }
        }
        return data;
    }

    private async checkRoomAvail(rooms: number[], endTime: Date, startTime: Date) {
        const unavailableRooms = await this.db.rooms.findMany({
            where: {
                room_id: {in: rooms},
                OR: [
                    {is_active: false},
                    {
                        users_bookings: {
                            some: {
                                bookings: {
                                    AND: [
                                        {start_time: {lt: endTime}},
                                        {end_time: {gt: startTime}},
                                        {status: {not: "canceled"}}
                                    ]
                                }
                            }
                        }
                    }
                ]
            },
            include: {buildings: true}
        });
        if (unavailableRooms.length > 0) {
            for (const room of unavailableRooms) {
                if (room.is_active === false) {
                    throw new RequestConflictError(
                        `room ${room.buildings.city_id}${room.buildings.code} ${room.floor}.${room.code} ${room.name} has been deactivated`
                    );
                }
            }
            throw new RequestConflictError(
                `room ${unavailableRooms.map((room) => `${room.buildings.city_id}${room.buildings.code} ${room.floor}.${room.code} ${room.name}`).join(", ")} is no longer available in the timeslot you selected`
            );
        }
    }

    private async getGroupingSuggestion(attendees: string[], roomCount: number): Promise<string[][]> {
        if (roomCount === 1) {
            return [attendees];
        }
        if (roomCount > attendees.length) {
            throw new BadRequestError("Number of rooms cannot be greater than the number of attendees");
        }
        const uniqueBuildings = await this.getBuildingFloor(attendees);
        if (roomCount > uniqueBuildings.length) {
            return this.groupingUp(uniqueBuildings, roomCount, attendees.length);
        }
        return this.groupingDown(uniqueBuildings, roomCount);
    }

    private groupingUp(uniqueBuildings: AggregateAttendeeDTO[], roomCount: number, totalAttendees: number): string[][] {
        const res: string[][] = [];
        const divisor = totalAttendees / roomCount;
        const roomsDistribution = uniqueBuildings.map((entry) => Number(entry.num_users) / divisor);
        const roomsAllocation = roomsDistribution.map((entry: number) => (entry < 1 ? 1 : Math.floor(entry)));
        const roomsRemainder = roomsDistribution.map((entry) => (entry < 1 ? 0 : entry - Math.floor(entry)));
        for (let i = roomsAllocation.reduce((acc, entry) => acc + entry, 0); i < roomCount; i++) {
            const j = roomsRemainder.indexOf(Math.max(...roomsRemainder));
            roomsRemainder[j] = 0;
            roomsAllocation[j]++;
        }
        for (let i = 0; i < roomsAllocation.length; i++) {
            if (roomsAllocation[i] === 1) {
                res.push(uniqueBuildings[i].users!);
                continue;
            }
            const numUsers = Number(uniqueBuildings[i].num_users);
            const buildingDivisor = Math.floor(numUsers / roomsAllocation[i]);
            let leftoverUsers = numUsers % roomsAllocation[i];
            let count = 0;
            for (let j = 0; j < roomsAllocation[i]; j++) {
                const extraUser = leftoverUsers > 0 ? 1 : 0;
                const numInNextGroup = buildingDivisor + extraUser;
                res.push(uniqueBuildings[i].users!.slice(count, count + numInNextGroup));
                count += numInNextGroup;
                leftoverUsers -= extraUser;
            }
        }
        return res;
    }

    private groupingDown(uniqueBuildings: AggregateAttendeeDTO[], roomCount: number): string[][] {
        const remainingBuildings = uniqueBuildings.map((entry) => Number(entry.building_id));
        while (uniqueBuildings.length > roomCount) {
            const toRemove = uniqueBuildings.pop();
            remainingBuildings.splice(remainingBuildings.indexOf(Number(toRemove!.building_id)), 1);
            for (const buildingId of toRemove!.closest_buildings!) {
                if (!remainingBuildings.includes(buildingId)) {
                    continue;
                }
                const i = this.customIndexOf(uniqueBuildings, (entry_1) => Number(entry_1.building_id) === buildingId);
                if (i === -1) {
                    continue;
                }
                // @ts-expect-error temp
                // eslint-disable-next-line no-unsafe-optional-chaining
                uniqueBuildings[i].users!.push(...toRemove?.users);
                // @ts-expect-error temp
                uniqueBuildings[i].num_users! += toRemove?.num_users;
                uniqueBuildings.sort((a, b) => Number(b.num_users! - a.num_users!));
                break;
            }
        }
        const res = [];
        for (const entry2 of uniqueBuildings) {
            res.push(entry2.users!);
        }
        return res;
    }

    private async searchForRooms(
        attendeeGroup: string[],
        startTime: Date,
        endTime: Date,
        equipments: string[],
        priority: string[]
    ) {
        const city = await this.getCityId(attendeeGroup[0]);
        const buildingFloorList = await this.getBuildingFloor(attendeeGroup);
        const closestBuildingId = buildingFloorList[0].building_id;
        const floor = buildingFloorList[0].floor as number;
        const recommendedRooms = await this.db.$queryRawUnsafe(
            this.buildRoomSearchQuery(
                startTime,
                endTime,
                attendeeGroup,
                equipments,
                priority,
                closestBuildingId,
                city,
                floor
            )
        );
        const attendeeList = await this.db.users.findMany({
            where: {email: {in: attendeeGroup}},
            select: {user_id: true, email: true, first_name: true, last_name: true}
        });
        return {
            attendees: attendeeList,
            rooms: toAvailableRoomDTO(recommendedRooms as never[], equipments)
        };
    }

    private async checkAttendeeAvail(
        attendeeIdentifiers: string[] | number[],
        identifierType: "user_id" | "email",
        startTime: Date,
        endTime: Date,
        excludeBookingId: number | null
    ) {
        const unavailableAttendees = await this.db.users.findMany({
            where: {
                [identifierType]: {in: attendeeIdentifiers},
                OR: [
                    {is_active: false},
                    {
                        users_bookings: {
                            some: {
                                bookings: {
                                    AND: [
                                        {start_time: {lt: endTime}},
                                        {end_time: {gt: startTime}},
                                        {status: {not: "canceled"}},
                                        excludeBookingId === null ? {} : {booking_id: {not: excludeBookingId}}
                                    ]
                                }
                            }
                        }
                    },
                    {events: {some: {AND: [{start_time: {lt: endTime}}, {end_time: {gt: startTime}}]}}}
                ]
            }
        });
        if (unavailableAttendees.length > 0) {
            for (const unavailableAttendee of unavailableAttendees) {
                if (unavailableAttendee.is_active === false) {
                    throw new UnavailableAttendeesError(
                        `${unavailableAttendee.first_name} ${unavailableAttendee.last_name} (${unavailableAttendee.email}) has been deactivated`
                    );
                }
            }
            throw new UnavailableAttendeesError(
                unavailableAttendees.map((user) => `${user.first_name} ${user.last_name} (${user.email})`).join(", ")
            );
        }
    }

    private async getCityId(email: string): Promise<string> {
        const res = await this.db.users.findUnique({
            where: {email: email},
            include: {buildings: {select: {city_id: true}}}
        });
        if (res === null) {
            throw new NotFoundError(`user ${email} does not exist`);
        }
        return res.buildings.city_id;
    }

    private async getBuildingFloor(attendees: string[]): Promise<AggregateAttendeeDTO[]> {
        const emails = "'".concat(attendees.join("', '")).concat("'");
        //@formatter:off
        const query = `
            WITH user_counts AS
                     (SELECT building_id,
                             COUNT(*) AS num_users,
                             ARRAY_AGG(email ORDER BY floor) AS users
                      FROM users
                      WHERE email IN (${emails})
                      GROUP BY building_id),
                 max_floor_per_building AS
                     (SELECT building_id,
                             floor
                      FROM
                          (SELECT building_id,
                                  floor,
                                  ROW_NUMBER() OVER (PARTITION BY building_id
                                      ORDER BY COUNT(*) DESC) AS rn
                           FROM users
                           WHERE email IN (${emails})
                           GROUP BY building_id,
                                    floor) t
                      WHERE rn = 1 ),
                 agg_users AS
                     (SELECT uc.building_id,
                             uc.num_users,
                             mfp.floor,
                             uc.users
                      FROM user_counts uc
                               JOIN max_floor_per_building mfp ON uc.building_id = mfp.building_id
                      ORDER BY num_users DESC),
                 agg_users_dist AS
                     (SELECT au.building_id,
                             au.num_users,
                             au.floor,
                             au.users,
                             d.building_id_to,
                             d.distance
                      FROM agg_users AS au
                               JOIN distances d ON au.building_id = d.building_id_from)
            SELECT agd.building_id,
                   agd.num_users,
                   agd.floor,
                   agd.users,
                   array_agg(agd.building_id_to
                             ORDER BY agd.distance) AS closest_buildings
            FROM agg_users_dist agd
            WHERE agd.building_id_to IN
                  (SELECT building_id
                   FROM user_counts)
            GROUP BY agd.building_id,
                     agd.num_users,
                     agd.floor,
                     agd.users
            ORDER BY num_users DESC,
                     CASE
                         WHEN agd.building_id =
                              (SELECT building_id
                               FROM users
                               WHERE email = '${attendees[0]}' ) THEN 0
                         ELSE 1
                         END
        `;
        //@formatter:on
        const ret = await this.db.$queryRawUnsafe(query);
        const res: AggregateAttendeeDTO[] = [];
        (ret as AggregateAttendeeDTO[]).forEach((entry) => {
            res.push(entry);
        });
        const sum = res.map((entry_1) => Number(entry_1.num_users)).reduce((a, b) => a + b);
        if (sum !== attendees.length) {
            throw new NotFoundError("Some users not found");
        }
        return res;
    }

    private buildRoomSearchQuery(
        startTime: Date,
        endTime: Date,
        attendees: string[],
        equipments: string[],
        priorities: string[],
        closestBuildingId: string,
        city: string,
        floorFrom: number
    ): string {
        const orderBy: string[] = [];
        priorities.forEach((priority) => {
            if (priority === "distance") {
                orderBy.push(
                    `distance, CASE WHEN available_rooms.building_id = ${closestBuildingId} THEN ABS(available_rooms.floor - ${floorFrom}) END, floor`
                );
            } else if (priority === "equipments") {
                orderBy.push(
                    equipments.length ? equipments.map((eq) => `CASE WHEN has_${eq} THEN 0 ELSE 1 END`).join(",") : "1"
                );
            } else {
                orderBy.push("seats");
            }
        });
        //@formatter:off
        return `
            WITH room_equipment_info AS
                (SELECT room_id,
                        bool_or(equipment_id = 'AV') AS has_av,
                        bool_or(equipment_id = 'VC') AS has_vc
                 FROM rooms_equipments
                 GROUP BY room_id),
                 room_info AS
                (SELECT r.room_id,
                        r.building_id,
                        r.floor,
                        r.code AS room_code,
                        r.name AS room_name,
                        r.seats,
                        coalesce(rei.has_av, FALSE) AS has_av,
                        coalesce(rei.has_vc, FALSE) AS has_vc,
                        bool_or(r.seats >= ${attendees.length}) AS is_big_enough,
                        coalesce(d.distance, 1000000) AS distance
                 FROM rooms r
                 LEFT JOIN room_equipment_info rei ON r.room_id = rei.room_id
                 LEFT JOIN distances d ON r.building_id = d.building_id_to
                 AND d.building_id_from = ${closestBuildingId}
                 WHERE r.is_active = TRUE
                 GROUP BY r.room_id,
                          r.building_id,
                          r.floor,
                          r.code,
                          r.name,
                          r.seats,
                          rei.has_av,
                          rei.has_vc,
                          d.distance),
                 available_rooms AS
                (SELECT ri.*
                 FROM room_info ri
                 JOIN buildings b ON ri.building_id = b.building_id
                 WHERE b.city_id = '${city}'
                     AND b.is_active = TRUE
                     AND ri.room_id NOT IN
                         (SELECT ub.room_id
                          FROM users_bookings ub
                          JOIN bookings b ON b.booking_id = ub.booking_id
                          WHERE b.start_time < '${endTime.toISOString()}'
                              AND b.end_time > '${startTime.toISOString()}'
                              AND b.status != 'canceled' ) )
            SELECT buildings.city_id,
                   buildings.code AS building_code,
                   available_rooms.floor,
                   available_rooms.room_code AS room_code,
                   available_rooms.room_name AS room_name,
                   available_rooms.room_id,
                   available_rooms.distance,
                   available_rooms.seats,
                   available_rooms.has_av,
                   available_rooms.has_vc,
                   available_rooms.is_big_enough
            FROM available_rooms,
                 buildings
            WHERE available_rooms.building_id = buildings.building_id
            ORDER BY ${orderBy[0]}, ${orderBy[1]}, ${orderBy[2]}
        `;
        //@formatter:on
    }

    private customIndexOf<T>(arr: T[], testF: (t: T) => boolean) {
        for (let i = 0; i < arr.length; i++) {
            if (testF(arr[i])) {
                return i;
            }
        }
        return -1;
    }
}
