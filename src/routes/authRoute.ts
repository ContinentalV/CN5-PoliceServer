// authRoutes.ts
import express from "express";
import authController from "../controllers/authController";
import {authenticate} from "../midlleware/authMiddleware";


const router = express.Router();

router.post("/token", authController);
router.get("/verify", authController)
router.get("/logout", authenticate, authController)

export default router;
