import express, {NextFunction, Request, Response} from "express";
import serviceService from "../services/serviceService";
import {CriticalError, ForbidenAccess} from "../utils/CustomError";

const router = express.Router()

router.post('/start', async (req: Request, res: Response, next: NextFunction) => {

    const PDS = new Date(req.body.start)
    const discordAgentId = req.body.target


    try {
        const isInService = await serviceService.isUserInService(discordAgentId)
        if (isInService) {
            throw new ForbidenAccess(`Agent ->  <@${discordAgentId}> est déja en pds`)

        }
        await serviceService.startService(discordAgentId, PDS)
        return res.status(200).send('Service start ✅')


    } catch (error) {

        if (error instanceof Error) {
            next(error instanceof Error ? error : new CriticalError("Une erreur est survenue."));
        }
    }


})
router.post('/end', async (req: Request, res: Response, next: NextFunction) => {

    const FDS = new Date(req.body.end)
    const discordAgentId = req.body.target


    try {
        const isInService = await serviceService.isUserInService(discordAgentId)

        if (!isInService) {
            throw new ForbidenAccess(`Agent ->  <@${discordAgentId}> à deja fini son service`)

        }
        await serviceService.endService(discordAgentId, FDS)

        return res.status(200).send('Service terminer: ✅')


    } catch (error) {
        if (error instanceof Error) {
            next(error instanceof Error ? error : new CriticalError("Une erreur est survenue."));
        }
    }


})

router.put('/add', async (req: Request, res: Response, next: NextFunction) => {

    const tmp = Number(req.body.temps)
    console.log(typeof tmp + " | " + tmp)
    const targetId = req.body.targetId
    const mode = req.body.mode

    try {
        await serviceService.manageTimeService(targetId, tmp, mode)
        res.status(200).json({message: `Vous avez bien ${mode === "add" ? "ajouter" : "retirer"}: ${tmp} Minutes`})


    } catch (error) {
        if (error instanceof Error) {
            next(error instanceof Error ? error : new CriticalError(`Une erreur est survenur pendant l'update}`));
        }

    }

})

router.post('/resetAll', async (req: Request, res: Response, next: NextFunction) => {

    try {
        await serviceService.resetData(req.body.company)
        return res.status(200).json({message: "Request succefull:✅"})

    } catch (error) {
        if (error instanceof Error) {
            next(error instanceof Error ? error : new CriticalError("Une erreur est survenue lors du reset"));
        }
    }
})

export default router