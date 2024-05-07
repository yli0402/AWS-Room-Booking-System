import UserDTO from "../model/dto/UserDTO";
import {jwtDecode} from "jwt-decode";
import jwt, {JsonWebTokenError} from "jsonwebtoken";
import {NotFoundError, UnauthorizedError} from "./exception/AWSRoomBookingSystemError";
import UserRepository from "../repository/UserRepository";
import {role} from "@prisma/client";

interface GoogleUser {
    email: string;
    name: string;
    given_name: string;
    family_name: string;
    exp: number;
    aud: string;
    iss: string;
}

export default class Authenticator {
    private static instance: Authenticator;
    private readonly userRepo: UserRepository;

    private constructor(userRepo: UserRepository) {
        this.userRepo = userRepo;
    }

    public static getInstance(userRepo: UserRepository): Authenticator {
        if (!Authenticator.instance) {
            Authenticator.instance = new Authenticator(userRepo);
        }
        return Authenticator.instance;
    }

    public getCurrentUser = async (header: string | undefined, roleAuth?: string): Promise<UserDTO> => {
        if (!header || !header.startsWith("Bearer ")) {
            return Promise.reject(new UnauthorizedError("No token provided or token does not have Bearer prefix"));
        }
        const token = header.substring(7);
        try {
            const payload = jwt.verify(token, "9gAEG7DfpqsMmDEnyXJI3rAh4HIA70fK");
            if (typeof payload === "object" && payload !== null && "email" in payload) {
                const currentUser = await this.fetchUserByEmail(payload.email);
                if (roleAuth === role.admin) {
                    this.isAdmin(currentUser);
                }
                return currentUser;
            } else {
                throw new UnauthorizedError("Token payload does not include email");
            }
        } catch (error) {
            if (error instanceof JsonWebTokenError) {
                throw new UnauthorizedError(error.message);
            } else {
                throw error;
            }
        }
    };

    public login = async (googleToken: string): Promise<string> => {
        const userData = await this.validateGoogleToken(googleToken);
        return await this.generateJwtToken(userData);
    };

    private isAdmin = (userDTO: UserDTO) => {
        if (userDTO.role !== role.admin) {
            throw new UnauthorizedError();
        }
    };

    private validateGoogleToken = async (googleToken: string): Promise<UserDTO> => {
        const CLIENT_ID: string = process.env.CLIENT_ID!;
        const decodedUserInfo: GoogleUser = jwtDecode(googleToken);
        if (!decodedUserInfo) {
            return Promise.reject(new UnauthorizedError(`Invalid token`));
        }
        // check if exp has passed
        if (Date.now() >= decodedUserInfo.exp * 1000) {
            return Promise.reject(new UnauthorizedError(`Expired token`));
        }
        //check aud
        if (decodedUserInfo.aud !== CLIENT_ID) {
            return Promise.reject(new UnauthorizedError(`Invalid audience`));
        }
        //check iss
        if (!["accounts.google.com", "https://accounts.google.com"].includes(decodedUserInfo.iss)) {
            return Promise.reject(new UnauthorizedError(`Invalid issuer (iss) in token`));
        }

        // fetch the user by email
        return await this.fetchUserByEmail(decodedUserInfo.email);
    };

    private fetchUserByEmail = async (email: string) => {
        // fetch the user by email
        let user: UserDTO;
        try {
            user = await this.userRepo.findByEmail(email);
        } catch (error) {
            if (error instanceof NotFoundError) {
                return Promise.reject(new UnauthorizedError(`User ${email} is not authorized`));
            } else {
                return Promise.reject(error);
            }
        }
        //reject authorization for inactive users
        if (!user.isActive) {
            return Promise.reject(new UnauthorizedError(`User ${email} is no longer active`));
        }
        // Return the user data
        return user;
    };

    private generateJwtToken = async (userDTO: UserDTO): Promise<string> => {
        const payload = {
            userId: userDTO.userId,
            username: userDTO.username,
            firstName: userDTO.firstName,
            lastName: userDTO.lastName,
            email: userDTO.email,
            floor: userDTO.floor,
            desk: userDTO.desk,
            isActive: userDTO.isActive,
            role: userDTO.role
        };
        return new Promise((resolve, reject) => {
            jwt.sign(payload, "9gAEG7DfpqsMmDEnyXJI3rAh4HIA70fK", {expiresIn: "1h"}, (err, token) => {
                if (err || !token) {
                    reject(err);
                } else {
                    resolve(token);
                }
            });
        });
    };
}
