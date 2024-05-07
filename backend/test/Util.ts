import {PrismaClient} from "@prisma/client";
import fs from "fs";

const initSqlDir = "./init.sql";

export const getInitQueries = () => {
    return fs.readFileSync(initSqlDir).toString().split(";");
};

export const initDatabase = async (initQueries: string[], db: PrismaClient) => {
    for (const query of initQueries) {
        // eslint-disable-next-line no-await-in-loop
        await db.$queryRawUnsafe(query);
    }
};
