"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/memberRoutes.ts
const express_1 = __importDefault(require("express"));
// routes/memberRoutes.ts avec un export par défaut
const serverController_1 = __importDefault(require("../controllers/serverController"));
const authMiddleware_1 = require("../midlleware/authMiddleware");
const router = express_1.default.Router();
router.get('/:serverId', authMiddleware_1.authenticate, serverController_1.default); // pour un export par défaut
router.post('/init', authMiddleware_1.authenticate, serverController_1.default);
// Plus de routes pour mettre à jour, supprimer, etc.
exports.default = router;
