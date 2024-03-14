"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/discordAPIRoutes.ts
const express_1 = __importDefault(require("express"));
const discordAPIController_1 = require("../controllers/discordAPIController");
const router = express_1.default.Router();
// Route pour renommer un membre Discord
router.patch('/members/:discordId/rename/matricule', discordAPIController_1.replaceMatriculeInNameDiscord);
router.patch('/members/:discordId/discord/rename', discordAPIController_1.renameAgentWithReplicationOnDiscord);
router.post('/members/roles/updates', discordAPIController_1.modifyRoleForMember);
exports.default = router;
