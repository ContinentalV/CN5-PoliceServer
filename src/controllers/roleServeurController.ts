import express, {NextFunction, Request, Response} from "express";
import gradeService from "../services/roleServerService";
import {CriticalError} from "../utils/CustomError";

const router = express.Router()

router.post('/roles/create', async (req: Request, res: Response, next: NextFunction) => {

    const {roleId, name, color, serverId} = req.body

    try {
        await gradeService.createRoleFromListRole(roleId, name, color, serverId)
        return res.status(200).json({message: "Role creer avec succès"})
    } catch (error) {
        if (error instanceof Error) {
            next(error);
        } else {
            next(new CriticalError("Erreur interne lors de la creation du role dans la base de donnée"));
        }
    }


})

router.delete('/roles/delete', async (req: Request, res: Response, next: NextFunction) => {
    const {roleId, name, color, serverId} = req.body

    try {
        await gradeService.deleteRoleFromListRole(roleId, serverId)
        return res.status(200).json({message: "Suppression de toute les entrées du role "})
    } catch (error) {
        if (error instanceof Error) {
            next(error);
        } else {
            next(new CriticalError("Erreur interne lors de la supression du role dans la base de donnée"));
        }
    }


})

router.post('/roles/update', async (req: Request, res: Response, next: NextFunction) => {
    const {roleId, name, color, serverId} = req.body

    try {
        await gradeService.updateRoleFromListRole(roleId, name, color, serverId)
        return res.status(200).json({message: "Le role a bien été mis a jour"})

    } catch (error) {
        if (error instanceof Error) {
            next(error);
        } else {
            next(new CriticalError("Erreur interne lors de la modification du role dans la base de donnée"));
        }
    }


})

export default router