import {bookings, users} from "@prisma/client";
import BookingDTO, {Group} from "../../model/dto/BookingDTO";
import UserDTO from "../../model/dto/UserDTO";
import {toUserDTO} from "./UserMapper";
import {toRoomDTO} from "./RoomMapper";

export const toBookingDTO = (booking: bookings, creator?: users, groups?: any): BookingDTO => {
    const bookingDTO = new BookingDTO();
    bookingDTO.bookingId = booking.booking_id;
    bookingDTO.createdBy = booking.created_by;
    bookingDTO.createdAt = booking.created_at;
    bookingDTO.startTime = booking.start_time;
    bookingDTO.endTime = booking.end_time;
    bookingDTO.status = booking.status;

    bookingDTO.users = creator ? toUserDTO(creator) : undefined;
    bookingDTO.groups = groups ? mapAttendeesToDTO(groups) : undefined; // group attendees with their rooms

    return bookingDTO;
};

interface AvailableRoomDTO {
    cityId: string;
    buildingCode: string;
    floor: number;
    roomCode: string;
    roomName: string;
    distance: number;
    seats: number;
    hasAV: boolean;
    hasVC: boolean;
    isBigEnough: boolean;
    recommended: boolean;
    roomId: number;
}

export const toAvailableRoomDTO = (resFromRawQuery: any[], equipmentNeeded: string[]): any => {
    const availableRooms: AvailableRoomDTO[] = [];
    for (const res of resFromRawQuery) {
        let isRecommended = false;
        if (res.is_big_enough) {
            if (equipmentNeeded.length === 0) {
                isRecommended = true;
            } else if (equipmentNeeded.length === 2) {
                if (res.has_av && res.has_vc) {
                    isRecommended = true;
                }
            } else if (equipmentNeeded.includes("AV")) {
                if (res.has_av) {
                    isRecommended = true;
                }
            } else if (equipmentNeeded.includes("VC")) {
                if (res.has_vc) {
                    isRecommended = true;
                }
            }
        }

        const availableRoom = {
            roomId: res.room_id,
            cityId: res.city_id,
            buildingCode: res.building_code,
            floor: res.floor,
            roomCode: res.room_code,
            roomName: res.room_name,
            seats: res.seats,
            distance: res.distance,
            hasAV: res.has_av,
            hasVC: res.has_vc,
            isBigEnough: res.is_big_enough,
            recommended: isRecommended
        };
        availableRooms.push(availableRoom);
    }
    return availableRooms;
};

const mapAttendeesToDTO = (groups: any) => {
    const result: Group[] = [];
    const usersByRoom: {
        [key: number]: UserDTO[];
    } = {};
    for (const userBooking of groups) {
        const userDTO = toUserDTO(userBooking.users);

        if (!usersByRoom[userBooking.room_id]) {
            usersByRoom[userBooking.room_id] = [];
        }

        usersByRoom[userBooking.room_id].push(userDTO);
    }
    for (const room_id of Object.keys(usersByRoom)) {
        const roomUsers = usersByRoom[parseInt(room_id)];
        if (roomUsers.length > 0) {
            const room = groups.find((group: any) => group.room_id === parseInt(room_id))!.rooms;
            const building = room.buildings;
            const city = room.buildings.cities;
            const roomDTO = toRoomDTO(room, city, building, room.rooms_equipments);
            if (roomDTO) {
                const group: Group = {room: roomDTO, attendees: roomUsers};
                result.push(group);
            }
        }
    }
    return result;
};
