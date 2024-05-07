import AbstractDTO from "../model/dto/AbstractDTO";
import {validate, ValidationError, ValidatorOptions} from "class-validator";
import {BadRequestError, NotFoundError, RequestConflictError} from "../util/exception/AWSRoomBookingSystemError";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime/library";

export default abstract class AbstractService {
    public abstract getAll(): Promise<AbstractDTO[]>;

    public abstract getById(id: number): Promise<AbstractDTO>;

    public abstract create(dto: AbstractDTO): Promise<AbstractDTO>;

    public abstract update(id: number, dto: AbstractDTO): Promise<AbstractDTO>;

    protected async validateIncomingDTO(dto: AbstractDTO, validatorOptions: ValidatorOptions | undefined = undefined) {
        const validationErrors = await validate(dto, validatorOptions);
        if (validationErrors.length > 0) {
            throw new BadRequestError(this.getValidationErrorMessages(validationErrors).join(", "));
        }
    }

    protected getValidationErrorMessages(validationErrors: ValidationError[]): string[] {
        const messages: string[] = [];
        for (const error of validationErrors) {
            if (error.constraints) {
                messages.push(...Object.values(error.constraints));
            }
            if (error.children && error.children.length > 0) {
                messages.push(...this.getValidationErrorMessages(error.children));
            }
        }
        return messages;
    }

    protected validateId(id: number, entity: string) {
        if (isNaN(id)) {
            throw new BadRequestError(`invalid ${entity} ID`);
        }
    }

    protected toKnownErrors(
        error: PrismaClientKnownRequestError,
        entity: string,
        uniqueConstraint: string,
        foreignEntity: string
    ) {
        if (error.code === "P2002") {
            throw new RequestConflictError(`another ${entity} with the same ${uniqueConstraint} already exists`);
        }
        if (error.code === "P2003") {
            throw new NotFoundError(`${foreignEntity} does not exist`);
        }
        if (error.code === "P2025") {
            throw new NotFoundError(`${entity} does not exist`);
        }
    }
}
