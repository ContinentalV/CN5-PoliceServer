import express, {NextFunction, Request, Response} from "express";

import profileService from "../services/profileService";
import statsService from "../services/statsService";
import {CriticalError, ModerateError} from "../utils/CustomError";
import {IProfile} from "../entities/Profile";
import {errorLogger, mainLogger} from "../syslog/logger";
import {v4 as uuidv4} from "uuid";
const router = express.Router()

router.get('/:me', async (req: Request, res: Response, next: NextFunction) => {
    const targetId = req.params.me
    try {

        const profileInfo = await profileService.getUserProfile(targetId)
        const salary = await profileService.getSalaryForUser(targetId)
         if (!targetId || !profileInfo) return res.status(409).json({message:`|📛| Profile inexistant dans la base de donnée, id discord: ${targetId} `})
         mainLogger.info('request succeed |✅|')
         res.status(200).json({message: 'request succeed |✅|', profileInfo, salary})
    } catch (error:any) {
        const errorId = uuidv4();
        errorLogger.error({ message: error.message, targetId, errorId });
        res.status(500).json({ message: "|❌| Erreur récuparation du profile", errorId });
    }


})
router.get('/p/leaderboards', async (req: Request, res: Response, next: NextFunction): Promise<any> => {

    let dataAll: IProfile[] = [];
    const codeMetier: string = typeof req.query.codeMetier === 'string' ? req.query.codeMetier : "nocode";
    try {
        const dataProfile = await statsService.getAllDataProfile(codeMetier)
        if (!dataProfile) return res.status(409).json({message: `|❌| Impossible de recuperer les data de la base de donnée.`})

        for (const user of dataProfile) {
            let userResume = await profileService.getUserProfile(user.discordId)
            if (!userResume) return
            userResume.salary = await profileService.getSalaryForUser(user.discordId)
            dataAll.push(userResume)
        }
        mainLogger.info('request |✅|')
        res.status(200).json({message: 'request |✅|', dataAll})
    } catch (error:any) {
        const errorId = uuidv4();
        errorLogger.error({ message: error.message, codeMetier, errorId });
        res.status(500).json({ message: "|❌| Erreur getting leadearboards", errorId });
    }


})

export default router