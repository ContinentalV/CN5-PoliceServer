"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// authController.ts
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const CustomError_1 = require("../utils/CustomError");
const memberService_1 = __importDefault(require("../services/memberService"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
router.post('/token', async (req, res, next) => {
    const { code } = req.body;
    try {
        const response = await axios_1.default.post('https://discord.com/api/oauth2/token', `client_id=${encodeURIComponent(process.env.DISCORD_CLIENT)}&` +
            `client_secret=${encodeURIComponent(process.env.DISCORD_SECRET)}&` +
            `grant_type=authorization_code&` +
            `code=${encodeURIComponent(code)}&` +
            `redirect_uri=${encodeURIComponent(process.env.DISCORD_REDIRECT)}&` +
            `scope=${encodeURIComponent(process.env.DISCORD_SCOPE)}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        if (response.status === 200 || response.status === 204) {
            const accessToken = response.data.access_token;
            try {
                const userResponse = await axios_1.default.get('https://discord.com/api/users/@me', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                const discordId = userResponse.data.id;
                const user = await memberService_1.default.getMemberById(discordId);
                if (user && user.etatMajor) {
                    const jwtToken = jsonwebtoken_1.default.sign({ userId: user.discordId }, process.env.JWT_SECRET, { expiresIn: '24h' });
                    res.cookie('jwt', jwtToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        maxAge: 24 * 60 * 60 * 1000,
                        sameSite: "lax"
                    });
                    console.log(jwtToken);
                    res.json({
                        accessToken,
                        refreshToken: response.data.refresh_token,
                        expiresIn: response.data.expires_in,
                        user
                    });
                }
                else {
                    return res.status(403);
                }
            }
            catch (userError) {
                console.error('Error fetching user from Discord:', userError);
                next(userError);
            }
        }
    }
    catch (error) {
        next(new CustomError_1.CriticalError("Impossible d'échanger le code contre un token."));
    }
});
router.get('/verify', async (req, res) => {
    try {
        const token = req.cookies.jwt;
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await memberService_1.default.getMemberById(decoded.userId);
        if (user) {
            res.json({ user });
        }
        else {
            res.status(401).json({ message: 'Session invalide' });
        }
    }
    catch (error) {
        res.status(401).json({ message: 'Authentifiez-vous' });
    }
});
router.get('/logout', async (req, res) => {
    try {
        res.clearCookie('jwt');
        res.status(200).json({ message: 'Déconnexion réussie' });
    }
    catch (error) {
        console.error('Erreur lors de la déconnexion :', error);
        res.status(500).json({ message: 'Une erreur est survenue lors de la déconnexion' });
    }
});
exports.default = router;
