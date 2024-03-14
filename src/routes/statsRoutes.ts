// routes/memberRoutes.ts
import express from 'express';
import statsController from "../controllers/statsController";
import {authenticate} from "../midlleware/authMiddleware";

const router = express.Router();

router.get('/stats/matricules', authenticate, statsController);
router.get('/stats/service', authenticate, statsController);
router.get('/stats/json/conti', authenticate, statsController); // Ajoutez cette route pour les données de conti
router.get('/stats/base-salarial/:code', authenticate, statsController); // Ajoutez cette route pour les données de conti
router.get('/stats/grade/all/:serveurId', authenticate, statsController); // Ajoutez cette route pour les données de conti

export default router;
