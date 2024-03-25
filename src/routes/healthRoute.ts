import express from "express";
import dayjs from "dayjs";
import {formatUptime, updateEmbedMessage} from "../utils/utilFn";
import {Command, CommandStats, Guild, GuildCommandStats} from "../interface";

const router = express.Router()
let existingFields = [];
let lastUpdate = null
let botOn = false
const messageId = "1198267464153301043"
router.post('/', async (req, res, next) => {
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

export default router


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