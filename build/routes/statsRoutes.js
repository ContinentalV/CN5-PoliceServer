"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/memberRoutes.ts
const express_1 = __importDefault(require("express"));
const statsController_1 = __importDefault(require("../controllers/statsController"));
const authMiddleware_1 = require("../midlleware/authMiddleware");
const router = express_1.default.Router();
router.get('/stats/matricules', authMiddleware_1.authenticate, statsController_1.default);
router.get('/stats/service', authMiddleware_1.authenticate, statsController_1.default);
router.get('/stats/json/conti', authMiddleware_1.authenticate, statsController_1.default); // Ajoutez cette route pour les données de conti
router.get('/stats/base-salarial/:code', authMiddleware_1.authenticate, statsController_1.default); // Ajoutez cette route pour les données de conti
router.get('/stats/grade/all/:serveurId', authMiddleware_1.authenticate, statsController_1.default); // Ajoutez cette route pour les données de conti
exports.default = router;
