import express from "express";
import profileController from "../controllers/profileController";
import {authenticate} from "../midlleware/authMiddleware";

const router = express.Router()

router.get('/:me', authenticate, profileController)
router.get('/p/leaderboards', authenticate, profileController)

export default router