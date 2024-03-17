"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LightError = exports.ModerateError = exports.NotFoundError = exports.ForbidenAccess = exports.ConflictError = exports.CriticalError = exports.BaseError = void 0;
class BaseError extends Error {
    constructor(name, statusCode, level, message) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = name;
        this.statusCode = statusCode;
        this.level = level;
        Error.captureStackTrace(this);
    }
}
exports.BaseError = BaseError;
class CriticalError extends BaseError {
    constructor(message) {
        super("CriticalError", 500, "critique", message);
    }
}
exports.CriticalError = CriticalError;
class ConflictError extends BaseError {
    constructor(message) {
        super("ConflictError", 409, "conflict", message);
    }
}
exports.ConflictError = ConflictError;
class ForbidenAccess extends BaseError {
    constructor(message) {
        super("ForbidenAccess", 403, "forbiden", message);
    }
}
exports.ForbidenAccess = ForbidenAccess;
class NotFoundError extends BaseError {
    constructor(message) {
        super("NotFoundError", 404, "forbiden", message);
    }
}
exports.NotFoundError = NotFoundError;
class ModerateError extends BaseError {
    constructor(message) {
        super("ModerateError", 400, "moderer", message);
    }
}
exports.ModerateError = ModerateError;
class LightError extends BaseError {
    constructor(message) {
        super("LightError", 400, "easy", message);
    }
}
exports.LightError = LightError;
