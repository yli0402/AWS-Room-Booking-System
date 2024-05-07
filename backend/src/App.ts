import "reflect-metadata";
import express from "express";
import {PrismaClient} from "@prisma/client";
import RoomController from "./controller/RoomController";
import RoomService from "./service/RoomService";
import RoomRepository from "./repository/RoomRepository";
import UserController from "./controller/UserController";
import UserService from "./service/UserService";
import UserRepository from "./repository/UserRepository";
import BuildingController from "./controller/BuildingController";
import BuildingService from "./service/BuildingService";
import BuildingRepository from "./repository/BuildingRepository";
import cors from "cors";
import BookingController from "./controller/BookingController";
import BookingService from "./service/BookingService";
import BookingRepository from "./repository/BookingRepository";
import Authenticator from "./util/Authenticator";
import EventController from "./controller/EventController";
import EventService from "./service/EventService";
import EventRepository from "./repository/EventRepository";
import multer from "multer";

const app = express();
// Registers middleware
app.use(express.json());
app.use(cors());

const database = new PrismaClient();

const userRepository = new UserRepository(database);
export const authenticator = Authenticator.getInstance(userRepository);

const bookingController = new BookingController(new BookingService(new BookingRepository(database)));
const roomController = new RoomController(new RoomService(new RoomRepository(database)));
const userController = new UserController(new UserService(userRepository));
const buildingController = new BuildingController(new BuildingService(new BuildingRepository(database)));
const eventController = new EventController(new EventService(new EventRepository(database)));
const endpoint: string = "/aws-room-booking/api/v1";

// Sample route
app.get(`${endpoint}/`, (req, res) => res.send("Welcome to the Awsome Booking app!"));

// Sample route with data
app.get(`${endpoint}/api/data`, (req, res) => {
    res.json({message: "Here is your data from Awsome Booking!"});
});

// Room routes
app.get(`${endpoint}/rooms`, roomController.getAll);
app.get(`${endpoint}/rooms/:id`, roomController.getById);
app.post(`${endpoint}/rooms/create`, roomController.create);
app.put(`${endpoint}/rooms/:id`, roomController.update);

//login route
app.post(`${endpoint}/users/login`, userController.login);

// User routes
app.get(`${endpoint}/users`, userController.getAll);
app.get(`${endpoint}/users/all-email`, userController.getAllEmail);
app.get(`${endpoint}/users/:id`, userController.getById);
app.post(`${endpoint}/users/create`, userController.create);
app.put(`${endpoint}/users/update/:id`, userController.update);

// User upload route
const upload = multer({storage: multer.memoryStorage()}); // multer is a middleware to handle file upload
app.post(`${endpoint}/users/upload`, upload.single("file"), userController.upload);

// Booking route
app.post(`${endpoint}/booking/time-suggestion`, bookingController.getSuggestedTimes);
app.post(`${endpoint}/booking/available-room`, bookingController.getAvailableRooms);
app.get(`${endpoint}/booking/currentUser`, bookingController.getByCurrentUserId);
app.get(`${endpoint}/booking/:id`, bookingController.getById);
app.post(`${endpoint}/booking/create`, bookingController.create);
app.put(`${endpoint}/booking/:id`, bookingController.update);

// Building routes
app.get(`${endpoint}/buildings`, buildingController.getAll);
app.get(`${endpoint}/buildings/:id`, buildingController.getById);
app.post(`${endpoint}/buildings/create`, buildingController.create);
app.put(`${endpoint}/buildings/:id`, buildingController.update);

// Event routes
app.get(`${endpoint}/events`, eventController.getAllByCurrentUser);
app.get(`${endpoint}/events/:id`, eventController.getById);
app.post(`${endpoint}/events/create`, eventController.create);
app.put(`${endpoint}/events/:id`, eventController.update);
app.delete(`${endpoint}/events/:id`, eventController.delete);

export default app;
