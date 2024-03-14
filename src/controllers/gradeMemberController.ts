import express, {NextFunction, Request, Response} from "express";
import gradeMemberService from "../services/gradeMemberService";

const router = express.Router()

router.post('/grades/add', async (req: Request, res: Response, next: NextFunction) => {
    const {agentId, roleId} = req.body

    try {
        await gradeMemberService.addGradeMember(agentId, roleId)
        res.status(200).json({message: "Ajout du role avec succès"})
    } catch (e) {
        console.log(e)
    }


})

router.delete('/grades/delete', async (req: Request, res: Response, next: NextFunction) => {
    const {agentId, roleId} = req.body

    try {
        await gradeMemberService.removeGradeMember(agentId, roleId)
        res.status(200).json({message: "Supression du role avec succès"})
    } catch (e) {
        console.log(e)
    }

})
router.post('/grades/webAccess/', async (req: Request, res: Response, next: NextFunction) => {
    const {agentId} = req.body

    try {
        await gradeMemberService.webAccessAdd(agentId)
        res.status(200).json({message: "Ajout de la perm WebAcces avec succès"})
    } catch (e) {
        console.log(e)
    }

})
router.post('/grades/noAccess', async (req: Request, res: Response, next: NextFunction) => {
    const {agentId} = req.body

    try {
        await gradeMemberService.webAccessRemove(agentId)
        res.status(200).json({message: "Supression de la perm WebAcces avec succès"})
    } catch (e) {
        console.log(e)
    }

})
export default router