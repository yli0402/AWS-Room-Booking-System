import {Request, Response} from "express";
import AbstractDTO from "../model/dto/AbstractDTO";
import ResponseCodeMessage from "../util/enum/ResponseCodeMessage";
import {
    BadRequestError,
    NotFoundError,
    RequestConflictError,
    UnauthorizedError,
    UnavailableAttendeesError
} from "../util/exception/AWSRoomBookingSystemError";

export default abstract class AbstractController {
    public abstract getAll(req: Request, res: Response): Promise<Response>;

    public abstract getById(req: Request, res: Response): Promise<Response>;

    public abstract create(req: Request, res: Response): Promise<Response>;

    public abstract update(req: Request, res: Response): Promise<Response>;

    protected onResolve(res: Response, result: AbstractDTO | AbstractDTO[]) {
        return res.status(ResponseCodeMessage.OK_CODE).json({result: result});
    }

    protected onReject(res: Response, code: number, msg: string): Response {
        return res.status(code).json({error: msg});
    }

    protected handleError(res: Response, error: unknown) {
        let errorCode, errorMsg;
        if (
            error instanceof UnauthorizedError ||
            error instanceof BadRequestError ||
            error instanceof NotFoundError ||
            error instanceof RequestConflictError ||
            error instanceof UnavailableAttendeesError
        ) {
            errorCode = error.code;
            errorMsg = error.message;
        } else {
            errorCode = ResponseCodeMessage.UNEXPECTED_ERROR_CODE;
            errorMsg = "An unknown error occurred.";
        }
        return this.onReject(res, errorCode, errorMsg);
    }
}
