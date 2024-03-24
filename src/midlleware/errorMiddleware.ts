import {NextFunction, Request, Response} from 'express';
import {BaseError} from '../utils/CustomError';
import { errorLogger } from '../syslog/logger'; // Importez spécifiquement errorLogger
import { v4 as uuidv4 } from 'uuid';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    const errorId = uuidv4(); // Génère un ID unique pour l'erreur

    // Construit l'objet log avec l'ID d'erreur
    let logObject = {
        level: 'error',
        message: err.message,
        id: errorId,
        // Ajoutez d'autres informations pertinentes ici, selon les besoins
    };

    // Utilise errorLogger pour enregistrer l'erreur avec l'ID
    errorLogger.log(logObject); // Notez l'utilisation de .log avec l'objet logObject

    // Réponse générique envoyée au client avec l'ID d'erreur
    return res.status(err instanceof BaseError ? err.statusCode : 500).json({
        message: "Une erreur est survenue. Veuillez réessayer.",
        errorId: errorId, // Incluez l'ID dans la réponse au client pour référence
    });
}
