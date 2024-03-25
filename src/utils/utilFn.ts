import axios, {AxiosError} from 'axios';
import {metrics} from "./constExport";
import {RequestPerformanceData} from "../interface";

const DISCORD_WEBHOOK_URL_API = process.env.DISCORD_WEBHOOK_URL_API

interface EmbedField {
    name: string;
    value: string;
    inline?: boolean
}

interface RequestData {
    method: string;
    path: string;
}

export const headers = {
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
}
export const fetchSafe = async (url: string, options: any = null): Promise<{
    success: boolean;
    data?: any;
    error?: string
}> => {

    try {
        const response = await axios.get(url, options);
        return {success: true, data: response.data};
    } catch (e) {
        if (e instanceof AxiosError) {
            return {success: false, error: e.message};
        } else if (e instanceof Error) {
            return {success: false, error: e.message};
        } else {
            return {success: false, error: "Une erreur est survenue"};
        }

    }

};

export function replaceNumberInAgentName(agentName: string, newNumber: number): string {
    // Utilisation d'une expression régulière pour rechercher et remplacer le nombre dans le nom de l'agent
    const regex = /\d+/;
    console.log(agentName)
    // Remplacement du nombre dans le nom de l'agent par le nouveau nombre
    const newName = agentName.replace(regex, newNumber.toString());
    return newName;
}

export async function sendEmbedToDiscord(title: string, desc: string, fields: EmbedField[], color: number, webhook: string): Promise<string | void> {
    const embed = {
        title: title,
        description: desc,
        color: color,
        fields: fields,
        timestamp: new Date().toISOString()
    };

    try {
        const response = await axios.post(webhook, {
            embeds: [embed]
        });
        return response.data.id;
    } catch (error) {
        console.error(`Erreur lors de l'envoi de l'embed au webhook Discord: ${error}`);

    }
}


export async function updateEmbedMessage(messageId: string, title: string, desc: string, fields: EmbedField[], color: number, webhook: string): Promise<string | void> {
    const embed = {
        title: title,
        description: desc,
        color: color,
        fields: fields,
        timestamp: new Date().toISOString()
    };

    try {
        await axios.patch(`${webhook}/messages/${messageId}`, {
            embeds: [embed]
        });


    } catch (error) {
        console.error(`Erreur lors de la mise à jour de l'embed: ${error}`);
    }
}

export function formatUptime(uptimeInSeconds: number) {
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

export function formatRequestHits(requestData: RequestData[], httpMethod: string, colorStatus: string): string {
    const hitsByPath: { [key: string]: number } = requestData
        .filter((req: RequestData) => req.method === httpMethod)
        .reduce((acc: { [path: string]: number }, {path}) => {
            acc[path] = (acc[path] || 0) + 1;
            return acc;
        }, {});

    const hitsString: string = Object.entries(hitsByPath)
        .map(([path, count]: [string, number]) =>
            `${colorStatus}|\`${httpMethod} ${path}\` - ${count}`
        )
        .join("\n");
    return hitsString;
}




export function calculateRequestPercentage(requestPerformanceData: RequestPerformanceData): {
    totalRequests: number;
    goodPercentage: string;
    averagePercentage: string;
    tooLongPercentage: string
} {
    const totalRequests = requestPerformanceData.good.length + requestPerformanceData.average.length + requestPerformanceData.tooLong.length;
    const goodPercentage: string = ((requestPerformanceData.good.length / totalRequests) * 100).toFixed(2);
    const averagePercentage: string = ((requestPerformanceData.average.length / totalRequests) * 100).toFixed(2);
    const tooLongPercentage: string = ((requestPerformanceData.tooLong.length / totalRequests) * 100).toFixed(2);

    return {totalRequests, goodPercentage, averagePercentage, tooLongPercentage};
}


export function createProgressBar(percentage: number, barLength = 10): string {
    if ((percentage)) return "[░░░░░░░░░░░░]"
    const filledBarLength = Math.round((percentage) / 100) * barLength;
    const emptyBarLength = barLength - filledBarLength;
    const filledBar = '█'.repeat(filledBarLength);
    const emptyBar = '░'.repeat(emptyBarLength);
    return `[${filledBar}${emptyBar}] | \`${percentage}%\``;
}

async function checkFiveMAvailability() {
    try {
        const start = process.hrtime();
        await axios.get("https://servers-frontend.fivem.net/api/servers/single/eazypm", {
            headers
        });
        const diff = process.hrtime(start);
        const responseTime = diff[0] * 1e3 + diff[1] * 1e-6;

        metrics.externalServices.fiveM.isAvailable = true;
        metrics.externalServices.fiveM.responseTime = responseTime;
    } catch (error) {
        metrics.externalServices.fiveM.isAvailable = false;
        metrics.externalServices.fiveM.responseTime = 0;
        console.error("FiveM service is unavailable:", error);
    }
}


setInterval(checkFiveMAvailability, 600000);
  checkFiveMAvailability()
