// controllers/memberController.ts
import express, {NextFunction, Request, Response} from 'express';
import serverService from "../services/serverService";
import {CriticalError} from "../utils/CustomError";


const router = express.Router();

// Endpoint pour obtenir un membre par son ID
router.get('/:discordId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const server = await serverService.getServerById(req.params.discordId);
        if (server) {
            res.json(server);
        } else {
            res.status(404).send('Server non trouvé');
        }
    } catch (error) {
        res.status(500).send('Erreur interne du serveur');
    }
});

// Endpoint pour créer un nouveau membre
router.post('/init', async (req: Request, res: Response, next: NextFunction) => {
    try {

        await serverService.createServer(req.body); // Assurez-vous que req.body a la structure attendue
        res.status(201).send('server créé avec succès');

    } catch (error) {
        if (error instanceof Error) {
            next(error instanceof Error ? error : new CriticalError("Erreur lors de l'initialisation du serveur"));
        }
    }
});


export default router;


