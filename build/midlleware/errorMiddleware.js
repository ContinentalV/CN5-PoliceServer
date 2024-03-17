"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const CustomError_1 = require("../utils/CustomError");
function errorHandler(err, req, res, next) {
    if (err instanceof CustomError_1.BaseError) {
        // Ici, vous pouvez également ajouter des logs
        return res.status(err.statusCode).json({ message: err.message.toString(), level: err.level });
    }
    // Si ce n'est pas une erreur personnalisée, renvoyez une erreur serveur générique
    return res.status(500).json({ message: err.toString() });
}
exports.errorHandler = errorHandler;
