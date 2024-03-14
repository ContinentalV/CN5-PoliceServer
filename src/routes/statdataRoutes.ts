import os from "os";
import {getConnectionInfo, testConnection2} from "../config/dbConfig";
import {logAverageResponseTimes, requestPerformanceData} from "../midlleware/responseTimeTracker";
import {calculateRequestPercentage, createProgressBar, formatRequestHits} from "../utils/utilFn";
import dayjs from "dayjs";
import {logError} from "../utils/functions";
import express from "express";
import {RequestPerformanceData} from "../config/monitoringSystem";

const router = express.Router()
router.get('/api', async (req, res, next) => {
    interface RequestData {
        path: string;           // Le chemin de la requête
        method: string;         // La méthode HTTP utilisée pour la requête, par exemple GET ou POST
        status: number;         // Le code de statut HTTP de la réponse
        responseTimeMs: string; // Le temps de réponse pour la requête en millisecondes, sous forme de chaîne de caractères
        category: 'good' | 'average' | 'tooLong'; // Une catégorisation de la performance de la requête
        timestamp: string;      // Un horodatage pour la requête
    }

    try {

        const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024;
        const totalMemory = os.totalmem() / 1024 / 1024;
        const memoryUsage = {
            memUse: `${Math.round(usedMemory * 100) / 100}`,
            Total: `${Math.round(totalMemory * 100) / 100} `
        };
        // Métriques CPU
        const cpus = os.cpus();
        const cpuLoad = cpus.map(cpu => {
            const total = cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.irq + cpu.times.idle;
            const active = total - cpu.times.idle;
            return active / total;
        });

        const dbResult = await getConnectionInfo();
        if (!dbResult) throw new Error('Failed to retrieve DB connection info.');

        const db2Result = await testConnection2();
        if (!db2Result) throw new Error('Failed to perform test connection.');

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

        const responseTime = logAverageResponseTimes()

        function transformToExpectedStructure(data: Record<'good' | 'average' | 'tooLong', RequestData[]>): RequestPerformanceData {
            return {
                good: data.good.map(r => ({length: parseFloat(r.responseTimeMs)})),
                average: data.average.map(r => ({length: parseFloat(r.responseTimeMs)})),
                tooLong: data.tooLong.map(r => ({length: parseFloat(r.responseTimeMs)})),
            };
        }

        const transformedRequestPerformanceData = transformToExpectedStructure(requestPerformanceData);
        const percentageRequestQuality = calculateRequestPercentage(transformedRequestPerformanceData);
        const goodRequestBar = createProgressBar(percentageRequestQuality.goodPercentage);
        const averageRequestBar = createProgressBar(percentageRequestQuality.averagePercentage);
        const tooLongRequestBar = createProgressBar(percentageRequestQuality.tooLongPercentage);
        const goodHits = formatRequestHits(requestPerformanceData.good, "GET", "🟢");
        const averageHits = formatRequestHits(requestPerformanceData.average, "GET", "🟠");
        const tooLongHits = formatRequestHits(requestPerformanceData.tooLong, "GET", "🔴");
        const postGoodHit = formatRequestHits(requestPerformanceData.good, "POST", "🟢")
        const postAverageHit = formatRequestHits(requestPerformanceData.average, "POST", "🟠")
        const postToolongHit = formatRequestHits(requestPerformanceData.tooLong, "POST", "🔴")
        const putGoodHit = formatRequestHits(requestPerformanceData.good, "PUT", "🟢")
        const putAverageHit = formatRequestHits(requestPerformanceData.average, "PUT", "🟠")
        const putToolongHit = formatRequestHits(requestPerformanceData.tooLong, "PUT", "🔴")


        let title = "DASHBOARD API-CN5 PERF"
        let desc = {refresh: dayjs(Date.now()).format('DD-MM-YYYY - HH:mm:ss'), uptime: process.uptime()}


        const data = {
            title,
            desc,
            percentageRequestQuality,
            responseTime,
            monitoringData,
            activeQueries,
            longestQueryTime,

        }
        res.status(200).json({data})


    } catch (error: unknown) {
        if (error instanceof Error) {
            logError('Erreur lors du monitoring des performances:' + error.message);
            res.status(500).json({error: error.message});
        } else {
            // Gérer le cas où error n'est pas une instance de Error, si nécessaire
            res.status(500).json({error: 'Une erreur inconnue est survenue'});
        }
    }


})


export default router