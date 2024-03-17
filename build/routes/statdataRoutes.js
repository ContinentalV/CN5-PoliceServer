"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = __importDefault(require("os"));
const dbConfig_1 = require("../config/dbConfig");
const responseTimeTracker_1 = require("../midlleware/responseTimeTracker");
const utilFn_1 = require("../utils/utilFn");
const dayjs_1 = __importDefault(require("dayjs"));
const functions_1 = require("../utils/functions");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get('/api', async (req, res, next) => {
    try {
        const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024;
        const totalMemory = os_1.default.totalmem() / 1024 / 1024;
        const memoryUsage = {
            memUse: `${Math.round(usedMemory * 100) / 100}`,
            Total: `${Math.round(totalMemory * 100) / 100} `
        };
        // Métriques CPU
        const cpus = os_1.default.cpus();
        const cpuLoad = cpus.map(cpu => {
            const total = cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.irq + cpu.times.idle;
            const active = total - cpu.times.idle;
            return active / total;
        });
        const dbResult = await (0, dbConfig_1.getConnectionInfo)();
        if (!dbResult)
            throw new Error('Failed to retrieve DB connection info.');
        const db2Result = await (0, dbConfig_1.testConnection2)();
        if (!db2Result)
            throw new Error('Failed to perform test connection.');
        // Utilisez directement `dbResult` et `db2Result` pour accéder aux données de la base de données
        const dbProcesses = dbResult.process.filter(p => p.Time !== null && p.db !== null);
        const activeQueries = dbProcesses.length;
        const longestQueryTime = Math.max(...dbProcesses.map(p => p.Time));
        // Construisez l'objet monitoringData avec les informations récupérées
        const monitoringData = {
            memory: memoryUsage, // Assurez-vous que cette variable est initialisée correctement
            cpu: cpuLoad, // Assurez-vous que cette variable est initialisée correctement
            db: {
                process: dbResult.process,
                activeConexion: dbResult.activeConexion,
                db2: db2Result // Supposons que cela signifie quelque chose dans votre contexte
            },
            // Ajoutez ici d'autres données de surveillance si nécessaire
        };
        // Utilisez l'objet monitoringData comme nécessaire, par exemple pour le logger ou l'envoyer quelque part
        console.log(monitoringData);
        const responseTime = (0, responseTimeTracker_1.logAverageResponseTimes)();
        function transformToExpectedStructure(data) {
            return {
                good: data.good.map(r => ({ length: parseFloat(r.responseTimeMs) })),
                average: data.average.map(r => ({ length: parseFloat(r.responseTimeMs) })),
                tooLong: data.tooLong.map(r => ({ length: parseFloat(r.responseTimeMs) })),
            };
        }
        const transformedRequestPerformanceData = transformToExpectedStructure(responseTimeTracker_1.requestPerformanceData);
        const percentageRequestQuality = (0, utilFn_1.calculateRequestPercentage)(transformedRequestPerformanceData);
        const goodRequestBar = (0, utilFn_1.createProgressBar)(percentageRequestQuality.goodPercentage);
        const averageRequestBar = (0, utilFn_1.createProgressBar)(percentageRequestQuality.averagePercentage);
        const tooLongRequestBar = (0, utilFn_1.createProgressBar)(percentageRequestQuality.tooLongPercentage);
        const goodHits = (0, utilFn_1.formatRequestHits)(responseTimeTracker_1.requestPerformanceData.good, "GET", "🟢");
        const averageHits = (0, utilFn_1.formatRequestHits)(responseTimeTracker_1.requestPerformanceData.average, "GET", "🟠");
        const tooLongHits = (0, utilFn_1.formatRequestHits)(responseTimeTracker_1.requestPerformanceData.tooLong, "GET", "🔴");
        const postGoodHit = (0, utilFn_1.formatRequestHits)(responseTimeTracker_1.requestPerformanceData.good, "POST", "🟢");
        const postAverageHit = (0, utilFn_1.formatRequestHits)(responseTimeTracker_1.requestPerformanceData.average, "POST", "🟠");
        const postToolongHit = (0, utilFn_1.formatRequestHits)(responseTimeTracker_1.requestPerformanceData.tooLong, "POST", "🔴");
        const putGoodHit = (0, utilFn_1.formatRequestHits)(responseTimeTracker_1.requestPerformanceData.good, "PUT", "🟢");
        const putAverageHit = (0, utilFn_1.formatRequestHits)(responseTimeTracker_1.requestPerformanceData.average, "PUT", "🟠");
        const putToolongHit = (0, utilFn_1.formatRequestHits)(responseTimeTracker_1.requestPerformanceData.tooLong, "PUT", "🔴");
        let title = "DASHBOARD API-CN5 PERF";
        let desc = { refresh: (0, dayjs_1.default)(Date.now()).format('DD-MM-YYYY - HH:mm:ss'), uptime: process.uptime() };
        const data = {
            title,
            desc,
            percentageRequestQuality,
            responseTime,
            monitoringData,
            activeQueries,
            longestQueryTime,
        };
        res.status(200).json({ data });
    }
    catch (error) {
        if (error instanceof Error) {
            (0, functions_1.logError)('Erreur lors du monitoring des performances:' + error.message);
            res.status(500).json({ error: error.message });
        }
        else {
            // Gérer le cas où error n'est pas une instance de Error, si nécessaire
            res.status(500).json({ error: 'Une erreur inconnue est survenue' });
        }
    }
});
exports.default = router;
