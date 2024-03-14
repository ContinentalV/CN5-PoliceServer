"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const roleServeurController_1 = __importDefault(require("../controllers/roleServeurController"));
const authMiddleware_1 = require("../midlleware/authMiddleware");
const router = express_1.default.Router();
router.post('/roles/create', authMiddleware_1.authenticate, roleServeurController_1.default);
router.delete('/roles/delete', authMiddleware_1.authenticate, roleServeurController_1.default);
router.post('/roles/update', authMiddleware_1.authenticate, roleServeurController_1.default);
exports.default = router;
