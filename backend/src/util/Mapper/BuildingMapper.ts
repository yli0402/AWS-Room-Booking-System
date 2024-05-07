import {buildings} from "@prisma/client";
import BuildingDTO from "../../model/dto/BuildingDTO";
import CityDTO from "../../model/dto/CityDTO";

export const toBuildingDTO = (building: buildings): BuildingDTO => {
    const buildingDTO = new BuildingDTO();
    buildingDTO.city = new CityDTO();
    buildingDTO.city.cityId = building.city_id;
    buildingDTO.buildingId = building.building_id;
    buildingDTO.code = building.code;
    buildingDTO.address = building.address;
    buildingDTO.lat = building.lat.toNumber(); // convert decimal to number
    buildingDTO.lon = building.lon.toNumber(); // convert decimal to number
    buildingDTO.isActive = building.is_active;
    return buildingDTO;
};
