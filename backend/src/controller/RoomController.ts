import AbstractController from "./AbstractController";
import {Request, Response} from "express";
import RoomService from "../service/RoomService";
import RoomDTO from "../model/dto/RoomDTO";
import {plainToInstance} from "class-transformer";
import {authenticator} from "../App";

export default class RoomController extends AbstractController {
    private roomService: RoomService;

    constructor(roomService: RoomService) {
        super();
        this.roomService = roomService;
    }

    public getAll = async (req: Request, res: Response): Promise<Response> => {
        try {
            await authenticator.getCurrentUser(req.headers.authorization, "admin");
            return super.onResolve(res, await this.roomService.getAll());
        } catch (error) {
            return this.handleError(res, error);
        }
    };

    public getById = async (req: Request, res: Response): Promise<Response> => {
        try {
            await authenticator.getCurrentUser(req.headers.authorization, "admin");
            return super.onResolve(res, await this.roomService.getById(parseInt(req.params.id)));
        } catch (error) {
            return this.handleError(res, error);
        }
    };

    public create = async (req: Request, res: Response): Promise<Response> => {
        try {
            await authenticator.getCurrentUser(req.headers.authorization, "admin");
            return super.onResolve(res, await this.roomService.create(plainToInstance(RoomDTO, req.body)));
        } catch (error) {
            return this.handleError(res, error);
        }
    };

    public update = async (req: Request, res: Response): Promise<Response> => {
        try {
            await authenticator.getCurrentUser(req.headers.authorization, "admin");
            return super.onResolve(
                res,
                await this.roomService.update(parseInt(req.params.id), plainToInstance(RoomDTO, req.body))
            );
        } catch (error) {
            return this.handleError(res, error);
        }
    };
}
