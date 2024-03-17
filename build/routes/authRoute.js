"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// authRoutes.ts
const express_1 = __importDefault(require("express"));
const authController_1 = __importDefault(require("../controllers/authController"));
const authMiddleware_1 = require("../midlleware/authMiddleware");
const router = express_1.default.Router();
router.post("/token", authController_1.default);
router.get("/verify", authController_1.default);
router.get("/logout", authMiddleware_1.authenticate, authController_1.default);
exports.default = router;
