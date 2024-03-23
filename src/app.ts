import express, {Request, Response} from 'express';
import timeout from 'connect-timeout';
import memberRoutes from "./routes/memberRoutes";
import ServerRoutes from "./routes/serverRoutes";
import StatsRoutes from "./routes/statsRoutes";
import serviceRoutes from "./routes/serviceRoutes";
import profileRoutes from "./routes/profileRoutes";
import {errorHandler} from './midlleware/errorMiddleware';
import {responseTimeTracker} from "./midlleware/responseTimeTracker";
import {formatUptime, updateEmbedMessage} from "./utils/utilFn";
import dayjs from "dayjs";
import statdataRoutes from "./routes/statdataRoutes";
import morgan, {TokenIndexer } from "morgan";
import discordAPIRoutes from "./routes/discordAPIRoutes";
import authRoute from "./routes/authRoute";
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import roleServeurController from "./controllers/roleServeurController";
import gradesMemberRoutes from "./routes/gradesMemberRoutes";
import {logger} from "./syslog/logger";
import {networkLoggerMiddleware} from "./midlleware/networkMiddleware";
import chalk from "chalk";
import path from "path";
import fs from "fs";


dotenv.config()
//TODO Deplacer la route avec son propre controlleur etc...
//TODO FIXE CRITICAL DONT SHOW IN DASH API WEBHOOK
const messageId = "1198267464153301043"
const app = express();
let existingFields = [];
let lastUpdate = null
let botOn = false



// Configuration du format de log Morgan pour la console avec Chalk
const morganFormatConsole = (tokens:TokenIndexer<Request, Response>, req: Request, res: Response):string => {
    const http = chalk.bgHex('#00278b').whiteBright.bold('HTTP:');
    const method = chalk.bgHex('#b90000').whiteBright.bold(tokens.method(req, res));
    const url = chalk.hex('#a24e2a').bold(tokens.url(req, res));
    const arrow = chalk.hex('#ff793f')('→');
    const status = chalk.hex('#2ed573').bold(tokens.status(req, res));
    const responseTime = chalk.hex('#ccc917').bold(`${tokens['response-time'](req, res)}ms`);
    const date = chalk.bgHex('#0b0a0a').whiteBright(tokens.date(req, res, 'iso'));

    return `${date}|::|${http} ${method} ${url} ${arrow} ${status} ${responseTime} `;
};
const morganFormatFile = ':method :url :status :response-time ms - :date[iso]\n';
const morganStream = fs.createWriteStream(path.join(__dirname, '../logs/morgan.log'), { flags: 'a' });
app.use(morgan(morganFormatConsole));
app.use(morgan(morganFormatFile, { stream: morganStream }));
app.use(networkLoggerMiddleware);
app.use(responseTimeTracker);
app.use(express.json());
app.use(timeout('10s'));
app.use(cookieParser())
app.use('/auth', authRoute)
app.use('/discord', discordAPIRoutes);
app.use('/members', memberRoutes);
app.use('/servers', ServerRoutes);
app.use('/stats', StatsRoutes);
app.use('/service', serviceRoutes);
app.use('/profile', profileRoutes);
app.use("/perf", statdataRoutes)
app.use("/:serveurId", roleServeurController)
app.use("/roles/members", gradesMemberRoutes)

app.get('/error', (req, res) => {
    try {
        // Simuler une erreur
        throw new Error('Ceci est une erreur simulée.');

    } catch (error) {
        logger.error("La requête a été traitée avec succès.");
    }
    res.send('Erreur capturée et loguée.');
});


app.post("/health/bot", async (req, res, next) => {
    const dataHealth = req.body
    lastUpdate = Date.now()

    interface EventData {
        event: string;
        count: number;
    }

    let guildCommandRespond: EventData[] = []

    try {

        const event = (dataHealth.event.map((e: EventData) => `\`${e.event}\`:\`${e.count}\`  `).join('\n'))
        const title: string = "DASHBOARD BOT-CN5 PERF"
        let desc: string = `Last Refresh: \`\`${dayjs(Date.now()).format('DD-MM-YYYY - HH:mm:ss')} \`\`  `


        const f = [
            {
                name: "BOT",
                value: ` ${dataHealth.time.isReady ? `- Bot on:  \`🟢\`  ` : `- Bot on:  \`🔴\`  `}\n-  \`start since: ${formatUptime(dataHealth.time.uptime)}\``,
                inline: true
            },
            {
                name: "💹 MEMORY",
                value: `- \`\`Memoire utilisé: ${dataHealth.data.memory.memUse}mb\`\` \n- \`\`totalMem: ${dataHealth.data.memory.Total}mb\`\``,
                inline: true
            },
            {
                name: "EVENT DATA",
                value: `\`Nombre d'event\`:\`${dataHealth.event.length}\` \n ${event}  `,
                inline: false
            },


        ]
        updateGuildCommandStats(dataHealth.data.guildCommand);

        const commandFields = createCommandFields(guildCommandStats);
        const fieldsToUpdate = f.filter(field => !field.name.includes('COMMAND')).concat(commandFields);

        await updateEmbedMessage(messageId, title, desc, fieldsToUpdate, 0xFFFFFF, process.env.DISCORD_WEBHOOK_URL_BOT ?? "your-default-webhook-url")

        res.status(200).json({message: "Data updated"})
    } catch (e) {
        res.status(500).json({message: e})
    }
})


app.use(errorHandler);

export default app;

interface Command {
    command: string;
    count: number;
    averageTime: number;
}

interface CommandStats {
    [commandName: string]: {
        count: number;
        totalTime: number;
    };
}

interface Guild {
    name: string;
    commands: Command[];
}

interface GuildCommandStats {
    [guildName: string]: CommandStats;
}

const guildCommandStats: GuildCommandStats = {};

function updateGuildCommandStats(guildData: Guild[]): void {
    // Réinitialiser les statistiques pour tous les serveurs et toutes les commandes


    guildData.forEach((guild: Guild) => {
        const stats: CommandStats = {}; // Initialisez un objet pour conserver les stats de commandes
        guild.commands.forEach((command: Command) => {
            const commandName: string = command.command;
            // Utilisez l'objet stats pour accumuler les statistiques
            stats[commandName] = {
                count: command.count,
                totalTime: command.averageTime,
            };
        });
        // Assigner l'objet stats au nom du serveur dans l'objet principal guildCommandStats
        guildCommandStats[guild.name] = stats;
    });
}

// Fonction pour créer les champs de l'embed pour les statistiques de commande
function createCommandFields(guildCommandStats: GuildCommandStats): { name: string; value: string; inline: boolean }[] {
    return Object.entries(guildCommandStats).map(([guildName, commands]) => {
        const commandDetails = Object.entries(commands).map(([commandName, stats]) => {
            const averageTime = (stats.totalTime / stats.count).toFixed(2);
            return `\\[${commandName}\\] Time: ${averageTime}ms \\${stats.count}\\`;
        }).join("\n");

        return {
            name: `👮 ${guildName.toUpperCase()} COMMANDS`,
            value: commandDetails,
            inline: true
        };
    });
}