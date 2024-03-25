import os from 'os';
import {RowDataPacket} from 'mysql2/promise';

import {logError} from '../utils/functions';
import {getConnectionInfo, testConnection} from "./dbConfig";
import {logAverageResponseTimes, requestPerformanceData} from "../midlleware/responseTimeTracker";
import {calculateRequestPercentage, createProgressBar, formatRequestHits, updateEmbedMessage} from "../utils/utilFn";
import dayjs from "dayjs";

export interface RequestPerformanceData {
    good: { length: number }[]; // Array of objects with a 'length' property
    average: { length: number }[];
    tooLong: { length: number }[];
}

interface RequestData {
    path: string;           // Le chemin de la requête
    method: string;         // La méthode HTTP utilisée pour la requête, par exemple GET ou POST
    status: number;         // Le code de statut HTTP de la réponse
    responseTimeMs: string; // Le temps de réponse pour la requête en millisecondes, sous forme de chaîne de caractères
    category: 'good' | 'average' | 'tooLong'; // Une catégorisation de la performance de la requête
    timestamp: string;      // Un horodatage pour la requête
}


export const monitorPerformance = async (): Promise<void> => {
    let lastMsgId: any = "1198000871179571261";
    try {

        const usedMemory: number = process.memoryUsage().heapUsed / 1024 / 1024;
        const totalMemory: number = os.totalmem() / 1024 / 1024;
        const memoryUsage = {
            memUse: `${Math.round(usedMemory * 100) / 100}`,
            Total: `${Math.round(totalMemory * 100) / 100} `
        };
        // Métriques CPU
        const cpus = os.cpus();
        const cpuLoad: string[] = cpus.map((cpu, index) => `${index}: ${(cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.irq) / cpu.times.idle}`);
        const dbResult = await getConnectionInfo();
        if (!dbResult) {
            throw new Error('dbResult is undefined');
        }
        const db2 = await testConnection()
        const dbProcesses: RowDataPacket[] = dbResult.process.filter((p: RowDataPacket) => p.Command !== 'Daemon' && p.Command !== "Sleep" && p.Time !== null);
        const activeQueries: number = dbProcesses.length;
        const longestQueryTime: number = Math.max(...dbProcesses.map(p => Number(p.Time)));
        const monitoringData = {
            memory: memoryUsage,
            cpu: cpuLoad.join("\n"),
            db: {
                process: dbProcesses,
                activeConexion: dbResult.activeConexion // Assurez-vous que cette propriété existe et est correctement typée
            }
        };

        const responseTime = logAverageResponseTimes()


        function transformToExpectedStructure(data: Record<'good' | 'average' | 'tooLong', RequestData[]>): RequestPerformanceData {
            return {
                good: data.good.map(r => ({length: parseFloat(r.responseTimeMs)})),
                average: data.average.map(r => ({length: parseFloat(r.responseTimeMs)})),
                tooLong: data.tooLong.map(r => ({length: parseFloat(r.responseTimeMs)})),
            };
        }

// Ensuite, utilisez cette fonction transformée pour appeler calculateRequestPercentage
        const transformedRequestPerformanceData = transformToExpectedStructure(requestPerformanceData);
        const percentageRequestQuality = calculateRequestPercentage(transformedRequestPerformanceData);

// Maintenant, vous pouvez continuer avec le reste de votre code comme avant.
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


        let titleMemory = "DASHBOARD API-CN5 PERF"
        let descMemory = `Last Refresh: \`\`${dayjs(Date.now()).format('DD-MM-YYYY - HH:mm:ss')} \`\`  `
        let fieldsMemory = [
            {
                name: "💹 MEMORY",
                value: `- \`\`Memoire utilisé: ${monitoringData.memory.memUse}mb\`\` \n- \`\`totalMem: ${monitoringData.memory.Total}mb\`\``,
                inline: true
            },
            {name: "⚛️ CPU DATA", value: `- \`\`nombre de cpu: ${cpus.length}\`\``, inline: true},
            {
                name: "♻️ REQUEST QUALITY",
                value: `- \`\`🟩 request:  ${requestPerformanceData.good.length}\`\`\n- \`\`🟨 medium request: ${requestPerformanceData.average.length}\`\`\n- \`\`🟥 critical request: ${requestPerformanceData.tooLong.length}\`\``,
                inline: true
            },
            {
                name: "🕗 REQUEST AVERAGE TIME RESPOND",
                value: `- \`\`🟩:  ${responseTime.goodAverage} ms\`\`\n- \`\`🟨 : ${responseTime.averageAverage} ms\`\` \n- \`\`🟥 : ${responseTime.tooLongAverage} ms\`\``,
                inline: true
            },
            {
                name: "DB CONNECTION INFO",
                value: `- \`As: ${db2.connection.config.user}\`\n- \`Host: ${db2.connection.config.host}\`\n- \`Active queries: ${activeQueries}\` \n- \`Longest query time: ${longestQueryTime} seconds\`\n- \`AllConnexion: ${monitoringData.db.activeConexion}\` `,
                inline: true
            },
            {
                name: "📈 REQUEST GET HIT",
                value: ` ${goodHits.length > 0 ? `${goodHits}` : ""} \n ${averageHits.length > 0 ? `${averageHits}` : ""}\n ${tooLongHits.length > 0 ? `${tooLongHits}` : ""} `,
                inline: false
            },
            {
                name: "📈 REQUEST POST/PUT HIT",
                value: ` ${postGoodHit.length > 0 ? `${postGoodHit}` : ""} \n ${postAverageHit.length > 0 ? `${postAverageHit}` : ""}\n ${postToolongHit.length > 0 ? `${putAverageHit}` : ""}\n ${putGoodHit.length > 0 ? `${putGoodHit}` : ""} \n ${putAverageHit.length > 0 ? `${putAverageHit}` : ""}\n ${putToolongHit.length > 0 ? `${putToolongHit}` : ""} `,
                inline: true
            },
            {
                name: "PERCENTAGE QUALITY",
                value: `- \`🟢\`${goodRequestBar}\n- \`🟠\`${averageRequestBar}\n- \`🔴\`${tooLongRequestBar} `,
                inline: true
            },

        ]

        // Assurez-vous que process.env.DISCORD_WEBHOOK_URL_API n'est pas undefined avant de l'utiliser
        const webhookUrl = process.env.DISCORD_WEBHOOK_URL_API;
        if (typeof webhookUrl === 'string') {
            // Utilisez `webhookUrl` car vous avez confirmé qu'il s'agit d'une chaîne de caractères
            await updateEmbedMessage(lastMsgId, titleMemory, descMemory, fieldsMemory, 0xFFFFFF, webhookUrl);
        } else {
            // Gérez le cas où `webhookUrl` est undefined
            logError('La variable d\'environnement DISCORD_WEBHOOK_URL_API n\'est pas définie.');
        }


    } catch (error) {
        if (error instanceof Error) {
            logError('Erreur lors du monitoring des performances: ' + error.message);
        } else {
            // Gérez le cas où l'erreur n'est pas une instance d'Error
            logError('Erreur lors du monitoring des performances et l\'erreur n\'est pas de type Error');
        }
    }
};


