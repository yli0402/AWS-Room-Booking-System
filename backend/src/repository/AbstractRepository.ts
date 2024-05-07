import AbstractDTO from "../model/dto/AbstractDTO";
import {PrismaClient} from "@prisma/client";

export default abstract class AbstractRepository {
    protected db;

    protected constructor(database: PrismaClient) {
        this.db = database;
    }

    public abstract findAll(): Promise<AbstractDTO[]>;
    public abstract findById(id: number): Promise<AbstractDTO | null>;
    // public abstract findByEmail(email: string): Promise<AbstractDTO | null>;
    // public abstract create(dto: AbstractDTO): Promise<AbstractDTO>;
}
