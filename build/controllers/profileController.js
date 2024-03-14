"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const profileService_1 = __importDefault(require("../services/profileService"));
const statsService_1 = __importDefault(require("../services/statsService"));
const CustomError_1 = require("../utils/CustomError");
const router = express_1.default.Router();
router.get('/:me', async (req, res, next) => {
    try {
        const targetId = req.params.me;
        const profileInfo = await profileService_1.default.getUserProfile(targetId);
        const salary = await profileService_1.default.getSalaryForUser(targetId);
        if (!targetId || !profileInfo)
            throw new CustomError_1.ModerateError('Profile inexistant dans la base de donné');
        res.status(200).json({ message: 'request succeed:✅', profileInfo, salary });
    }
    catch (error) {
        if (error instanceof Error) {
            next(error);
        }
        else {
            next(new CustomError_1.CriticalError("Le serveur a rencontré une erreur. Contactez votre supérieur."));
        }
    }
});
router.get('/p/leaderboards', async (req, res, next) => {
    let dataAll = [];
    try {
        const codeMetier = typeof req.query.codeMetier === 'string' ? req.query.codeMetier : "nocode";
        console.log("CODE " + codeMetier);
        const dataProfile = await statsService_1.default.getAllDataProfile(codeMetier);
        if (!dataProfile)
            throw new CustomError_1.CriticalError("Impossible de recuperer les data de la base de donnée.");
        for (const user of dataProfile) {
            let userResume = await profileService_1.default.getUserProfile(user.discordId);
            if (!userResume)
                return;
            userResume.salary = await profileService_1.default.getSalaryForUser(user.discordId);
            dataAll.push(userResume);
        }
        res.status(200).json({ message: 'request: ✅', dataAll });
    }
    catch (error) {
        if (error instanceof Error) {
            next(error instanceof Error ? error : new CustomError_1.CriticalError("Erreur interne du serveur"));
        }
    }
});
exports.default = router;
