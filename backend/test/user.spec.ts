import "reflect-metadata";
import {PrismaClient} from "@prisma/client";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import chaiSubset from "chai-subset";
import {getInitQueries, initDatabase} from "./Util";
import UserRepository from "../src/repository/UserRepository";
import {plainToInstance} from "class-transformer";
import UserDTO from "../src/model/dto/UserDTO";
import UserService from "../src/service/UserService";

use(chaiAsPromised);
use(chaiSubset);

describe("User tests", function () {
    const db = new PrismaClient();
    const initQueries = getInitQueries();
    const userService = new UserService(new UserRepository(db));

    beforeEach(async function () {
        await initDatabase(initQueries, db);
    });

    describe("Create users", function () {
        it("111", async function () {
            await userService.create(
                plainToInstance(UserDTO, {
                    username: "newUser",
                    firstName: "First",
                    lastName: "Last",
                    email: "aa@gmail.com",
                    floor: 5,
                    desk: 505,
                    building: {
                        buildingId: 1
                    },
                    role: "staff",
                    isActive: true
                })
            );
            const result = await userService.getById(30);
            expect(result).to.containSubset({
                username: "newUser",
                firstName: "First",
                lastName: "Last",
                email: "aa@gmail.com",
                floor: 5,
                desk: 505,
                building: {
                    buildingId: 1
                },
                role: "staff",
                isActive: true
            });
        });
    });
});
