"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// controllers/memberController.ts
const express_1 = __importDefault(require("express"));
const memberService_1 = __importDefault(require("../services/memberService"));
const functions_1 = require("../utils/functions");
const CustomError_1 = require("../utils/CustomError");
//TODO joi ou express validator pour typer req.body
//Todo ajouter des interface pour req.body
const router = express_1.default.Router();
router.get('/members/:discordId', async (req, res, next) => {
    try {
        const member = await memberService_1.default.getMemberById(req.params.discordId);
        if (member) {
            res.json(member);
        }
        else {
            throw new CustomError_1.LightError("Membre non trouvé.");
        }
    }
    catch (error) {
        next(error);
    }
});
router.post('/members', async (req, res, next) => {
    try {
        await memberService_1.default.createMember(req.body); // Assurez-vous que req.body a la structure attendue
        await memberService_1.default.createServiceEntryForMember(req.body.discordId);
        await memberService_1.default.roleMember(req.body);
        await memberService_1.default.createGradeEntryForMember(req.body.discordId, req.body.initRole);
        res.status(201).send('Profile en bdd creer avec succès.');
    }
    catch (error) {
        next(error instanceof Error ? error : new CustomError_1.CriticalError("Erreur inconnue lors de la creation du profil"));
    }
});
router.post("/init", async (req, res, next) => {
    const usersData = req.body; // Remplacez 'any' par un type plus spécifique si possible
    //console.log(usersData)
    const usersNotAdded = []; // Remplacez 'any' par un type plus spécifique si possible
    try {
        for (const userData of usersData) {
            const existingMember = await memberService_1.default.getMemberById(userData.discordId);
            if (!existingMember) {
                await memberService_1.default.createMember(userData);
                await memberService_1.default.roleMember(userData);
                await memberService_1.default.gradeMember(userData);
                await memberService_1.default.createServiceEntryForMember(userData.discordId);
            }
            else {
                usersNotAdded.push({
                    discordId: userData.discordId,
                    username: userData.username,
                    codeMetier: userData.codeMetier,
                    matricule: userData.matricule
                });
            }
        }
        res.status(200).json({
            message: 'Initialisation terminée.',
            usersNotAdded: usersNotAdded
        });
    }
    catch (error) {
        if (error instanceof Error) {
            next(error instanceof Error ? error : new CustomError_1.CriticalError("Erreur inconnue lors de l'initialisation"));
        }
    }
});
router.put("/matriculeUpdate", async (req, res, next) => {
    try {
        const newMat = req.body.newMat;
        const target = req.body.target;
        const dbTarget = await memberService_1.default.getMemberById(target);
        if (!dbTarget || typeof dbTarget.codeMetier !== "string")
            throw new CustomError_1.LightError("Cette agent n'est pas présent dans la bdd.");
        await memberService_1.default.updateMemberMatricule(dbTarget.discordId, newMat, dbTarget.codeMetier);
        res.status(200).json({ message: `Mise a jour du matricule ${dbTarget.matricule} par => ${newMat}: ✅` });
        (0, functions_1.logInfo)({ message: `Mise a jour du matricule ${dbTarget.matricule} par => ${newMat}: ✅` });
    }
    catch (error) {
        next(error instanceof Error ? error : new CustomError_1.ConflictError("Ce matricule est deja pris"));
    }
});
router.put("/rolesUpdate", async (req, res, next) => {
    const { id: target, avatar, nickname, role } = req.body;
    console.log(role);
    try {
        const userDB = await memberService_1.default.getMemberById(target);
        if (!userDB)
            return res.status(404).json({ message: "Utilisateur introuvable." });
        const updates = {};
        if (avatar && userDB.avatar !== avatar) {
            updates.avatar = avatar;
        }
        if (nickname !== undefined && userDB?.nomRP !== nickname) {
            updates.nomRP = nickname;
        }
        if (role !== undefined) {
            await memberService_1.default.updateMemberRole(target, role);
        }
        if (Object.keys(updates).length > 0) {
            await memberService_1.default.updateMemberInfo(target, updates);
        }
        res.status(200).json({ message: "data updates" });
    }
    catch (e) {
        next(e);
    }
});
router.delete('/leave/:discordId', async (req, res, next) => {
    const target = req.params.discordId;
    try {
        await memberService_1.default.deleteMember(target);
        (0, functions_1.logInfo)({ message: `AGENT: ${target} => agent supprimer` });
        res.status(200).json({ message: `Suppression des data de l'agent: <@${target}> réussi` });
    }
    catch (e) {
        next(e instanceof Error ? e : new CustomError_1.ConflictError("Erreur interne BDD"));
    }
});
exports.default = router;
