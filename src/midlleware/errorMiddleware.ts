// middleware/errorHandler.ts
import {NextFunction, Request, Response} from 'express';
import {BaseError} from '../utils/CustomError';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    if (err instanceof BaseError) {
        // Ici, vous pouvez également ajouter des logs
        return res.status(err.statusCode).json({message: err.message.toString(), level: err.level});
    }

    // Si ce n'est pas une erreur personnalisée, renvoyez une erreur serveur générique
    return res.status(500).json({message: err.toString()});
}
