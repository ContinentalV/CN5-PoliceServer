// authController.ts
import express, {NextFunction, Request, Response} from "express";
import axios from "axios";
import {CriticalError} from "../utils/CustomError";
import memberService from "../services/memberService";
import jwt, {JwtPayload} from "jsonwebtoken"
import {errorLogger,mainLogger} from "../syslog/logger";
import { v4 as uuidv4 } from 'uuid';
const router = express.Router()



router.post('/token', async (req: Request, res: Response) => {
    const { code } = req.body;
    if(!code) {
        mainLogger.warn("|❌| Parametre/body manquant")
        return res.status(400).json({message: "|❌| Parametre/body manquant"})
    }

    try {
        const response = await axios.post('https://discord.com/api/oauth2/token',
            `client_id=${encodeURIComponent(process.env.DISCORD_CLIENT!)}&` +
            `client_secret=${encodeURIComponent(process.env.DISCORD_SECRET!)}&` +
            `grant_type=authorization_code&` +
            `code=${encodeURIComponent(code)}&` +
            `redirect_uri=${encodeURIComponent(process.env.DISCORD_REDIRECT!)}&` +
            `scope=${encodeURIComponent(process.env.DISCORD_SCOPE!)}`, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

        if (response.status === 200 || response.status === 204) {
            const accessToken = response.data.access_token;
            const userResponse = await axios.get('https://discord.com/api/users/@me', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            const discordId = userResponse.data.id;
            const user = await memberService.getMemberById(discordId);
            if (user && user.etatMajor) {
                const jwtToken = jwt.sign({ userId: user.discordId }, process.env.JWT_SECRET!, { expiresIn: '24h' });
                res.cookie('jwt', jwtToken, {
                    httpOnly: true,
                    secure: true,
                    maxAge: 24 * 60 * 60 * 1000,
                    sameSite: "lax"
                });
                res.json({
                    accessToken,
                    refreshToken: response.data.refresh_token,
                    expiresIn: response.data.expires_in,
                    user
                });
                mainLogger.info(`|✅| Token délivré avec succès pour l'utilisateur ${discordId}.`);
                mainLogger.info(`|✅| L'user ${user.discordId} - ${user.nomRP} - ${user.codeMetier} est bien authentifié et vérifier`)

            } else {
                const errorId = uuidv4();
                errorLogger.error({
                    message: `|📛| L'user ${user?.discordId || ""} - ${user?.nomRP || ""} - ${user?.codeMetier || ""} - ${user?.etatMajor === true ? "Webaccess:true" : "UnAuthorized"} -> n'est pas authorisé à acceder à cette page.`,
                    discordId,
                    errorId
                });
                return res.status(403).json({ message: `|❌| Vous n'êtes pas autorisé à consulter cette page.`, errorId: errorId });
            }
        }

    } catch (error:any) {
        const errorId = uuidv4();
        errorLogger.error({
            message: `${error.message}`,
            code,
            errorId
        });
        return res.status(500).json({ message: "|❌| Erreur interne du serveur (auth)", errorId: errorId });
    }
});


router.get('/verify', async (req: Request, res: Response) => {
    const token = req.cookies.jwt;
    let decod:string | JwtPayload = "";
    if (!token) {
        mainLogger.warn('Tentative de vérification sans token fourni');
        return res.status(401).json({ message: 'Veuillez vous authentifiez' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!)as JwtPayload;
        decod = decoded
        const user = await memberService.getMemberById(decoded.userId);

        if (user) {
            mainLogger.info(`Vérification réussie pour l'utilisateur: ${decoded.userId}`);
            res.json({ user });
        } else {
            mainLogger.warn(`Tentative de vérification avec un token invalide pour l'utilisateur: ${decoded.userId}`);
            return res.status(401).json({ message: 'Session invalide. Utilisateur non trouvé.' });
        }
    } catch (error:any) {
        const errorId = uuidv4();
        errorLogger.error({
            message: `Erreur lors de la vérification du token : ${error.message}`,
            errorId
        });
        return res.status(401).json({ message: 'Authentifiez-vous. Erreur de vérification du token.', errorId });
    }
});





router.get('/logout', async (req: Request, res: Response) => {
    try {
        res.clearCookie('jwt');
        mainLogger.info("Déconnexion réussie d'un utilisateur.");
        res.status(200).json({ message: 'Déconnexion réussie' });
    } catch (error:any) {

        const errorId = uuidv4();

        errorLogger.error({
            message: 'Erreur lors de la déconnexion',
            error: error.message,
            errorId
        });

        res.status(500).json({
            message: 'Une erreur est survenue lors de la déconnexion',
            errorId
        });
    }
});

export default router;



