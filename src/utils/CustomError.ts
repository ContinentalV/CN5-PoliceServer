export class BaseError extends Error {
    public statusCode: number;
    public level: string;

    constructor(name: string, statusCode: number, level: string, message: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = name;
        this.statusCode = statusCode;
        this.level = level;
        Error.captureStackTrace(this)
    }
}

export class CriticalError extends BaseError {
    constructor(message: string) {
        super("CriticalError", 500, "critique", message);
    }
}

export class ConflictError extends BaseError {
    constructor(message: string) {
        super("ConflictError", 409, "conflict", message);
    }
}

export class ForbidenAccess extends BaseError {
    constructor(message: string) {
        super("ForbidenAccess", 403, "forbiden", message);
    }
}

export class NotFoundError extends BaseError {
    constructor(message: string) {
        super("NotFoundError", 404, "forbiden", message);
    }
}

export class ModerateError extends BaseError {
    constructor(message: string) {
        super("ModerateError", 400, "moderer", message);
    }
}

export class LightError extends BaseError {
    constructor(message: string) {
        super("LightError", 400, "easy", message);
    }

}