"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProgressBar = exports.calculateRequestPercentage = exports.formatRequestHits = exports.formatUptime = exports.updateEmbedMessage = exports.sendEmbedToDiscord = exports.replaceNumberInAgentName = exports.fetchSafe = exports.headers = void 0;
const axios_1 = __importStar(require("axios"));
const DISCORD_WEBHOOK_URL_API = process.env.DISCORD_WEBHOOK_URL_API;
exports.headers = {
    "Host": "servers-frontend.fivem.net",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:100.0) Gecko/20100101 Firefox/100.0",
    "Accept": "application/json, text/plain, */*",
    "Origin": "https://servers.fivem.net/",
    "DNT": "1",
    "Connection": "keep-alive",
    "Alt-Used": "servers-frontend.fivem.net",
    "Sec-Fetch-Dest": "Document",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "none",
    "Pragma": "no-cache",
    "Upgrade-Insecure-Requests": "1",
    "Cache-Control": "no-cache",
    "TE": "trailers",
};
const fetchSafe = async (url, options = null) => {
    try {
        const response = await axios_1.default.get(url, options);
        return { success: true, data: response.data };
    }
    catch (e) {
        if (e instanceof axios_1.AxiosError) {
            return { success: false, error: e.message };
        }
        else if (e instanceof Error) {
            return { success: false, error: e.message };
        }
        else {
            return { success: false, error: "Une erreur est survenue" };
        }
    }
};
exports.fetchSafe = fetchSafe;
function replaceNumberInAgentName(agentName, newNumber) {
    // Utilisation d'une expression régulière pour rechercher et remplacer le nombre dans le nom de l'agent
    const regex = /\d+/;
    console.log(agentName);
    // Remplacement du nombre dans le nom de l'agent par le nouveau nombre
    const newName = agentName.replace(regex, newNumber.toString());
    return newName;
}
exports.replaceNumberInAgentName = replaceNumberInAgentName;
async function sendEmbedToDiscord(title, desc, fields, color, webhook) {
    const embed = {
        title: title,
        description: desc,
        color: color,
        fields: fields,
        timestamp: new Date().toISOString()
    };
    try {
        const response = await axios_1.default.post(webhook, {
            embeds: [embed]
        });
        return response.data.id;
    }
    catch (error) {
        console.error(`Erreur lors de l'envoi de l'embed au webhook Discord: ${error}`);
    }
}
exports.sendEmbedToDiscord = sendEmbedToDiscord;
async function updateEmbedMessage(messageId, title, desc, fields, color, webhook) {
    const embed = {
        title: title,
        description: desc,
        color: color,
        fields: fields,
        timestamp: new Date().toISOString()
    };
    try {
        await axios_1.default.patch(`${webhook}/messages/${messageId}`, {
            embeds: [embed]
        });
    }
    catch (error) {
        console.error(`Erreur lors de la mise à jour de l'embed: ${error}`);
    }
}
exports.updateEmbedMessage = updateEmbedMessage;
function formatUptime(uptimeInSeconds) {
    const secondsPerMinute = 60;
    const secondsPerHour = secondsPerMinute * 60;
    const secondsPerDay = secondsPerHour * 24;
    const days = Math.floor(uptimeInSeconds / secondsPerDay);
    const hours = Math.floor((uptimeInSeconds % secondsPerDay) / secondsPerHour);
    const minutes = Math.floor((uptimeInSeconds % secondsPerHour) / secondsPerMinute);
    const seconds = Math.floor(uptimeInSeconds % secondsPerMinute);
    let formattedUptime = "";
    if (days > 0) {
        formattedUptime += `${days} jour${days > 1 ? "s" : ""} `;
    }
    if (hours > 0) {
        formattedUptime += `${hours} heure${hours > 1 ? "s" : ""} `;
    }
    if (minutes > 0) {
        formattedUptime += `${minutes} minute${minutes > 1 ? "s" : ""} `;
    }
    formattedUptime += `${seconds} seconde${seconds > 1 ? "s" : ""}`;
    return formattedUptime;
}
exports.formatUptime = formatUptime;
function formatRequestHits(requestData, httpMethod, colorStatus) {
    const hitsByPath = requestData
        .filter((req) => req.method === httpMethod)
        .reduce((acc, { path }) => {
        acc[path] = (acc[path] || 0) + 1;
        return acc;
    }, {});
    const hitsString = Object.entries(hitsByPath)
        .map(([path, count]) => `${colorStatus}|\`${httpMethod} ${path}\` - ${count}`)
        .join("\n");
    return hitsString;
}
exports.formatRequestHits = formatRequestHits;
function calculateRequestPercentage(requestPerformanceData) {
    const totalRequests = requestPerformanceData.good.length + requestPerformanceData.average.length + requestPerformanceData.tooLong.length;
    const goodPercentage = ((requestPerformanceData.good.length / totalRequests) * 100).toFixed(2);
    const averagePercentage = ((requestPerformanceData.average.length / totalRequests) * 100).toFixed(2);
    const tooLongPercentage = ((requestPerformanceData.tooLong.length / totalRequests) * 100).toFixed(2);
    return { totalRequests, goodPercentage, averagePercentage, tooLongPercentage };
}
exports.calculateRequestPercentage = calculateRequestPercentage;
function createProgressBar(percentage, barLength = 10) {
    if (isNaN(parseInt(percentage)))
        return "[░░░░░░░░░░░░]";
    const filledBarLength = Math.round((parseInt(percentage) / 100) * barLength);
    const emptyBarLength = barLength - filledBarLength;
    const filledBar = '█'.repeat(filledBarLength);
    const emptyBar = '░'.repeat(emptyBarLength);
    return `[${filledBar}${emptyBar}] | \`${percentage}%\``;
}
exports.createProgressBar = createProgressBar;
