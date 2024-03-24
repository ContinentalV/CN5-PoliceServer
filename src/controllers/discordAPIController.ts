// controllers/discordAPIController.ts
import {NextFunction, Request, Response} from 'express';
import axios from 'axios';
import {replaceNumberInAgentName} from "../utils/utilFn";

import {errorLogger,  mainLogger} from "../syslog/logger";
import {v4 as uuidv4} from "uuid";

const botToken = process.env.BOT_TOKEN; // Remplacez YOUR_BOT_TOKEN par le token de votre bot Discord
const baseUrl = 'https://discord.com/api/';

async function callDiscordAPI(endpoint: string, method: string, body?: any) {
    const url = baseUrl + endpoint;
    const headers = {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json'
    };
    try {
        const response = await axios({
            method,
            url,
            headers,
            data: body
        });

        return response;
    } catch (error) {
        const errorId = uuidv4();
        if(axios.isAxiosError(error)){
            const status = error.response?.status;
            const statusText = error.response?.statusText;
            errorLogger.error({ message: error.message, status, statusText, errorId });
            throw new Error(`|❌| Failed to call Discord API`);
        }

    }
}

export async function renameAgentWithReplicationOnDiscord(req: Request, res: Response, next: NextFunction) {

    const {newName, companyId, discordId} = req.body;
    try {
        const response = await callDiscordAPI(`guilds/${companyId}/members/${discordId}`, 'PATCH', {nick: newName})
        const errorId = uuidv4();
        if (response && response.status === 204) {
            mainLogger.info("|✅| Membre renommer avec succès")
            res.status(200).json({message: `|✅| Membre renommé avec succès`});
        } else {
            errorLogger.error({ message: "|❌| Membre renommer sans succès",  errorId });
            res.status(500).json({message:`|❌| Membre renommer sans succès`});
        }
    } catch (error:any) {
        const errorId = uuidv4();
        errorLogger.error({ message: error.message, errorId });
        res.status(500).json({ message: "|❌| Erreur interne du serveur", errorId });
    }

}

export async function replaceMatriculeInNameDiscord(req: Request, res: Response, next: NextFunction) {
    const {discordId, oldUserName, mat, companyId} = req.body;
    const errorId = uuidv4();


    const newUsername = replaceNumberInAgentName(oldUserName, mat)

    try {
        // Appel de l'API Discord pour renommer le membre
        const response = await callDiscordAPI(`guilds/${companyId}/members/${discordId}`, 'PATCH', {nick: newUsername});
        if (response && response.status === 204 ) {
            mainLogger.info(`|✅| Membre ${discordId}  renommer avec succès(matricule commands)`)
            res.status(200).json({message: `|✅| Membre ${discordId} renommé avec succès en ${newUsername}`});
        } else {
            errorLogger.error(`|❌|Échec du renommage du membre: - ${discordId}`, errorId)
            res.status(500).json({message: `Échec du renommage du membre`});
        }
    } catch (error:any) {
        const errorId = uuidv4();
        errorLogger.error({ message: error.message, errorId });
        res.status(500).json({ message: "|❌| Erreur interne du serveur", errorId });
    }
}

export async function modifyRoleForMember(req: Request, res: Response, next: NextFunction) {
    const {discordId, roleId, action, companyId} = req.body;

    try {

        if (action !== 'add' && action !== 'remove') {
            throw new Error('L\'action spécifiée n\'est pas valide. Utilisez "add" ou "remove".');
        }
        const method = action === 'add' ? 'PUT' : 'DELETE';
        const response = await callDiscordAPI(`guilds/${companyId}/members/${discordId}/roles/${roleId}`, method);
        if (response && response.status === 204) {
            const actionMessage = action === 'add' ? 'ajouté' : 'retiré';
            mainLogger.info(`|✅| Rôle: ${roleId} -  ${actionMessage} -> avec succès du/de la membre ${discordId}`)
            res.status(200).json({message: `|✅| Rôle: ${roleId} -  ${actionMessage} -> avec succès du/de la membre ${discordId}`});
        } else {
            mainLogger.warn("|❌| Erreur interne du serveur -- no response")
            res.status(500).json({message: `|❌| Erreur interne du serveur -- no response`});
        }
    } catch (error:any) {
        const errorId = uuidv4();
        errorLogger.error({ message: error.message, errorId });
        res.status(500).json({ message: "|❌| Erreur interne du serveur", errorId });
    }
}

export async function sendEmbedMessage(req: Request, res: Response, next: NextFunction) {
    const {guildId, channelId, title, description, fields, color} = req.body; // Obtenez les données du message embed à partir du corps de la requête

    try {
        const embed = {
            title,
            description,
            fields,
            color
        };

        const payload = {
            embed,
            content: '' // You can add additional content here if needed
        };
        const response = await callDiscordAPI(`channels/${channelId}/messages`, 'POST', payload);

        if (response && response.status === 200) {
            res.status(200).json({message: '|✅| Message embed envoyé avec succès'});
        } else {
            mainLogger.info(`|❌| Échec de l'envoi du message embed -- no response.`)
           res.status(500).json({message:`|❌| Échec de l'envoi du message embed.`});
        }
    } catch (error:any) {
        const errorId = uuidv4();
        errorLogger.error({ message: error.message, errorId });
        res.status(500).json({ message: "|❌| Erreur interne du serveur", errorId });
    }
}


