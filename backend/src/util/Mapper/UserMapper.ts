import {buildings, cities, users} from "@prisma/client";
import UserDTO from "../../model/dto/UserDTO";
import BuildingDTO from "../../model/dto/BuildingDTO";
import CityDTO from "../../model/dto/CityDTO";

export const toUserDTO = (user: users, city?: cities, building?: buildings): UserDTO => {
    const userDTO = new UserDTO(); // create a new instance of the UserDTO class. This is the object that will be returned
    userDTO.userId = user.user_id;
    userDTO.username = user.username;
    userDTO.firstName = user.first_name;
    userDTO.lastName = user.last_name;
    userDTO.email = user.email;
    userDTO.floor = user.floor;
    userDTO.desk = user.desk;
    userDTO.isActive = user.is_active;
    userDTO.role = user.role;

    userDTO.building = new BuildingDTO();
    userDTO.building.buildingId = building?.building_id;
    userDTO.building.code = building?.code;
    userDTO.building.address = building?.address;

    userDTO.city = new CityDTO();
    userDTO.city.cityId = city?.city_id;
    userDTO.city.name = city?.name;
    userDTO.city.province_state = city?.province_state;

    return userDTO;
};
