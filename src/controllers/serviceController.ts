import express, {NextFunction, Request, Response} from "express";
import serviceService from "../services/serviceService";
import {errorLogger, mainLogger} from "../syslog/logger";
import {v4 as uuidv4} from "uuid";

const router = express.Router()

router.post('/start', async (req: Request, res: Response, next: NextFunction) => {

    const PDS = new Date(req.body.start)
    const discordAgentId = req.body.target


    try {
        const isInService = await serviceService.isUserInService(discordAgentId)
        if (isInService) {
           mainLogger.warn(`|📛| Agent → <@${discordAgentId}> est déja en pds`)
          return res.status(409).json({message:`|📛| Agent ->  <@${discordAgentId}> est déja en pds`})
        }
        await serviceService.startService(discordAgentId, PDS)
        mainLogger.info(`L'agent ${discordAgentId} → Service start |✅|`)
        return res.status(200).send('Service start |✅|')
    } catch (error:any) {
        const errorId = uuidv4();
        errorLogger.error({ message: error.message, PDS, discordAgentId, errorId });
        res.status(500).json({ message: "|❌| Erreur prise de service", errorId });

    }


})
router.post('/end', async (req: Request, res: Response, next: NextFunction) => {
    const FDS = new Date(req.body.end)
    const discordAgentId = req.body.target
    try {
        const isInService = await serviceService.isUserInService(discordAgentId)
        if (!isInService) {
            mainLogger.warn(`|📛|Agent → <@${discordAgentId}> a déjà fini son service.`)
            return res.status(409).json({message:`|📛| Agent ->  <@${discordAgentId}> a déjà fini son service.`})
        }
        await serviceService.endService(discordAgentId, FDS)
        mainLogger.info(`L'agent ${discordAgentId} → Service end |✅|`)
        return res.status(200).send('Service terminer: |✅|')
    } catch (error:any) {
        const errorId = uuidv4();
        errorLogger.error({ message: error.message, FDS, discordAgentId, errorId });
        res.status(500).json({ message: "|❌| Erreur fin de service", errorId });
    }
})

router.put('/add', async (req: Request, res: Response, next: NextFunction) => {
    const tmp = Number(req.body.temps)
    const targetId = req.body.targetId
    const mode = req.body.mode
    try {
        await serviceService.manageTimeService(targetId, tmp, mode)
        mainLogger.info(`|✅| Vous avez bien ${mode === "add" ? "ajouter" : "retirer"}: ${tmp} Minutes`)
        res.status(200).json({message: `|✅| Vous avez bien ${mode === "add" ? "ajouter" : "retirer"}: ${tmp} Minutes`})
    } catch (error:any) {
        const errorId = uuidv4();
        errorLogger.error({ message: error.message, tmp, targetId, mode, errorId });
        res.status(500).json({ message: "|❌| Erreur change-time", errorId });
    }
})

router.post('/resetAll', async (req: Request, res: Response, next: NextFunction) => {

    try {
        await serviceService.resetData(req.body.company)
        mainLogger.warn("Reset des données effectuer avec succès |✅|")
        return res.status(200).json({message: "Request succefull |✅|"})

    } catch (error:any) {
        const errorId = uuidv4();
        errorLogger.error({ message: error.message, errorId });
        res.status(500).json({ message: "|❌| Erreur reset des stats agents", errorId });
    }
})

export default router