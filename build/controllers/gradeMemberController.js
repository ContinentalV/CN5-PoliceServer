"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const gradeMemberService_1 = __importDefault(require("../services/gradeMemberService"));
const router = express_1.default.Router();
router.post('/grades/add', async (req, res, next) => {
    const { agentId, roleId } = req.body;
    try {
        await gradeMemberService_1.default.addGradeMember(agentId, roleId);
        res.status(200).json({ message: "Ajout du role avec succès" });
    }
    catch (e) {
        console.log(e);
    }
});
router.delete('/grades/delete', async (req, res, next) => {
    const { agentId, roleId } = req.body;
    try {
        await gradeMemberService_1.default.removeGradeMember(agentId, roleId);
        res.status(200).json({ message: "Supression du role avec succès" });
    }
    catch (e) {
        console.log(e);
    }
});
router.post('/grades/webAccess/', async (req, res, next) => {
    const { agentId } = req.body;
    try {
        await gradeMemberService_1.default.webAccessAdd(agentId);
        res.status(200).json({ message: "Ajout de la perm WebAcces avec succès" });
    }
    catch (e) {
        console.log(e);
    }
});
router.post('/grades/noAccess', async (req, res, next) => {
    const { agentId } = req.body;
    try {
        await gradeMemberService_1.default.webAccessRemove(agentId);
        res.status(200).json({ message: "Supression de la perm WebAcces avec succès" });
    }
    catch (e) {
        console.log(e);
    }
});
exports.default = router;
