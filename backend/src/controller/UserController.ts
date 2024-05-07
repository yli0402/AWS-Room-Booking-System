import AbstractController from "./AbstractController";
import {Request, Response} from "express";
import UserService from "../service/UserService";
import ResponseCodeMessage from "../util/enum/ResponseCodeMessage";
import UserDTO from "../model/dto/UserDTO";
import csv from "csv-parser";
import stream from "stream";
import {plainToInstance} from "class-transformer";
import {authenticator} from "../App";

export default class UserController extends AbstractController {
    private userService: UserService;

    constructor(userService: UserService) {
        super();
        this.userService = userService;
    }

    public getAll = async (req: Request, res: Response): Promise<Response> => {
        try {
            await authenticator.getCurrentUser(req.headers.authorization, "admin");
            return super.onResolve(res, await this.userService.getAll());
        } catch (error) {
            return this.handleError(res, error);
        }
    };

    public getAllEmail = async (req: Request, res: Response): Promise<Response> => {
        try {
            await authenticator.getCurrentUser(req.headers.authorization);
            return super.onResolve(res, await this.userService.getAllEmail());
        } catch (error) {
            return this.handleError(res, error);
        }
    };

    public getById = async (req: Request, res: Response): Promise<Response> => {
        try {
            await authenticator.getCurrentUser(req.headers.authorization, "admin");
            return super.onResolve(res, await this.userService.getById(parseInt(req.params.id)));
        } catch (error) {
            return this.handleError(res, error);
        }
    };

    public create = async (req: Request, res: Response): Promise<Response> => {
        try {
            await authenticator.getCurrentUser(req.headers.authorization, "admin");
            return super.onResolve(res, await this.userService.create(plainToInstance(UserDTO, req.body)));
        } catch (error) {
            return this.handleError(res, error);
        }
    };

    public update = async (req: Request, res: Response): Promise<Response> => {
        try {
            await authenticator.getCurrentUser(req.headers.authorization, "admin");
            return super.onResolve(
                res,
                await this.userService.update(parseInt(req.params.id), plainToInstance(UserDTO, req.body))
            );
        } catch (error) {
            return this.handleError(res, error);
        }
    };

    public login = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Extract the Google OAuth token from the request body
            const googleToken: string = req.body.token;
            if (!googleToken) {
                return super.onReject(res, ResponseCodeMessage.BAD_REQUEST_ERROR_CODE, "Token is required.");
            }
            const jwtToken = await authenticator.login(googleToken);

            // Send generated JWT token back to frontend
            return res.status(200).json({
                message: "Welcome",
                token: jwtToken
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    };

    public upload = async (req: Request, res: Response): Promise<any> => {
        if (!req.file?.buffer) {
            return super.onReject(res, ResponseCodeMessage.BAD_REQUEST_ERROR_CODE, "Please upload a CSV file!");
        }

        const users: UserDTO[] = [];

        const bufferStream = new stream.PassThrough();
        bufferStream.end(req.file.buffer);

        bufferStream
            .pipe(csv())
            .on("data", (row) => {
                users.push(
                    plainToInstance(UserDTO, {
                        username: row["username"],
                        firstName: row["firstname"],
                        lastName: row["lastname"],
                        email: row["email"],
                        buildingStr: row["building"],
                        floor: parseInt(row["floor"]),
                        desk: parseInt(row["desk"])
                    })
                );
            })
            .on("end", async () => {
                try {
                    await authenticator.getCurrentUser(req.headers.authorization, "admin");
                    return super.onResolve(res, await this.userService.upload(users));
                } catch (error) {
                    return this.handleError(res, error);
                }
            })
            .on("error", (error) => {
                return this.handleError(res, error);
            });
    };
}
