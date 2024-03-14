import express from "express";
import roleServeurController from "../controllers/roleServeurController";
import {authenticate} from "../midlleware/authMiddleware";

const router = express.Router()

router.post('/roles/create', authenticate, roleServeurController)
router.delete('/roles/delete', authenticate, roleServeurController)
router.post('/roles/update', authenticate, roleServeurController)

export default router