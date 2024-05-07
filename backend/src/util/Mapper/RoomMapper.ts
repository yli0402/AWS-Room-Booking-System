import {buildings, cities, rooms} from "@prisma/client";
import RoomDTO from "../../model/dto/RoomDTO";
import BuildingDTO from "../../model/dto/BuildingDTO";
import CityDTO from "../../model/dto/CityDTO";
import EquipmentDTO from "../../model/dto/EquipmentDTO";

export const toRoomDTO = (room: rooms, city?: cities, building?: buildings, equipmentList?: any): RoomDTO => {
    const roomDTO = new RoomDTO();
    roomDTO.roomId = room.room_id;
    roomDTO.floorNumber = room.floor;
    roomDTO.roomCode = room.code;
    roomDTO.roomName = room.name;
    roomDTO.numberOfSeats = room.seats;
    roomDTO.isActive = room.is_active;

    roomDTO.building = new BuildingDTO();
    roomDTO.building.buildingId = building?.building_id;
    roomDTO.building.code = building?.code;
    roomDTO.building.address = building?.address;
    roomDTO.building.isActive = building?.is_active;

    roomDTO.city = new CityDTO();
    roomDTO.city.cityId = city?.city_id;
    roomDTO.city.name = city?.name;
    roomDTO.city.province_state = city?.province_state;

    roomDTO.equipmentList = [];
    if (equipmentList !== undefined) {
        for (const equipment of equipmentList) {
            roomDTO.equipmentList.push(mapEquipmentToDTO(equipment));
        }
    }
    return roomDTO;
};

const mapEquipmentToDTO = (equipment: any) => {
    const equipmentDTO = new EquipmentDTO();
    equipmentDTO.equipmentId = equipment.equipments.equipment_id;
    equipmentDTO.description = equipment.equipments.description;
    return equipmentDTO;
};
