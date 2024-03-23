// authController.ts
import express, {NextFunction, Request, Response} from "express";
import axios from "axios";
import {CriticalError} from "../utils/CustomError";
import memberService from "../services/memberService";
import jwt from "jsonwebtoken"
import {logger} from "../syslog/logger";

const router = express.Router()

;

router.post('/token', async (req: Request, res: Response, next: NextFunction) => {
    const {code} = req.body;
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
            try {
                const userResponse = await axios.get('https://discord.com/api/users/@me', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                const discordId = userResponse.data.id;
                const user = await memberService.getMemberById(discordId)
                if (user && user.etatMajor) {
                    const jwtToken = jwt.sign({userId: user.discordId}, process.env.JWT_SECRET!, {expiresIn: '24h'})
                    res.cookie('jwt', jwtToken, {
                        httpOnly: true,
                        secure: true,
                        maxAge: 24 * 60 * 60 * 1000,
                        sameSite: "lax"
                    })
                    res.json({
                        accessToken,
                        refreshToken: response.data.refresh_token,
                        expiresIn: response.data.expires_in,
                        user
                    });
                } else {
                    logger.error("Cette accès est interdit.")
                    return res.status(403)
                }


            } catch (userError) {
               logger.error('Error fetching user from Discord:' +  userError);
                next(userError)

            }

        }


    } catch (error) {
        logger.error("Impossible d'changer le code contre un token.")
        next(new CriticalError("Impossible d'échanger le code contre un token."));
    }
})

router.get('/verify', async (req: Request, res: Response) => {
// m

    try {

        const token = req.cookies.jwt;
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        const user = await memberService.getMemberById(decoded.userId);
        if (user) {
            res.json({user});
        } else {
            res.status(401).json({message: 'Session invalide'});
        }
    } catch (error) {
        res.status(401).json({message: 'Authentifiez-vous'});
    }
})

router.get('/logout', async (req: Request, res: Response) => {
    try {

        res.clearCookie('jwt');
        res.status(200).json({message: 'Déconnexion réussie'});
    } catch (error) {
        logger.error('Erreur lors de la déconnexion :'+ error);
        res.status(500).json({message: 'Une erreur est survenue lors de la déconnexion'});
    }
});


export default router
