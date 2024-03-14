"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const roleServerService_1 = __importDefault(require("../services/roleServerService"));
const CustomError_1 = require("../utils/CustomError");
const router = express_1.default.Router();
router.post('/roles/create', async (req, res, next) => {
    const { roleId, name, color, serverId } = req.body;
    try {
        await roleServerService_1.default.createRoleFromListRole(roleId, name, color, serverId);
        return res.status(200).json({ message: "Role creer avec succès" });
    }
    catch (error) {
        if (error instanceof Error) {
            next(error);
        }
        else {
            next(new CustomError_1.CriticalError("Erreur interne lors de la creation du role dans la base de donnée"));
        }
    }
});
router.delete('/roles/delete', async (req, res, next) => {
    const { roleId, name, color, serverId } = req.body;
    try {
        await roleServerService_1.default.deleteRoleFromListRole(roleId, serverId);
        return res.status(200).json({ message: "Suppression de toute les entrées du role " });
    }
    catch (error) {
        if (error instanceof Error) {
            next(error);
        }
        else {
            next(new CustomError_1.CriticalError("Erreur interne lors de la supression du role dans la base de donnée"));
        }
    }
});
router.post('/roles/update', async (req, res, next) => {
    const { roleId, name, color, serverId } = req.body;
    try {
        await roleServerService_1.default.updateRoleFromListRole(roleId, name, color, serverId);
        return res.status(200).json({ message: "Le role a bien été mis a jour" });
    }
    catch (error) {
        if (error instanceof Error) {
            next(error);
        }
        else {
            next(new CustomError_1.CriticalError("Erreur interne lors de la modification du role dans la base de donnée"));
        }
    }
});
exports.default = router;
