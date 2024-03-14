import express from "express";

import serviceController from '../controllers/serviceController'
import {authenticate} from "../midlleware/authMiddleware";

const router = express.Router()

router.post('/start', authenticate, serviceController)
router.post('/end', authenticate, serviceController)
router.put('/add', authenticate, serviceController)
router.post('/resetAll', authenticate, serviceController)


export default router