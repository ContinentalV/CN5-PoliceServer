import express, {NextFunction, Request, Response} from 'express';
import serverService from "../services/serverService";
import {errorLogger, mainLogger} from "../syslog/logger";
import {v4 as uuidv4} from "uuid";


const router = express.Router();

// Endpoint pour obtenir un server par son ID
router.get('/:discordId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const server = await serverService.getServerById(req.params.discordId);
        if (server) {
            mainLogger.info(`|✅| Les data du serveur: ${server.serverName} - ${server.serverId} ont bien été récuperées`)
            res.json(server);
        } else {
            mainLogger.warn("|🟠| Server non trouvé'")
            res.status(404).send('|🟠| Server non trouvé');
        }
    } catch (error:any) {
        const errorId = uuidv4();
        errorLogger.error({ message: error.message, errorId });
        res.status(500).json({ message: "|❌| Erreur interne du serveur", errorId });
    }
});

// Endpoint pour créer un nouveau membre
router.post('/init', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await serverService.createServer(req.body);
        mainLogger.info("|✅| server créé avec succès")
        res.status(201).send('|✅| server créé avec succès');
    } catch (error:any) {
        const errorId = uuidv4();
        errorLogger.error({ message: error.message, errorId });
        res.status(500).json({ message: "|❌| Initialisation du serveur  echouer", errorId });
    }
});


export default router;


