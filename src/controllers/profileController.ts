import express, {NextFunction, Request, Response} from "express";

import profileService from "../services/profileService";
import statsService from "../services/statsService";
import {CriticalError, ModerateError} from "../utils/CustomError";
import {IProfile} from "../entities/Profile";

const router = express.Router()

router.get('/:me', async (req: Request, res: Response, next: NextFunction) => {

    try {
        const targetId = req.params.me
        const profileInfo = await profileService.getUserProfile(targetId)
        const salary = await profileService.getSalaryForUser(targetId)

        if (!targetId || !profileInfo) throw new ModerateError('Profile inexistant dans la base de donné')

        res.status(200).json({message: 'request succeed:✅', profileInfo, salary})
    } catch (error) {
        if (error instanceof Error) {
            next(error);
        } else {
            next(new CriticalError("Le serveur a rencontré une erreur. Contactez votre supérieur."));
        }
    }


})
router.get('/p/leaderboards', async (req: Request, res: Response, next: NextFunction): Promise<any> => {

    let dataAll: IProfile[] = [];
    try {
        const codeMetier: string = typeof req.query.codeMetier === 'string' ? req.query.codeMetier : "nocode";
        console.log("CODE " + codeMetier)
        const dataProfile = await statsService.getAllDataProfile(codeMetier)
        if (!dataProfile) throw new CriticalError("Impossible de recuperer les data de la base de donnée.")

        for (const user of dataProfile) {
            let userResume = await profileService.getUserProfile(user.discordId)
            if (!userResume) return

            userResume.salary = await profileService.getSalaryForUser(user.discordId)
            dataAll.push(userResume)
            

        }


        res.status(200).json({message: 'request: ✅', dataAll})
    } catch (error) {
        if (error instanceof Error) {
            next(error instanceof Error ? error : new CriticalError("Erreur interne du serveur"));
        }
    }


})

export default router