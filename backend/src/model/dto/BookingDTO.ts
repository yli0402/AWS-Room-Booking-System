import AbstractDTO, {BOOKINGS_CREATE, BOOKINGS_GET_AVAIL, BOOKINGS_UPDATE} from "./AbstractDTO";
import UserDTO from "./UserDTO";
import RoomDTO from "./RoomDTO";
import {
    ArrayMinSize,
    ArrayNotEmpty,
    IsArray,
    IsBoolean,
    IsDate,
    IsEnum,
    IsIn,
    IsInt,
    IsNotEmpty,
    IsOptional,
    Max,
    Min,
    MinDate,
    ValidateNested
} from "class-validator";
import {Type} from "class-transformer";
import EquipmentDTO from "./EquipmentDTO";
import {status} from "@prisma/client";

export interface Group {
    room: RoomDTO;
    attendees: UserDTO[];
}

export default class BookingDTO extends AbstractDTO {
    bookingId?: number;

    @IsNotEmpty({groups: [BOOKINGS_CREATE]})
    @IsInt({groups: [BOOKINGS_CREATE]})
    createdBy?: number;

    @IsNotEmpty({groups: [BOOKINGS_CREATE]})
    @IsDate({groups: [BOOKINGS_CREATE]})
    createdAt?: Date;

    @IsNotEmpty({groups: [BOOKINGS_GET_AVAIL, BOOKINGS_CREATE]})
    @IsDate({groups: [BOOKINGS_GET_AVAIL, BOOKINGS_CREATE]})
    @MinDate(new Date(), {groups: [BOOKINGS_GET_AVAIL, BOOKINGS_CREATE], message: "start time has already passed"})
    startTime?: Date;

    @IsNotEmpty({groups: [BOOKINGS_GET_AVAIL, BOOKINGS_CREATE]})
    @IsDate({groups: [BOOKINGS_GET_AVAIL, BOOKINGS_CREATE]})
    endTime?: Date;

    @IsNotEmpty({groups: [BOOKINGS_UPDATE]})
    @IsEnum(status, {groups: [BOOKINGS_UPDATE]})
    status?: string;

    @IsNotEmpty({groups: [BOOKINGS_GET_AVAIL]})
    @IsInt({groups: [BOOKINGS_GET_AVAIL]})
    @Min(1, {groups: [BOOKINGS_GET_AVAIL]})
    @Max(1000, {groups: [BOOKINGS_GET_AVAIL]})
    roomCount?: number;

    @IsNotEmpty({groups: [BOOKINGS_GET_AVAIL, BOOKINGS_CREATE, BOOKINGS_UPDATE]})
    @Type(() => UserDTO)
    @IsArray()
    @ArrayNotEmpty({groups: [BOOKINGS_GET_AVAIL, BOOKINGS_CREATE, BOOKINGS_UPDATE]})
    @ArrayNotEmpty({
        each: true,
        groups: [BOOKINGS_CREATE, BOOKINGS_UPDATE],
        message: "Each room must not be empty"
    })
    @ValidateNested({each: true, groups: [BOOKINGS_GET_AVAIL, BOOKINGS_CREATE, BOOKINGS_UPDATE]})
    userDTOs?: UserDTO[][];

    @IsNotEmpty({groups: [BOOKINGS_CREATE, BOOKINGS_UPDATE]})
    @Type(() => RoomDTO)
    @IsArray()
    @ArrayNotEmpty({groups: [BOOKINGS_CREATE, BOOKINGS_UPDATE]})
    @ValidateNested({each: true, groups: [BOOKINGS_CREATE, BOOKINGS_UPDATE]})
    roomDTOs?: RoomDTO[];

    // the following field are added based on request from frontend
    users?: UserDTO; // creator

    @IsNotEmpty({groups: [BOOKINGS_GET_AVAIL]})
    @IsArray()
    @ArrayMinSize(3, {groups: [BOOKINGS_GET_AVAIL]})
    @IsIn(["distance", "seats", "equipments"], {each: true, groups: [BOOKINGS_GET_AVAIL]})
    priority?: string[];

    @IsNotEmpty({groups: [BOOKINGS_GET_AVAIL]})
    @Type(() => EquipmentDTO)
    @IsArray()
    @ValidateNested({each: true, groups: [BOOKINGS_GET_AVAIL]})
    equipments?: EquipmentDTO[];

    @IsOptional()
    groups?: Group[]; // participants in each room

    @IsNotEmpty({groups: [BOOKINGS_GET_AVAIL]})
    @IsBoolean({groups: [BOOKINGS_GET_AVAIL]})
    regroup?: boolean;
}
