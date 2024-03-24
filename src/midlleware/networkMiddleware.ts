import { Request, Response, NextFunction } from 'express';
import { networkLogger } from "../syslog/logger";
import { format } from 'winston';
import { LogEntry } from 'winston';
interface NetworkLogEntry extends LogEntry {
    message: string;

}
export function networkLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
    res.on('finish', () => {

        const clientIP: string = typeof req.headers['x-forwarded-for'] === 'string' ? req.headers['x-forwarded-for'] :
            Array.isArray(req.headers['x-forwarded-for']) ? req.headers['x-forwarded-for'][0] :
                req.socket.remoteAddress || 'Inconnu';

        // Gestion sécurisée de la récupération du token
        const bearerToken: string | undefined = req.headers.authorization?.split(' ')[1];
        const cookieToken: string | undefined = req.cookies.jwt;
        const token: string = bearerToken || cookieToken || '';
        const maskedToken: string = token ? `****${token.slice(-10)}` : 'Aucun token';

        // Logique pour déterminer le client
        const clientType: string = determineClient(req);

        // Construction de l'objet de log
        const logInfo:  NetworkLogEntry = {
            level: 'network',
            message: JSON.stringify({
                client: clientType,
                ip: clientIP,
                token: maskedToken,
                requestURL: req.originalUrl,
                method: req.method,
                statusCode: res.statusCode,
                data: req.method === "GET" ? req.query : req.body,
            })
        };

        networkLogger.log(logInfo);
    });

    next();
}

// Fonction auxiliaire pour déterminer le type de client
function determineClient(req: Request): string {
    if (req.headers.authorization) {
        return "BOT";
    } else if (req.cookies && req.cookies.jwt) {
        return "DASHBOARD";
    }
    return "UNKNOWN";
}
