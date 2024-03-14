import statsService from "../services/statsService";
import express, {NextFunction, Request, Response} from "express";
import {CriticalError, LightError, NotFoundError} from "../utils/CustomError";
import {fetchSafe, headers} from "../utils/utilFn";


const router = express.Router();
router.get('/stats/matricules', async (req: Request, res: Response, next: NextFunction) => {
    try {
       
        const matricules = await statsService.getAllMatricule();
        if (matricules) {
            res.json(matricules);
        } else {
            throw new NotFoundError("Impossible de recuperer les matricules de la base de donnée.")
        }
    } catch (error) {
        if (error instanceof Error) {
            next(error instanceof Error ? error : new CriticalError("Erreur interne. Contactez le dev."));
        }
    }
});


router.get("/stats/service", async (req: Request, res: Response, next: NextFunction) => {
    const codeMetier: string = typeof req.query.codeMetier === 'string' ? req.query.codeMetier : 'NOCODE';

    try {
        const serviceInfo = await statsService.getAllDataProfile(codeMetier)
        if (!serviceInfo) {
            throw new NotFoundError("Impossible de recuperer les donnée de la base de donnée.")
        } else {
            res.status(200).json(serviceInfo)

        }

    } catch (error) {
        if (error instanceof Error) {
            next(error instanceof Error ? error : new CriticalError("Erreur interne"));
        }
    }

})


router.get('/stats/json/conti', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await fetchSafe("https://servers-frontend.fivem.net/api/servers/single/eazypm", {
            headers
        });
        if (response.success && response.data) {
            res.json(response.data);
        } else {
            throw new NotFoundError("Impossible de récupérer les données de l'API externe.");
        }
    } catch (error) {
        if (error instanceof Error) {
            next(error instanceof Error ? error : new CriticalError("Erreur interne"));
        }
    }
});

router.get("/stats/base-salarial/:code", async (req: Request, res: Response, next: NextFunction) => {
    const code = req.params.code
    try {
        const arrayGradesSalaire = await statsService.getBaseSalarialGrade(code)
        // @ts-ignore
        if (arrayGradesSalaire.length <= 0) {
            throw new LightError("Impossible de récupérer les données de base salarial");
        }
        res.status(200).json({data: arrayGradesSalaire})

    } catch (e) {
        if (e instanceof Error) {
            next(e instanceof Error ? e : new CriticalError("Erreur interne"));
        }
    }

})

router.get("/stats/grade/all/:serveurId", async (req: Request, res: Response, next: NextFunction) => {
    const serverId = req.params.serveurId
    try {
        const arrayAllGrades = await statsService.getAllGrade(serverId)
        if (arrayAllGrades) {
            res.status(200).json({grades: arrayAllGrades})
        } else {
            throw new LightError("Impossible de recuperer les grades. Erreur interne")
        }


    } catch (e) {
        if (e instanceof Error) {
            next(e instanceof Error ? e : new CriticalError("Erreur interne"));
        }
    }

})
export default router;