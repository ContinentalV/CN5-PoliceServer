import { Request, Response, NextFunction } from 'express';
import { logger } from "../syslog/logger";

export function networkLoggerMiddleware(req: Request, res: Response, next: NextFunction) {
    res.on('finish', () => {
        let clientIP: string = '';
        if (typeof req.headers['x-real-ip'] === 'string') {
            clientIP = req.headers['x-real-ip'];
        } else if (Array.isArray(req.headers['x-real-ip'])) {
            // Si vous voulez prendre la première adresse IP dans le tableau
            clientIP = req.headers['x-real-ip'][0];
        }


        const logInfo = {
            client: determineClient(req), // Implémentez cette fonction selon votre logique
            ip: clientIP,
            token: req.headers['authorization']?.split(" ")[1] || req.cookies.jwt,
            requestURL: req.originalUrl,
            success: res.statusCode === 200 ? '✅' : '📛',
            statusCodeResponse: res.statusCode,
            data: req.body || req.params || "NO DATA",
        };

        logger.network(logInfo.client, clientIP, logInfo.token, logInfo.requestURL, logInfo.success === '✅', logInfo.statusCodeResponse, logInfo.data);
    });

    next();
}

function determineClient(req: Request): any {
    if (req.headers['authorization']){
        return  "BOT";
    } else if(req.cookies?.jwt){
        return "DASHBOARD";
    } else {
        return "UNKNOWN";
    }
}
