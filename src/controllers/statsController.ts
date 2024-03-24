import statsService from "../services/statsService";
import express, {NextFunction, Request, Response} from "express";
import {CriticalError, LightError, NotFoundError} from "../utils/CustomError";
import {fetchSafe, headers} from "../utils/utilFn";
import {errorLogger, mainLogger} from "../syslog/logger";
import {v4 as uuidv4} from "uuid";


const router = express.Router();
router.get('/stats/matricules', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const matricules = await statsService.getAllMatricule();
        if (matricules) {
            res.json(matricules);
        } else {
            mainLogger.warn('|🟠| Impossible de recuperer les matricules de la base de donnée.')
             res.status(404).json({message: "|🟠| Impossible de recuperer les matricules de la base de donnée."})
        }
    } catch (error:any) {
        const errorId = uuidv4();
        errorLogger.error({ message: error.message,  errorId });
        res.status(500).json({ message: "|❌| Récuperation des matricules impossible.", errorId });
    }
});


router.get("/stats/service", async (req: Request, res: Response, next: NextFunction) => {
    const codeMetier: string = typeof req.query.codeMetier === 'string' ? req.query.codeMetier : 'NOCODE';
    try {
        const serviceInfo = await statsService.getAllDataProfile(codeMetier)
        if (!serviceInfo) {
            mainLogger.warn("|❌| Impossible de recuperer les profils de la base de donnée.")
            res.status(404).json({message: "|❌| Impossible de recuperer les profils de la base de donnée."})
        } else {
            res.status(200).json(serviceInfo)
        }
    } catch (error:any) {
        const errorId = uuidv4();
        errorLogger.error({ message: error.message,codeMetier, errorId });
        res.status(500).json({ message: "|❌| Erreur interne du serveur", errorId });
    }
})


router.get('/stats/json/conti', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await fetchSafe("https://servers-frontend.fivem.net/api/servers/single/eazypm", {
            headers
        });
        if (response.success && response.data) {
           // mainLogger.info("|✅| Data json continentalv bien récupérée.")
            res.json(response.data);
        } else {
            mainLogger.warn("|❌| Impossible de récupérer les données du json-conti\"")
           res.status(500).json({message:"|❌| Impossible de récupérer les données du json-conti"});
        }
    } catch (error:any) {
        const errorId = uuidv4();
        errorLogger.error({ message: error.message, errorId });
        res.status(500).json({ message: "|❌| Erreur interne du serveur", errorId });
    }
});

router.get("/stats/base-salarial/:code", async (req: Request, res: Response, next: NextFunction) => {
    const code = req.params.code
    try {
        const arrayGradesSalaire = await statsService.getBaseSalarialGrade(code)
        // @ts-ignore
        if (arrayGradesSalaire.length <= 0) {
            mainLogger.warn("|❌| Impossible de récupérer les données de base salarial")
           res.status(404).json({message: "|❌| Impossible de récupérer les données de base salarial"});
        }
        mainLogger.info("|✅| Data base salarial récupérer")
        res.status(200).json({data: arrayGradesSalaire})
    } catch (error:any) {
        const errorId = uuidv4();
        errorLogger.error({ message: error.message, errorId });
        res.status(500).json({ message: "|❌| Erreur interne du serveur", errorId });
    }

})

router.get("/stats/grade/all/:serveurId", async (req: Request, res: Response, next: NextFunction) => {
    const serverId = req.params.serveurId
    try {
        const arrayAllGrades = await statsService.getAllGrade(serverId)
        if (arrayAllGrades) {
            mainLogger.info("|✅| Grade récuperer avec succès")
            res.status(200).json({grades: arrayAllGrades})
        } else {
            mainLogger.warn("|❌| Impossible de recuperer les grades.")
           res.status(404).json({message:"|❌| Impossible de recuperer les grades."})
        }
    } catch (error:any) {
        const errorId = uuidv4();
        errorLogger.error({ message: error.message, errorId });
        res.status(500).json({ message: "|❌| Erreur interne du serveur", errorId });
    }

})
export default router;