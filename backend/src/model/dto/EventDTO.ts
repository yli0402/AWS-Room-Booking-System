import AbstractDTO from "./AbstractDTO";
import {IsDate, IsInt, IsOptional, IsString} from "class-validator";

export default class EventDTO extends AbstractDTO {
    @IsInt()
    @IsOptional()
    eventId?: number;

    @IsInt()
    @IsOptional()
    created_by?: number;

    @IsString()
    @IsOptional()
    title?: string;

    @IsDate()
    @IsOptional()
    startTime?: Date;

    @IsDate()
    @IsOptional()
    endTime?: Date;
}
