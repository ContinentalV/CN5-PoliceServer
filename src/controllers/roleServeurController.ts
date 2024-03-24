import express, {NextFunction, Request, Response} from "express";
import gradeService from "../services/roleServerService";
import {errorLogger, mainLogger} from "../syslog/logger";
import {v4 as uuidv4} from "uuid";

const router = express.Router()

router.post('/roles/create', async (req: Request, res: Response, next: NextFunction) => {

    const {roleId, name, color, serverId} = req.body
    try {
        await gradeService.createRoleFromListRole(roleId, name, color, serverId)
        mainLogger.info("|✅| Role create request ")
        return res.status(200).json({message: "|✅| Role create request"})
    } catch (error:any) {
        const errorId = uuidv4();
        errorLogger.error({ message: error.message, color, serverId, roleId, errorId });
        res.status(500).json({ message: "|❌| Creation du role echouer", errorId });
    }
})

router.delete('/roles/delete', async (req: Request, res: Response, next: NextFunction) => {
    const {roleId, name, color, serverId} = req.body
    try {
        await gradeService.deleteRoleFromListRole(roleId, serverId)
        mainLogger.info("|✅| Role delete request ")
        return res.status(200).json({message: "|✅| Role delete request "})
    } catch (error:any) {
        const errorId = uuidv4();
        errorLogger.error({ message: error.message, color, serverId, roleId, name,errorId });
        res.status(500).json({ message: "|❌| Supression du role echouer", errorId });
    }
})

router.post('/roles/update', async (req: Request, res: Response, next: NextFunction) => {
    const {roleId, name, color, serverId} = req.body

    try {
        await gradeService.updateRoleFromListRole(roleId, name, color, serverId)
        mainLogger.info("|✅| Role update request ")
        return res.status(200).json({message: "|✅| Role update request "})

    } catch (error:any) {
        const errorId = uuidv4();
        errorLogger.error({ message: error.message, color, serverId, roleId, name,errorId });
        res.status(500).json({ message: "|❌| Update du role echouer", errorId });
    }
})

export default router