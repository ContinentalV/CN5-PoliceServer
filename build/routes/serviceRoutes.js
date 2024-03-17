"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const serviceController_1 = __importDefault(require("../controllers/serviceController"));
const authMiddleware_1 = require("../midlleware/authMiddleware");
const router = express_1.default.Router();
router.post('/start', authMiddleware_1.authenticate, serviceController_1.default);
router.post('/end', authMiddleware_1.authenticate, serviceController_1.default);
router.put('/add', authMiddleware_1.authenticate, serviceController_1.default);
router.post('/resetAll', authMiddleware_1.authenticate, serviceController_1.default);
exports.default = router;
