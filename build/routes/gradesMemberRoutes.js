"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const gradeMemberController_1 = __importDefault(require("../controllers/gradeMemberController"));
const authMiddleware_1 = require("../midlleware/authMiddleware");
const router = express_1.default.Router();
router.post('/grades/add', authMiddleware_1.authenticate, gradeMemberController_1.default);
router.delete('/grades/delete', authMiddleware_1.authenticate, gradeMemberController_1.default);
router.post('/grades/webAccess', authMiddleware_1.authenticate, gradeMemberController_1.default);
router.post('/grades/noAccess', authMiddleware_1.authenticate, gradeMemberController_1.default);
exports.default = router;
