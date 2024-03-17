"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const connect_timeout_1 = __importDefault(require("connect-timeout"));
const memberRoutes_1 = __importDefault(require("./routes/memberRoutes"));
const serverRoutes_1 = __importDefault(require("./routes/serverRoutes"));
const statsRoutes_1 = __importDefault(require("./routes/statsRoutes"));
const serviceRoutes_1 = __importDefault(require("./routes/serviceRoutes"));
const profileRoutes_1 = __importDefault(require("./routes/profileRoutes"));
const errorMiddleware_1 = require("./midlleware/errorMiddleware");
const responseTimeTracker_1 = require("./midlleware/responseTimeTracker");
const cors_1 = __importDefault(require("cors"));
const utilFn_1 = require("./utils/utilFn");
const dayjs_1 = __importDefault(require("dayjs"));
const statdataRoutes_1 = __importDefault(require("./routes/statdataRoutes"));
const morgan_1 = __importDefault(require("morgan"));
const discordAPIRoutes_1 = __importDefault(require("./routes/discordAPIRoutes"));
const authRoute_1 = __importDefault(require("./routes/authRoute"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const roleServeurController_1 = __importDefault(require("./controllers/roleServeurController"));
const gradesMemberRoutes_1 = __importDefault(require("./routes/gradesMemberRoutes"));
dotenv_1.default.config();
//TODO Deplacer la route avec son propre controlleur etc...
//TODO FIXE CRITICAL DONT SHOW IN DASH API WEBHOOK
const messageId = "1198267464153301043";
const app = (0, express_1.default)();
let existingFields = [];
let lastUpdate = null;
let botOn = false;
app.use((0, morgan_1.default)("dev"));
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use(responseTimeTracker_1.responseTimeTracker);
app.use(express_1.default.json());
app.use((0, connect_timeout_1.default)('10s'));
app.use((0, cookie_parser_1.default)());
app.use('/auth', authRoute_1.default);
app.use('/discord', discordAPIRoutes_1.default);
app.use('/members', memberRoutes_1.default);
app.use('/servers', serverRoutes_1.default);
app.use('/stats', statsRoutes_1.default);
app.use('/service', serviceRoutes_1.default);
app.use('/profile', profileRoutes_1.default);
app.use("/perf", statdataRoutes_1.default);
app.use("/:serveurId", roleServeurController_1.default);
app.use("/roles/members", gradesMemberRoutes_1.default);
app.post("/health/bot", async (req, res, next) => {
    const dataHealth = req.body;
    lastUpdate = Date.now();
    let guildCommandRespond = [];
    try {
        const event = (dataHealth.event.map((e) => `\`${e.event}\`:\`${e.count}\`  `).join('\n'));
        const title = "DASHBOARD BOT-CN5 PERF";
        let desc = `Last Refresh: \`\`${(0, dayjs_1.default)(Date.now()).format('DD-MM-YYYY - HH:mm:ss')} \`\`  `;
        const f = [
            {
                name: "BOT",
                value: ` ${dataHealth.time.isReady ? `- Bot on:  \`🟢\`  ` : `- Bot on:  \`🔴\`  `}\n-  \`start since: ${(0, utilFn_1.formatUptime)(dataHealth.time.uptime)}\``,
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
        ];
        updateGuildCommandStats(dataHealth.data.guildCommand);
        const commandFields = createCommandFields(guildCommandStats);
        const fieldsToUpdate = f.filter(field => !field.name.includes('COMMAND')).concat(commandFields);
        await (0, utilFn_1.updateEmbedMessage)(messageId, title, desc, fieldsToUpdate, 0xFFFFFF, process.env.DISCORD_WEBHOOK_URL_BOT ?? "your-default-webhook-url");
        res.status(200).json({ message: "Data updated" });
    }
    catch (e) {
        res.status(500).json({ message: e });
    }
});
app.use(errorMiddleware_1.errorHandler);
exports.default = app;
const guildCommandStats = {};
function updateGuildCommandStats(guildData) {
    // Réinitialiser les statistiques pour tous les serveurs et toutes les commandes
    guildData.forEach((guild) => {
        const stats = {}; // Initialisez un objet pour conserver les stats de commandes
        guild.commands.forEach((command) => {
            const commandName = command.command;
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
function createCommandFields(guildCommandStats) {
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
