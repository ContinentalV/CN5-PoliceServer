"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const serviceService_1 = __importDefault(require("../services/serviceService"));
const CustomError_1 = require("../utils/CustomError");
const router = express_1.default.Router();
router.post('/start', async (req, res, next) => {
    const PDS = new Date(req.body.start);
    const discordAgentId = req.body.target;
    try {
        const isInService = await serviceService_1.default.isUserInService(discordAgentId);
        if (isInService) {
            throw new CustomError_1.ForbidenAccess(`Agent ->  <@${discordAgentId}> est déja en pds`);
        }
        await serviceService_1.default.startService(discordAgentId, PDS);
        return res.status(200).send('Service start ✅');
    }
    catch (error) {
        if (error instanceof Error) {
            next(error instanceof Error ? error : new CustomError_1.CriticalError("Une erreur est survenue."));
        }
    }
});
router.post('/end', async (req, res, next) => {
    const FDS = new Date(req.body.end);
    const discordAgentId = req.body.target;
    try {
        const isInService = await serviceService_1.default.isUserInService(discordAgentId);
        if (!isInService) {
            throw new CustomError_1.ForbidenAccess(`Agent ->  <@${discordAgentId}> à deja fini son service`);
        }
        await serviceService_1.default.endService(discordAgentId, FDS);
        return res.status(200).send('Service terminer: ✅');
    }
    catch (error) {
        if (error instanceof Error) {
            next(error instanceof Error ? error : new CustomError_1.CriticalError("Une erreur est survenue."));
        }
    }
});
router.put('/add', async (req, res, next) => {
    const tmp = Number(req.body.temps);
    console.log(typeof tmp + " | " + tmp);
    const targetId = req.body.targetId;
    const mode = req.body.mode;
    try {
        await serviceService_1.default.manageTimeService(targetId, tmp, mode);
        res.status(200).json({ message: `Vous avez bien ${mode === "add" ? "ajouter" : "retirer"}: ${tmp} Minutes` });
    }
    catch (error) {
        if (error instanceof Error) {
            next(error instanceof Error ? error : new CustomError_1.CriticalError(`Une erreur est survenur pendant l'update}`));
        }
    }
});
router.post('/resetAll', async (req, res, next) => {
    try {
        await serviceService_1.default.resetData(req.body.company);
        return res.status(200).json({ message: "Request succefull:✅" });
    }
    catch (error) {
        if (error instanceof Error) {
            next(error instanceof Error ? error : new CustomError_1.CriticalError("Une erreur est survenue lors du reset"));
        }
    }
});
exports.default = router;
