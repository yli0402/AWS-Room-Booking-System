import AbstractController from "./AbstractController";
import {Request, Response} from "express";
import {NotFoundError} from "../util/exception/AWSRoomBookingSystemError";
import ResponseCodeMessage from "../util/enum/ResponseCodeMessage";
import EventDTO from "../model/dto/EventDTO";
import {authenticator} from "../App";
import EventService from "../service/EventService";

export default class EventController extends AbstractController {
    private eventService: EventService;

    constructor(eventService: EventService) {
        super();
        this.eventService = eventService;
    }

    public getAll = async (req: Request, res: Response): Promise<Response> => {
        try {
            await authenticator.getCurrentUser(req.headers.authorization, "admin");
            const events = await this.eventService.getAll();
            return super.onResolve(res, events);
        } catch (error) {
            return this.handleError(res, error);
        }
    };

    public getAllByCurrentUser = async (req: Request, res: Response): Promise<Response> => {
        try {
            const currentUser = await authenticator.getCurrentUser(req.headers.authorization);
            const events = await this.eventService.getAllByCurrentUser(currentUser.userId!);
            return super.onResolve(res, events);
        } catch (error) {
            return this.handleError(res, error);
        }
    };

    public getById = async (req: Request, res: Response): Promise<Response> => {
        try {
            const currentUser = await authenticator.getCurrentUser(req.headers.authorization);
            const eventId = Number(req.params.id);
            if (isNaN(eventId)) {
                return super.onReject(res, ResponseCodeMessage.BAD_REQUEST_ERROR_CODE, "Invalid event ID.");
            }
            const event = await this.eventService.getById(eventId);
            if (currentUser.userId !== event.created_by) {
                // for security reason, do not tell the user this event id is not belong to them
                // **flag/log this user for suspicious request
                throw new NotFoundError(`Event not found with id: ${eventId}`);
            }
            return super.onResolve(res, event);
        } catch (error) {
            return this.handleError(res, error);
        }
    };

    public create = async (req: Request, res: Response): Promise<Response> => {
        try {
            const currentUser = await authenticator.getCurrentUser(req.headers.authorization);
            const eventReq = new EventDTO();
            eventReq.created_by = currentUser.userId;
            eventReq.title = req.body.title;
            eventReq.startTime = req.body.startTime;
            eventReq.endTime = req.body.endTime;
            const newEvent = await this.eventService.create(eventReq);
            return super.onResolve(res, newEvent);
        } catch (error) {
            return this.handleError(res, error);
        }
    };

    public update = async (req: Request, res: Response): Promise<Response> => {
        try {
            const currentUser = await authenticator.getCurrentUser(req.headers.authorization);
            const eventId = Number(req.params.id);
            if (isNaN(eventId)) {
                return super.onReject(res, ResponseCodeMessage.BAD_REQUEST_ERROR_CODE, "Invalid event ID.");
            }
            const eventReq = new EventDTO();
            eventReq.created_by = currentUser.userId;
            eventReq.title = req.body.title;
            eventReq.startTime = req.body.startTime;
            eventReq.endTime = req.body.endTime;
            const event = await this.eventService.update(eventId, eventReq);
            return super.onResolve(res, event);
        } catch (error) {
            return this.handleError(res, error);
        }
    };

    public delete = async (req: Request, res: Response): Promise<Response> => {
        try {
            const currentUser = await authenticator.getCurrentUser(req.headers.authorization);
            const eventId = parseInt(req.params.id);
            if (isNaN(eventId)) {
                return super.onReject(res, ResponseCodeMessage.BAD_REQUEST_ERROR_CODE, "Invalid event ID.");
            }
            const eventReq = new EventDTO();
            eventReq.created_by = currentUser.userId;
            await this.eventService.delete(eventId, eventReq);
            return super.onResolve(res, {message: `Event id:${eventId} has been deleted.`});
        } catch (error) {
            return this.handleError(res, error);
        }
    };
}
