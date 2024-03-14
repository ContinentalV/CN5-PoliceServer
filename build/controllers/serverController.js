"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// controllers/memberController.ts
const express_1 = __importDefault(require("express"));
const serverService_1 = __importDefault(require("../services/serverService"));
const CustomError_1 = require("../utils/CustomError");
const router = express_1.default.Router();
// Endpoint pour obtenir un membre par son ID
router.get('/:discordId', async (req, res, next) => {
    try {
        const server = await serverService_1.default.getServerById(req.params.discordId);
        if (server) {
            res.json(server);
        }
        else {
            res.status(404).send('Server non trouvé');
        }
    }
    catch (error) {
        res.status(500).send('Erreur interne du serveur');
    }
});
// Endpoint pour créer un nouveau membre
router.post('/init', async (req, res, next) => {
    try {
        await serverService_1.default.createServer(req.body); // Assurez-vous que req.body a la structure attendue
        res.status(201).send('server créé avec succès');
    }
    catch (error) {
        if (error instanceof Error) {
            next(error instanceof Error ? error : new CustomError_1.CriticalError("Erreur lors de l'initialisation du serveur"));
        }
    }
});
exports.default = router;
