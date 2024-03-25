import express from 'express';
import {metrics} from "../utils/constExport";


// Middleware pour suivre les requêtes
export const requestTracker = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const start = process.hrtime();
    metrics.totalRequests++;
    metrics.requests[req.method]++;
    metrics.activeRequests = (metrics.activeRequests || 0) + 1;
    const currentHour = new Date().getHours();
    metrics.requestCounts.hourly[currentHour]++;


    const endpoint = req.path; // Ou req.baseUrl + req.path si vous avez besoin du chemin de base également
    if (!metrics.endpointUsage[endpoint]) {
        metrics.endpointUsage[endpoint] = 0;
    }
    metrics.endpointUsage[endpoint]++;
    res.on('finish', () => {
        // Calcul du temps de réponse
        const diff = process.hrtime(start);
        const responseTime = diff[0] * 1e3 + diff[1] * 1e-6; // en ms
        metrics.responseTimes.push(responseTime);
        if (metrics && metrics.activeRequests) metrics.activeRequests--;
        // Comptage des statuts HTTP
        if (res.statusCode >= 200 && res.statusCode < 300) {
            metrics.statusCodes.success++;
        } else if (res.statusCode >= 400 && res.statusCode < 500) {
            metrics.statusCodes.clientError++;
        } else if (res.statusCode >= 500) {
            metrics.statusCodes.serverError++;
        }
        const contentLength = res.getHeader('Content-Length');
        if (typeof contentLength === 'string') {
            metrics.bandwidthUsage.sent += parseInt(contentLength, 10);
        }
        const sumResponseTimes = metrics.responseTimes.reduce((acc, cur) => acc + cur, 0);
        metrics.averageResponseTime = sumResponseTimes / metrics.responseTimes.length;
    });
    next();
};
// Middleware pour suivre les erreurs
const errorTracker = (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    metrics.errorsEncountered++;
    next(err);
};
export default {requestTracker, errorTracker}
