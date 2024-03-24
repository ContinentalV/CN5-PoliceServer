import express, { NextFunction, Request, Response } from "express";
import gradeMemberService from "../services/gradeMemberService";
import { mainLogger, errorLogger } from "../syslog/logger"; // Importez les instances spécifiques de loggers
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.post('/grades/add', async (req: Request, res: Response, next: NextFunction) => {
    const { agentId, roleId } = req.body;

    try {
        await gradeMemberService.addGradeMember(agentId, roleId);
        mainLogger.info(`Ajout du role avec succès pour agentId: ${agentId}, roleId: ${roleId}`);
        res.status(200).json({ message: "|✅| Ajout du role avec succès" });
    } catch (e: any) {
        const errorId = uuidv4(); // Générez un ID unique pour l'erreur
        errorLogger.error({ message: e.message, agentId, roleId, errorId }); // Loguez l'erreur avec des détails et l'ID
        res.status(500).json({ message: "|❌| Ajout du role failed", errorId }); // Renvoyez l'ID d'erreur dans la réponse
    }
});

router.delete('/grades/delete', async (req: Request, res: Response, next: NextFunction) => {
    const { agentId, roleId } = req.body;
    try {
        await gradeMemberService.removeGradeMember(agentId, roleId);
        mainLogger.info(`Suppression du role avec succès pour agentId: ${agentId}, roleId: ${roleId}`);
        res.status(200).json({ message: "|✅| Suppression du role avec succès" });
    } catch (e: any) {
        const errorId = uuidv4();
        errorLogger.error({ message: e.message, agentId, roleId});
        res.status(500).json({ message: "|❌| Suppression du role failed", errorId });
    }
});

router.post('/grades/webAccess/', async (req: Request, res: Response, next: NextFunction) => {
    const { agentId } = req.body;
    try {
        await gradeMemberService.webAccessAdd(agentId);
        mainLogger.info(`Ajout de la permission WebAcces avec succès pour agentId: ${agentId}`);
        res.status(200).json({ message: "|✅| Ajout de la permission WebAcces avec succès" });
    } catch (e: any) {
        const errorId = uuidv4();
        errorLogger.error({ message: e.message, agentId, errorId });
        res.status(500).json({ message: "|❌| Ajout de la permission WebAcces failed", errorId });
    }
});

router.post('/grades/noAccess', async (req: Request, res: Response, next: NextFunction) => {
    const { agentId } = req.body;
    try {
        await gradeMemberService.webAccessRemove(agentId);
        mainLogger.info(`Suppression de la permission WebAcces avec succès pour agentId: ${agentId}`);
        res.status(200).json({ message: "|✅| Suppression de la permission WebAcces avec succès" });
    } catch (e: any) {
        const errorId = uuidv4();
        errorLogger.error({ message: e.message, agentId, errorId });
        res.status(500).json({ message: "|❌| Suppression de la permission WebAcces failed", errorId });
    }
});

export default router;
