// routes/discordAPIRoutes.ts
import express from 'express';
import {
    modifyRoleForMember,
    renameAgentWithReplicationOnDiscord,
    replaceMatriculeInNameDiscord
} from '../controllers/discordAPIController';

const router = express.Router();

// Route pour renommer un membre Discord


router.patch('/members/:discordId/rename/matricule', replaceMatriculeInNameDiscord);
router.patch('/members/:discordId/discord/rename', renameAgentWithReplicationOnDiscord);
router.post('/members/roles/updates', modifyRoleForMember);

export default router;
