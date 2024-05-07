import AbstractDTO from "./AbstractDTO";
import {IsInt, IsOptional} from "class-validator";

export default class AggregateAttendeeDTO extends AbstractDTO {
    @IsInt()
    @IsOptional()
    public building_id: string;

    @IsInt()
    @IsOptional()
    public num_users?: number;

    @IsInt()
    @IsOptional()
    public floor?: number;

    public users?: string[];
    public closest_buildings?: number[];

    constructor(building_id: string) {
        super();
        this.building_id = building_id;
    }
}
