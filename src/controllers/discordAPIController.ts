// controllers/discordAPIController.ts
import {NextFunction, Request, Response} from 'express';
import axios from 'axios';
import {replaceNumberInAgentName} from "../utils/utilFn";
import memberService from "../services/memberService";

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
    } catch (error: any) {
        throw new Error(`Failed to call Discord API: ${error.message}`);
    }
}

export async function renameAgentWithReplicationOnDiscord(req: Request, res: Response, next: NextFunction) {
    const {newName, companyId, discordId} = req.body;
    console.table(req.body)
    try {
        const response = await callDiscordAPI(`guilds/${companyId}/members/${discordId}`, 'PATCH', {nick: newName})
        console.log(response.status)
        if (response.status === 204) {
            res.status(200).json({message: `Membre renommé avec succès`});
        } else {
            throw new Error(`📛 Échec: ${response.statusText}`);
        }
    } catch (e) {
        console.log(e)
    }

}

export async function replaceMatriculeInNameDiscord(req: Request, res: Response, next: NextFunction) {
    const {discordId, oldUserName, mat, companyId} = req.body; // Obtenez le Discord ID et le nouveau nom d'utilisateur à partir du corps de la requête
    const newUsername = replaceNumberInAgentName(oldUserName, mat)

    try {
        // Appel de l'API Discord pour renommer le membre
        const response = await callDiscordAPI(`guilds/${companyId}/members/${discordId}`, 'PATCH', {nick: newUsername});
        console.log(response.status)

        // Vérification de la réponse de l'API Discord
        if (response.status === 204) {
            res.status(200).json({message: `Membre ${discordId} renommé avec succès en ${newUsername}`});
        } else {
            throw new Error(`Échec du renommage du membre: ${response.statusText}`);
        }
    } catch (error) {
        next(error instanceof Error ? error : new Error('Une erreur inconnue s\'est produite lors du renommage du membre'));
    }
}

export async function modifyRoleForMember(req: Request, res: Response, next: NextFunction) {
    const {discordId, roleId, action, companyId} = req.body; // Obtenez l'ID du membre Discord, l'ID du rôle et l'action à effectuer à partir du corps de la requête

    try {
        // Vérification de l'action demandée
        if (action !== 'add' && action !== 'remove') {
            throw new Error('L\'action spécifiée n\'est pas valide. Utilisez "add" ou "remove".');
        }

        // Appel de l'API Discord pour ajouter ou retirer un rôle au/depuis le membre
        const method = action === 'add' ? 'PUT' : 'DELETE';
        const response = await callDiscordAPI(`guilds/${companyId}/members/${discordId}/roles/${roleId}`, method);
        console.log("test" + "'  " + response.status)
        // Vérification de la réponse de l'API Discord
        if (response.status === 204) {

            const actionMessage = action === 'add' ? 'ajouté' : 'retiré';
            res.status(200).json({message: `Rôle ${roleId} ${actionMessage} avec succès du/de la membre ${discordId}`});
        } else {
            throw new Error(`Échec de l'opération : ${response.statusText}`);
        }
    } catch (error) {
        next(error instanceof Error ? error : new Error('Une erreur inconnue s\'est produite lors de l\'opération sur les rôles du/de la membre Discord'));
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

        // Appel de l'API Discord pour envoyer le message embed
        const response = await callDiscordAPI(`channels/${channelId}/messages`, 'POST', payload);

        // Vérification de la réponse de l'API Discord
        if (response.status === 200) {
            res.status(200).json({message: 'Message embed envoyé avec succès'});
        } else {
            throw new Error(`Échec de l'envoi du message embed : ${response.statusText}`);
        }
    } catch (error) {
        next(error instanceof Error ? error : new Error('Une erreur inconnue s\'est produite lors de l\'envoi du message embed'));
    }
}

export function initiateAuthenticationWithDiscord(req: Request, res: Response) {
    res.status(200).json({message: 'Rediriger l\'utilisateur vers la page d\'authentification Discord'});
}

export async function handleDiscordRedirect(req: Request, res: Response) {
    const {code} = req.query;
    console.log(req.query)
//
    try {
        const response = await axios.post('https://discord.com/api/oauth2/token', {
            client_id: process.env.DISCORD_CLIENT,
            client_secret: process.env.DISCORD_SECRET,
            grant_type: "authorization_code",
            code: code,
            redirect_uri: process.env.DISCORD_REDIRECT,
            scope: process.env.DISCORD_SCOPE,
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // Vérifiez si la requête POST a réussi
        if (response.status === 200) {
            const accessToken = response.data.access_token;
            const userResponse = await axios.get('https://discord.com/api/users/@me', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
            const discordId = userResponse.data.id
            console.log(discordId)

            const user = await memberService.getMemberById(discordId);
            console.log(user)
            if (user) {
                // Vérifiez les rôles de l'utilisateur et effectuez les actions appropriées
                if (user.etatMajor) {
                    console.log("true")
                    res.status(200).json({access_token: accessToken});
                }
            }

        } else {
            // Gérez les erreurs ici si la requête POST échoue
            res.status(response.status).json({error: "Échec de l'échange du code d'autorisation contre un jeton d'accès"});
        }
    } catch (error) {
        // Gérez les erreurs ici en cas d'erreur lors de la requête POST
        // console.error('Une erreur s\'est produite lors de l\'échange du code d\'autorisation contre un jeton d\'accès:', error);
        res.status(500).json({error: error});
    }
}