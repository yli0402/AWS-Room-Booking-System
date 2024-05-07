import "reflect-metadata";
import {PrismaClient} from "@prisma/client";
import BuildingRepository from "../src/repository/BuildingRepository";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import BuildingService from "../src/service/BuildingService";
import BuildingDTO from "../src/model/dto/BuildingDTO";
import CityDTO from "../src/model/dto/CityDTO";
import {getInitQueries, initDatabase} from "./Util";
import {plainToInstance} from "class-transformer";
import chaiSubset from "chai-subset";

use(chaiAsPromised);
use(chaiSubset);

describe("Building tests", function () {
    const db = new PrismaClient();
    let initQueries: string[];
    const buildingService = new BuildingService(new BuildingRepository(db));

    before(function () {
        initQueries = getInitQueries();
    });

    beforeEach(async function () {
        await initDatabase(initQueries, db);
    });

    describe("Get buildings", function () {
        let building3: BuildingDTO;

        before(function () {
            building3 = new BuildingDTO();
            building3.code = 74;
            building3.lat = 49.286433;
            building3.lon = -123.130863;
            building3.isActive = true;
            building3.city = new CityDTO();
            building3.city.cityId = "YVR";
        });

        it("should get all buildings", async function () {
            const result = await buildingService.getAll();

            expect(result[2].city!.cityId).to.equal(building3.city?.cityId);
            expect(result).to.have.lengthOf(7);
        });

        it("should get building by id", async function () {
            const result = await buildingService.getById(3);

            expect(result.city!.cityId).to.equal(building3.city!.cityId);
        });
    });

    describe("Create buildings", function () {
        it("should create a building", async function () {
            await buildingService.create(
                plainToInstance(BuildingDTO, {
                    city: {
                        cityId: "YVR"
                    },
                    code: 100,
                    lat: 49.282598,
                    lon: -123.11998,
                    address: "Address",
                    isActive: true
                })
            );

            expect(await buildingService.getAll()).to.containSubset([
                {
                    buildingId: 8,
                    city: {
                        cityId: "YVR"
                    },
                    code: 100,
                    lat: 49.282598,
                    lon: -123.11998,
                    address: "Address",
                    isActive: true
                }
            ]);
        });
    });
});
