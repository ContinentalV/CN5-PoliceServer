import os from 'os';
import process from 'process';
import axios from 'axios';
import dayjs from 'dayjs';
import { Pool } from 'mysql2/promise';
import { createProgressBar } from "../utils/utilFn";
import { metrics } from '../utils/constExport';
import duration from 'dayjs/plugin/duration';
 import packageJson from "../../package.json"
dayjs.extend(duration);
import {  mainLogger} from "../syslog/logger";
import {EmbedField, } from "../interface";

function getDependencyVersions(): Record<string, string> {
    const dependencies: Record<string, string> = packageJson.dependencies;
    const mainDependencies: string[] = ['express', 'axios', 'mysql2', 'sequelize', 'cors', 'winston']; // Les dépendances principales que vous souhaitez afficher
    return mainDependencies.reduce<Record<string, string>>((acc, key) => {
        if(dependencies[key]) { // Assurez-vous que la dépendance existe avant de l'ajouter
            acc[key] = dependencies[key];
        }
        return acc;
    }, {});
}

async function getSystemLoad(): Promise<number> {
    const loads = os.loadavg();
    const cpuCount = os.cpus().length;
    const averageLoad = loads[0] / cpuCount; // Prendre la moyenne sur 1 minute divisée par le nombre de CPU.
    return averageLoad * 100; // Convertir en pourcentage.
}

async function collectDBStatus(pool: Pool): Promise<{ activeQueries: number; longestQueryTime: number; tableCount: number }> {


    return { activeQueries: 0, longestQueryTime: 0, tableCount: 0 };
}
async function collectMemoryUsage(){
    const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024; // Convertir en MB
    const totalMemory = os.totalmem() / 1024 / 1024; // Convertir en MB
    return { used: usedMemory, total: totalMemory };
}
function calculateAverageResponseTime(): number {
    if (metrics.responseTimes.length === 0) return 0;
    return metrics.responseTimes.reduce((acc, cur) => acc + cur, 0) / metrics.responseTimes.length;
}

export async function monitorPerformance2(pool: Pool, messageId: string, webhookUrl: string): Promise<void> {
    const { used, total } = await collectMemoryUsage();
    const averageLoad = await getSystemLoad();
    const cpuLoadBar = createProgressBar(parseInt(averageLoad.toFixed(2)));
    const dbStatus = await collectDBStatus(pool);
    const lastRefresh = `Last Refresh: ${dayjs().format('DD-MM-YYYY - HH:mm:ss')}`;
    const startedAt = "Started at: " +  dayjs().subtract(process.uptime(), 'second').format('DD-MM-YYYY - HH:mm:ss');
    const state = `State: ${process.uptime() > 0 ? 'Actif' : 'Inactif'}`;
    const bytes = metrics.bandwidthUsage.sent;
    const kilobytes = bytes / 1024;
    const megabytes = kilobytes / 1024;
    const gigabytes = megabytes / 1024;
    const maxBandwidthGB = 32 * 1024; // Convertissez 32 TB en GB
    const bandwidthUsagePercentage =((gigabytes / maxBandwidthGB) * 100) ;
    const bandwidthProgressBar = createProgressBar (bandwidthUsagePercentage) ;
    const totalErrors = metrics.statusCodes.clientError + metrics.statusCodes.serverError;
    const errorRate = (metrics.totalRequests > 0) ? (totalErrors / metrics.totalRequests) * 100 : 0;
    const errorRateBar = createProgressBar(errorRate);
    const maxActiveRequests = 100;
    const activeRequestsPercentage = ((metrics?.activeRequests || 0 )/ maxActiveRequests) * 100;
    const activeRequestsProgressBar = createProgressBar(activeRequestsPercentage);
    const dependencyVersions = getDependencyVersions();

    const topEndpoints = Object.entries(metrics.endpointUsage)
        .sort((a, b) => b[1] - a[1]) // Trie par nombre de requêtes décroissant
        .slice(0, 5) // Prendre le top 5 par exemple
        .map(([endpoint, count]) => `${endpoint}: ${count}`) // Formate pour l'affichage
        .join('\n');
    const dependencyVersionFields = Object.entries(dependencyVersions)
        .map(([key, version]) => `${key}: ${version}`)
        .join('\n');
    function formatUptime(uptime:number) {
        let seconds = Math.floor(uptime);
        let minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;
        let hours = Math.floor(minutes / 60);
        minutes = minutes % 60;
        return `${hours}h ${minutes}m ${seconds}s`;
    }
    const uptimeDuration = formatUptime(process.uptime());
    const embedFields: EmbedField[] = [

        { name: "💾 Memory Usage", value: `\`\`${used.toFixed(2)} MB / ${total.toFixed(2)} MB \`\` `, inline: true },
        { name: "📈 Request", value: ` 
\`\`📈 Total request done:\`\`  \`\`${metrics.totalRequests.toString()} requêtes\`\`
\`\`📈 Requêtes (Dernière Heure) \`\`  \`\`${metrics.requestCounts.hourly[new Date().getHours()]} requêtes\`\`
\`\`🕑 Average Response Time:\`\` \`\`${calculateAverageResponseTime().toFixed(2)} ms\`\`  
\`\`🌐 Api FiveM:\`\` \`\`${metrics.externalServices.fiveM.isAvailable
? `|✅|Disponible - Temps de réponse: ${metrics.externalServices.fiveM.responseTime.toFixed(2)} ms`
: `|❌|Indisponible`}\`\`
${metrics.averageResponseTime.toFixed(2)} ms `, inline: false },
        { name: "🌐  Http Count", value: `
        > - **🚦 HTTP Success:** \`\`${metrics.statusCodes.success.toString()}\`\`
        > - **🚦 HTTP Client Errors:** \`\`${metrics.statusCodes.clientError.toString()}\`\` 
        > - **🚦 HTTP Server Errors:** \`\`${metrics.statusCodes.serverError.toString()}\`\`\n 
          `, inline:true},
        { name: "", value: ``, inline: true },
        { name: "📊 Database", value: `\`\`Active Queries:\`\` \`\`${dbStatus.activeQueries}\`\` \n\`\`Longest Query Time:\`\` \`\`${dbStatus.longestQueryTime}s\`\` \n\`\`Table Count:\`\`  \`\`${dbStatus.tableCount}\`\``, inline: true },
        { name: "📶 Bandwidth Usage (Sent)", value: `
        \`\`${kilobytes.toLocaleString()} KB\`\`\n` +
        `\`\`${megabytes.toLocaleString(undefined, { maximumFractionDigits: 2 })} MB\`\`\n` +
        `\`\`${gigabytes.toLocaleString(undefined, { maximumFractionDigits: 2 })} GB\`\`\n `,  inline: true },
        { name: "📶 GRAPH", value: `
       \`\`♨️Cpu load:\`\`  ${cpuLoadBar}
       \`\`📍BandWith:\`\`   ${bandwidthProgressBar}
       \`\`❌ErrorRate:\`\` ${errorRateBar} 
       \`\`🔥Active Req:\`\`${activeRequestsProgressBar} 
        `, inline: true },
        { name: "🔝 Endpoints les plus demandés", value: `\`\`\`${topEndpoints}\`\`\``, inline: false },
        { name: "📦 Versions des dépendances",   value: '```\n' + dependencyVersionFields + '\n```', inline: false},
    ];
    const embed = {
        title: "DASHBOARD API-CN5 PERF",
        description: `
        ===========================
        \`\`${lastRefresh}\`\`\n\`\`${startedAt}\`\`\n \`\`Api police demarrer depuis: ${uptimeDuration}\`\`\n \`\`${state ? "State: 🟢🟢" : "State: 🔴🔴"}\`\`
        ===========================
        🌐 Environnement d'exécution:  \`\`${metrics.environment?.toUpperCase()} \`\`
        ===========================
        🔖 Version de l'API        : \`\`${process.env.API_VERSION}\`\`
         ===========================`,
        color: 0xFFFFFF, // La couleur de votre choix.
        fields: embedFields,
        timestamp: new Date().toISOString(),
    };
    try {
        await updateEmbedMessage(messageId, embed, webhookUrl);
    } catch (error) {
       mainLogger.error(`Erreur lors de la mise à jour de l'embed: ${error}`);
    }
}

async function updateEmbedMessage(messageId: string, embed: any, webhook: string): Promise<void> {
    try {
        await axios.patch(`${webhook}/messages/${messageId}`, { embeds: [embed] });
    } catch (error) {
       throw error
    }
}
