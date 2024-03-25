// Structures pour stocker les métriques
import {Metrics} from "../interface";

export const metrics:Metrics = {
    totalRequests: 0,
    requests: {
        GET: 0,
        POST: 0,
        PUT: 0,
        DELETE: 0,
    },
    statusCodes: {
        success: 0,
        clientError: 0,
        serverError: 0,
    },
    responseTimes: [],
    errorsEncountered: 0,
    bandwidthUsage: {
        received: 0,
        sent: 0,
    },
    environment:process.env.CUSTOM_ENV || 'development',
    endpointUsage: {},
    activeRequests:0,
    requestCounts: {
        hourly: new Array(24).fill(0),
        daily: new Array(7).fill(0),
        weekly: new Array(4).fill(0),
        monthly: new Array(12).fill(0),
    },
    averageResponseTime: 0,
    externalServices: {
        fiveM: { isAvailable: false, responseTime: 0 },
        discord: { isAvailable: false, responseTime: 0 },
    },


};
