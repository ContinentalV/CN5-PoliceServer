"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitorPerformance = void 0;
const os_1 = __importDefault(require("os"));
const functions_1 = require("../utils/functions");
const dbConfig_1 = require("./dbConfig");
const responseTimeTracker_1 = require("../midlleware/responseTimeTracker");
const utilFn_1 = require("../utils/utilFn");
const dayjs_1 = __importDefault(require("dayjs"));
const monitorPerformance = async () => {
    let lastMsgId = "1198000871179571261";
    try {
        const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024;
        const totalMemory = os_1.default.totalmem() / 1024 / 1024;
        const memoryUsage = {
            memUse: `${Math.round(usedMemory * 100) / 100}`,
            Total: `${Math.round(totalMemory * 100) / 100} `
        };
        // Métriques CPU
        const cpus = os_1.default.cpus();
        const cpuLoad = cpus.map((cpu, index) => `${index}: ${(cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.irq) / cpu.times.idle}`);
        const dbResult = await (0, dbConfig_1.getConnectionInfo)();
        if (!dbResult) {
            throw new Error('dbResult is undefined');
        }
        const db2 = await (0, dbConfig_1.testConnection)();
        //logDb(db2.connection.config.host + ":" + db2.connection.config.port + " as " + [db2.connection.config.user])
        const dbProcesses = dbResult.process.filter((p) => p.Command !== 'Daemon' && p.Command !== "Sleep" && p.Time !== null);
        const activeQueries = dbProcesses.length;
        const longestQueryTime = Math.max(...dbProcesses.map(p => Number(p.Time)));
        //  console.log(...dbProcesses.map(p => p.Time + " " + p.Command + " " + p.Info))
        const monitoringData = {
            memory: memoryUsage,
            cpu: cpuLoad.join("\n"),
            db: {
                process: dbProcesses,
                activeConexion: dbResult.activeConexion // Assurez-vous que cette propriété existe et est correctement typée
            }
        };
        const responseTime = (0, responseTimeTracker_1.logAverageResponseTimes)();
        function transformToExpectedStructure(data) {
            return {
                good: data.good.map(r => ({ length: parseFloat(r.responseTimeMs) })),
                average: data.average.map(r => ({ length: parseFloat(r.responseTimeMs) })),
                tooLong: data.tooLong.map(r => ({ length: parseFloat(r.responseTimeMs) })),
            };
        }
        // Ensuite, utilisez cette fonction transformée pour appeler calculateRequestPercentage
        const transformedRequestPerformanceData = transformToExpectedStructure(responseTimeTracker_1.requestPerformanceData);
        const percentageRequestQuality = (0, utilFn_1.calculateRequestPercentage)(transformedRequestPerformanceData);
        // Maintenant, vous pouvez continuer avec le reste de votre code comme avant.
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
        let titleMemory = "DASHBOARD API-CN5 PERF";
        let descMemory = `Last Refresh: \`\`${(0, dayjs_1.default)(Date.now()).format('DD-MM-YYYY - HH:mm:ss')} \`\`  `;
        let fieldsMemory = [
            {
                name: "💹 MEMORY",
                value: `- \`\`Memoire utilisé: ${monitoringData.memory.memUse}mb\`\` \n- \`\`totalMem: ${monitoringData.memory.Total}mb\`\``,
                inline: true
            },
            { name: "⚛️ CPU DATA", value: `- \`\`nombre de cpu: ${cpus.length}\`\``, inline: true },
            {
                name: "♻️ REQUEST QUALITY",
                value: `- \`\`🟩 request:  ${responseTimeTracker_1.requestPerformanceData.good.length}\`\`\n- \`\`🟨 medium request: ${responseTimeTracker_1.requestPerformanceData.average.length}\`\`\n- \`\`🟥 critical request: ${responseTimeTracker_1.requestPerformanceData.tooLong.length}\`\``,
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
        ];
        // Assurez-vous que process.env.DISCORD_WEBHOOK_URL_API n'est pas undefined avant de l'utiliser
        const webhookUrl = process.env.DISCORD_WEBHOOK_URL_API;
        if (typeof webhookUrl === 'string') {
            // Utilisez `webhookUrl` car vous avez confirmé qu'il s'agit d'une chaîne de caractères
            await (0, utilFn_1.updateEmbedMessage)(lastMsgId, titleMemory, descMemory, fieldsMemory, 0xFFFFFF, webhookUrl);
        }
        else {
            // Gérez le cas où `webhookUrl` est undefined
            (0, functions_1.logError)('La variable d\'environnement DISCORD_WEBHOOK_URL_API n\'est pas définie.');
        }
    }
    catch (error) {
        if (error instanceof Error) {
            (0, functions_1.logError)('Erreur lors du monitoring des performances: ' + error.message);
        }
        else {
            // Gérez le cas où l'erreur n'est pas une instance d'Error
            (0, functions_1.logError)('Erreur lors du monitoring des performances et l\'erreur n\'est pas de type Error');
        }
    }
};
exports.monitorPerformance = monitorPerformance;
