"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const statsService_1 = __importDefault(require("../services/statsService"));
const express_1 = __importDefault(require("express"));
const CustomError_1 = require("../utils/CustomError");
const utilFn_1 = require("../utils/utilFn");
const router = express_1.default.Router();
router.get('/stats/matricules', async (req, res, next) => {
    try {
        const matricules = await statsService_1.default.getAllMatricule();
        if (matricules) {
            res.json(matricules);
        }
        else {
            throw new CustomError_1.NotFoundError("Impossible de recuperer les matricules de la base de donnée.");
        }
    }
    catch (error) {
        if (error instanceof Error) {
            next(error instanceof Error ? error : new CustomError_1.CriticalError("Erreur interne. Contactez le dev."));
        }
    }
});
router.get("/stats/service", async (req, res, next) => {
    const codeMetier = typeof req.query.codeMetier === 'string' ? req.query.codeMetier : 'NOCODE';
    try {
        const serviceInfo = await statsService_1.default.getAllDataProfile(codeMetier);
        if (!serviceInfo) {
            throw new CustomError_1.NotFoundError("Impossible de recuperer les donnée de la base de donnée.");
        }
        else {
            res.status(200).json(serviceInfo);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            next(error instanceof Error ? error : new CustomError_1.CriticalError("Erreur interne"));
        }
    }
});
router.get('/stats/json/conti', async (req, res, next) => {
    try {
        const response = await (0, utilFn_1.fetchSafe)("https://servers-frontend.fivem.net/api/servers/single/eazypm", {
            headers: utilFn_1.headers
        });
        if (response.success && response.data) {
            res.json(response.data);
        }
        else {
            throw new CustomError_1.NotFoundError("Impossible de récupérer les données de l'API externe.");
        }
    }
    catch (error) {
        if (error instanceof Error) {
            next(error instanceof Error ? error : new CustomError_1.CriticalError("Erreur interne"));
        }
    }
});
router.get("/stats/base-salarial/:code", async (req, res, next) => {
    const code = req.params.code;
    try {
        const arrayGradesSalaire = await statsService_1.default.getBaseSalarialGrade(code);
        // @ts-ignore
        if (arrayGradesSalaire.length <= 0) {
            throw new CustomError_1.LightError("Impossible de récupérer les données de base salarial");
        }
        res.status(200).json({ data: arrayGradesSalaire });
    }
    catch (e) {
        if (e instanceof Error) {
            next(e instanceof Error ? e : new CustomError_1.CriticalError("Erreur interne"));
        }
    }
});
router.get("/stats/grade/all/:serveurId", async (req, res, next) => {
    const serverId = req.params.serveurId;
    try {
        const arrayAllGrades = await statsService_1.default.getAllGrade(serverId);
        if (arrayAllGrades) {
            res.status(200).json({ grades: arrayAllGrades });
        }
        else {
            throw new CustomError_1.LightError("Impossible de recuperer les grades. Erreur interne");
        }
    }
    catch (e) {
        if (e instanceof Error) {
            next(e instanceof Error ? e : new CustomError_1.CriticalError("Erreur interne"));
        }
    }
});
exports.default = router;
