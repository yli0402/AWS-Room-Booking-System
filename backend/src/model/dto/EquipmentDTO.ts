import AbstractDTO, {BOOKINGS_GET_AVAIL, ROOMS} from "./AbstractDTO";
import {IsIn} from "class-validator";

export default class EquipmentDTO extends AbstractDTO {
    @IsIn(["AV", "VC"], {groups: [ROOMS, BOOKINGS_GET_AVAIL]})
    equipmentId?: string;

    description?: string;
}
