import AbstractDTO, {BOOKINGS_CREATE, BOOKINGS_GET_AVAIL, BOOKINGS_UPDATE, USERS, USERS_UPLOAD} from "./AbstractDTO";
import BuildingDTO from "./BuildingDTO";
import CityDTO from "./CityDTO";
import {role} from "@prisma/client";
import {
    IsAlpha,
    IsBoolean,
    IsEmail,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsString,
    Matches,
    Max,
    MaxLength,
    Min,
    ValidateNested
} from "class-validator";
import {Type} from "class-transformer";

export default class UserDTO extends AbstractDTO {
    @IsNotEmpty({groups: [BOOKINGS_CREATE, BOOKINGS_UPDATE]})
    @IsInt({groups: [BOOKINGS_CREATE, BOOKINGS_UPDATE]})
    userId?: number;

    @IsNotEmpty({groups: [USERS, USERS_UPLOAD]})
    @IsString({groups: [USERS, USERS_UPLOAD]})
    @Matches("^[a-zA-Z][a-zA-Z0-9_-]*$", undefined, {groups: [USERS, USERS_UPLOAD]})
    @MaxLength(100, {groups: [USERS, USERS_UPLOAD]})
    username?: string;

    @IsNotEmpty({groups: [USERS, USERS_UPLOAD]})
    @IsString({groups: [USERS, USERS_UPLOAD]})
    @IsAlpha(undefined, {groups: [USERS, USERS_UPLOAD]})
    @MaxLength(100, {groups: [USERS, USERS_UPLOAD]})
    firstName?: string;

    @IsNotEmpty({groups: [USERS, USERS_UPLOAD]})
    @IsString({groups: [USERS, USERS_UPLOAD]})
    @IsAlpha(undefined, {groups: [USERS, USERS_UPLOAD]})
    @MaxLength(100, {groups: [USERS, USERS_UPLOAD]})
    lastName?: string;

    @IsNotEmpty({groups: [BOOKINGS_GET_AVAIL, USERS, USERS_UPLOAD]})
    @IsEmail(undefined, {groups: [BOOKINGS_GET_AVAIL, USERS, USERS_UPLOAD], message: "invalid email address format"})
    @MaxLength(100, {groups: [BOOKINGS_GET_AVAIL, USERS, USERS_UPLOAD]})
    email?: string;

    @IsNotEmpty({groups: [USERS, USERS_UPLOAD]})
    @IsInt({groups: [USERS, USERS_UPLOAD]})
    @Min(1, {groups: [USERS, USERS_UPLOAD]})
    @Max(1000, {groups: [USERS, USERS_UPLOAD]})
    floor?: number;

    @IsNotEmpty({groups: [USERS, USERS_UPLOAD]})
    @IsInt({groups: [USERS, USERS_UPLOAD]})
    @Min(1, {groups: [USERS, USERS_UPLOAD]})
    @Max(1000, {groups: [USERS, USERS_UPLOAD]})
    desk?: number;

    @IsNotEmpty({groups: [USERS]})
    @IsBoolean({groups: [USERS]})
    isActive?: boolean;

    @IsNotEmpty({groups: [USERS]})
    @IsEnum(role, {groups: [USERS]})
    role?: role;

    city?: CityDTO;

    @IsNotEmpty({groups: [USERS_UPLOAD], message: "building should not be empty"})
    @Matches("^[a-zA-Z]{3}\\d+$", undefined, {
        groups: [USERS_UPLOAD],
        message: "building must follow the format of YVR32 with no spaces"
    })
    buildingStr?: string;

    @IsNotEmpty({groups: [USERS]})
    @Type(() => BuildingDTO)
    @ValidateNested({groups: [USERS]})
    building?: BuildingDTO;
}
