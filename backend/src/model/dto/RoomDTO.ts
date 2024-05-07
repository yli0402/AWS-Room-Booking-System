import AbstractDTO, {BOOKINGS_CREATE, BOOKINGS_UPDATE, ROOMS} from "./AbstractDTO";
import EquipmentDTO from "./EquipmentDTO";
import CityDTO from "./CityDTO";
import BuildingDTO from "./BuildingDTO";
import {Type} from "class-transformer";
import {
    IsArray,
    IsBoolean,
    IsDefined,
    IsInt,
    IsNotEmpty,
    IsString,
    Max,
    MaxLength,
    Min,
    ValidateNested
} from "class-validator";

export default class RoomDTO extends AbstractDTO {
    @IsNotEmpty({groups: [BOOKINGS_CREATE, BOOKINGS_UPDATE]})
    @IsInt({groups: [BOOKINGS_CREATE, BOOKINGS_UPDATE]})
    roomId?: number;

    @IsNotEmpty({groups: [ROOMS]})
    @IsInt({groups: [ROOMS]})
    @Min(1, {groups: [ROOMS]})
    @Max(1000, {groups: [ROOMS]})
    floorNumber?: number;

    @IsNotEmpty({groups: [ROOMS]})
    @IsInt({groups: [ROOMS]})
    @Min(1, {groups: [ROOMS]})
    @Max(1000, {groups: [ROOMS]})
    numberOfSeats?: number;

    @IsNotEmpty({groups: [ROOMS]})
    @IsString({groups: [ROOMS]})
    @MaxLength(100, {groups: [ROOMS]})
    roomCode?: string;

    @IsDefined({groups: [ROOMS]})
    @IsString({groups: [ROOMS]})
    @MaxLength(100, {groups: [ROOMS]})
    roomName?: string;

    @IsNotEmpty({groups: [ROOMS]})
    @IsBoolean({groups: [ROOMS]})
    isActive?: boolean;

    city?: CityDTO;

    @IsNotEmpty({groups: [ROOMS]})
    @Type(() => BuildingDTO)
    @ValidateNested({groups: [ROOMS]})
    building?: BuildingDTO;

    @IsNotEmpty({groups: [ROOMS]})
    @Type(() => EquipmentDTO)
    @IsArray()
    @ValidateNested({each: true, groups: [ROOMS]})
    equipmentList?: EquipmentDTO[];
}
