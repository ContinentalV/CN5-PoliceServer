// routes/memberRoutes.ts
import express from 'express';

// routes/memberRoutes.ts avec un export par défaut
import memberController from '../controllers/memberController';
import {authenticate} from "../midlleware/authMiddleware";


const router = express.Router();

router.get('/members/:discordId', authenticate, memberController); // pour un export par défaut
router.post('/members', authenticate, memberController);
router.post('/init', authenticate, memberController);
router.put("/matriculeUpdate", authenticate, memberController)
router.put("/rolesUpdate", authenticate, memberController)
router.delete("/leave/:discordId", authenticate, memberController)
// Plus de routes pour mettre à jour, supprimer, etc.

export default router;


