// routes/memberRoutes.ts
import express from 'express';

// routes/memberRoutes.ts avec un export par défaut
import serverController from '../controllers/serverController';
import {authenticate} from "../midlleware/authMiddleware";


const router = express.Router();

router.get('/:serverId', authenticate, serverController); // pour un export par défaut
router.post('/init', authenticate, serverController);

// Plus de routes pour mettre à jour, supprimer, etc.

export default router;
