import express from "express";
import gradeMemberController from "../controllers/gradeMemberController";
import {authenticate} from "../midlleware/authMiddleware";

const router = express.Router()

router.post('/grades/add', authenticate, gradeMemberController)
router.delete('/grades/delete', authenticate, gradeMemberController)
router.post('/grades/webAccess', authenticate, gradeMemberController)
router.post('/grades/noAccess', authenticate, gradeMemberController)


export default router