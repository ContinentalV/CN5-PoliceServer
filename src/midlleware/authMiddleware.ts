import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';

// Middleware d'authentification pour le site web via les cookies JWT
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
            if (err) {
                return res.status(401).json({message: 'Authentification invalide'});
            }
            req.user = decoded; // Ajoute les données de l'utilisateur à la requête
            next();
        });
    } else {
        res.status(401).json({message: 'JWT manquant dans la requête'});
    }
};

// Middleware d'authentification pour le bot Discord via un jeton
export const authenticateBotToken = (req: Request, res: Response, next: NextFunction) => {

    const botToken = req.headers['authorization']?.split(" ")[1]; // Supposons que le format soit "Bot <token>"

    if (botToken && botToken === process.env.BOT_TOKEN) {
        next();
    } else {
        res.status(401).json({message: "Jeton du bot invalide ou manquant dans l'en-tête Authorization"});
    }
};

// Middleware d'authentification pour les requêtes provenant à la fois du site web et du bot Discord
export const authenticate = (req: Request, res: Response, next: NextFunction) => {


    if (req.headers['authorization']?.startsWith("Bearer ")) {
        console.log(req.headers['authorization'])
        authenticateBotToken(req, res, next);
    } else {

        authenticateJWT(req, res, next);
    }
};
