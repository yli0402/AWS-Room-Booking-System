import BookingDTO from "../model/dto/BookingDTO";
import RoomDTO from "../model/dto/RoomDTO";
import UserDTO from "../model/dto/UserDTO";
import BookingService from "../service/BookingService";
import AbstractController from "./AbstractController";
import {Request, Response} from "express";
import {authenticator} from "../App";
import EquipmentDTO from "../model/dto/EquipmentDTO";

export default class BookingController extends AbstractController {
    private bookingService: BookingService;

    constructor(bookingService: BookingService) {
        super();
        this.bookingService = bookingService;
    }

    public getAll = async (req: Request, res: Response): Promise<Response> => {
        try {
            await authenticator.getCurrentUser(req.headers.authorization, "admin");
            return super.onResolve(res, await this.bookingService.getAll());
        } catch (error) {
            return this.handleError(res, error);
        }
    };

    public getById = async (req: Request, res: Response): Promise<Response> => {
        try {
            await authenticator.getCurrentUser(req.headers.authorization, "admin");
            return super.onResolve(res, await this.bookingService.getById(parseInt(req.params.id)));
        } catch (error) {
            return this.handleError(res, error);
        }
    };

    public getByCurrentUserId = async (req: Request, res: Response): Promise<Response> => {
        try {
            await authenticator.getCurrentUser(req.headers.authorization);
            const currentUser = await authenticator.getCurrentUser(req.headers.authorization);
            return super.onResolve(res, await this.bookingService.getByUserId(currentUser.userId!));
        } catch (error) {
            return this.handleError(res, error);
        }
    };

    public create = async (req: Request, res: Response): Promise<Response> => {
        await new Promise((res) => {
            setTimeout(res, Math.random() * 200);
        });
        const dto = new BookingDTO();
        dto.startTime = new Date(req.body.startTime!);
        dto.endTime = new Date(req.body.endTime!);
        dto.userDTOs = [];
        for (const group of req.body.users) {
            const groupDTO = [];
            for (const participantID of group) {
                const participant = new UserDTO();
                participant.userId = participantID;
                groupDTO.push(participant);
            }
            dto.userDTOs.push(groupDTO);
        }
        dto.roomDTOs = [];
        for (const roomID of req.body.rooms) {
            const room = new RoomDTO();
            room.roomId = roomID;
            dto.roomDTOs.push(room);
        }
        dto.createdBy = req.body.createdBy;
        dto.createdAt = new Date();
        try {
            await authenticator.getCurrentUser(req.headers.authorization);
            return super.onResolve(res, await this.bookingService.create(dto));
        } catch (error) {
            return this.handleError(res, error);
        }
    };

    public update = async (req: Request, res: Response): Promise<Response> => {
        const bookingToUpdateDTO = new BookingDTO();
        bookingToUpdateDTO.status = req.body.status;
        bookingToUpdateDTO.userDTOs = [];
        for (const group of req.body.users) {
            const groupUserDTO: UserDTO[] = [];
            for (const participantID of group) {
                const participant = new UserDTO();
                participant.userId = participantID;
                groupUserDTO.push(participant);
            }
            bookingToUpdateDTO.userDTOs.push(groupUserDTO);
        }
        bookingToUpdateDTO.roomDTOs = [];
        for (const roomID of req.body.rooms) {
            const room = new RoomDTO();
            room.roomId = roomID;
            bookingToUpdateDTO.roomDTOs.push(room);
        }
        try {
            await authenticator.getCurrentUser(req.headers.authorization);
            return super.onResolve(res, await this.bookingService.update(parseInt(req.params.id), bookingToUpdateDTO));
        } catch (error) {
            return this.handleError(res, error);
        }
    };

    public getSuggestedTimes = async (req: Request, res: Response): Promise<Response> => {
        const startTime = new Date(req.body.startTime);
        const endTime = new Date(req.body.endTime);
        const duration = req.body.duration;
        const attendees = req.body.attendees;
        const stepSize = req.body.stepSize;
        try {
            await authenticator.getCurrentUser(req.headers.authorization);
            return super.onResolve(
                res,
                await this.bookingService.getSuggestedTimes(startTime, endTime, duration, attendees, stepSize)
            );
        } catch (error) {
            return this.handleError(res, error);
        }
    };

    public getAvailableRooms = async (req: Request, res: Response): Promise<Response> => {
        const dto = new BookingDTO();
        dto.startTime = new Date(req.body.startTime!);
        dto.endTime = new Date(req.body.endTime!);
        dto.userDTOs = [];
        for (const group of req.body.attendees) {
            const groupDTO = [];
            for (const participantID of group) {
                const participant = new UserDTO();
                participant.email = participantID;
                groupDTO.push(participant);
            }
            dto.userDTOs.push(groupDTO);
        }
        dto.equipments = [];
        for (const equipment of req.body.equipments) {
            const eq = new EquipmentDTO();
            eq.equipmentId = equipment;
            dto.equipments.push(eq);
        }
        dto.priority = req.body.priority!;
        dto.roomCount = req.body.roomCount!;
        dto.regroup = req.body.regroup!;
        try {
            await authenticator.getCurrentUser(req.headers.authorization);
            return super.onResolve(res, await this.bookingService.getAvailableRooms(dto));
        } catch (error) {
            return this.handleError(res, error);
        }
    };
}
