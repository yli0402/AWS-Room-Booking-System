import AbstractDTO, {BUILDINGS} from "./AbstractDTO";
import {IsNotEmpty, IsOptional, IsString, Matches} from "class-validator";

export default class CityDTO extends AbstractDTO {
    @IsNotEmpty({groups: [BUILDINGS]})
    @Matches("^[a-zA-Z]{3}$", undefined, {
        groups: [BUILDINGS],
        message: "city must be 3-letter airport code"
    })
    cityId?: string;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    province_state?: string;
}
