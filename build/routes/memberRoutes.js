"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/memberRoutes.ts
const express_1 = __importDefault(require("express"));
// routes/memberRoutes.ts avec un export par défaut
const memberController_1 = __importDefault(require("../controllers/memberController"));
const authMiddleware_1 = require("../midlleware/authMiddleware");
const router = express_1.default.Router();
router.get('/members/:discordId', authMiddleware_1.authenticate, memberController_1.default); // pour un export par défaut
router.post('/members', authMiddleware_1.authenticate, memberController_1.default);
router.post('/init', authMiddleware_1.authenticate, memberController_1.default);
router.put("/matriculeUpdate", authMiddleware_1.authenticate, memberController_1.default);
router.put("/rolesUpdate", authMiddleware_1.authenticate, memberController_1.default);
router.delete("/leave/:discordId", authMiddleware_1.authenticate, memberController_1.default);
// Plus de routes pour mettre à jour, supprimer, etc.
exports.default = router;
