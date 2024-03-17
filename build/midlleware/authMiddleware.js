"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = exports.authenticateBotToken = exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Middleware d'authentification pour le site web via les cookies JWT
const authenticateJWT = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Authentification invalide' });
            }
            req.user = decoded; // Ajoute les données de l'utilisateur à la requête
            next();
        });
    }
    else {
        res.status(401).json({ message: 'JWT manquant dans la requête' });
    }
};
exports.authenticateJWT = authenticateJWT;
// Middleware d'authentification pour le bot Discord via un jeton
const authenticateBotToken = (req, res, next) => {
    const botToken = req.headers['authorization']?.split(" ")[1]; // Supposons que le format soit "Bot <token>"
    if (botToken && botToken === process.env.BOT_TOKEN) {
        next();
    }
    else {
        res.status(401).json({ message: "Jeton du bot invalide ou manquant dans l'en-tête Authorization" });
    }
};
exports.authenticateBotToken = authenticateBotToken;
// Middleware d'authentification pour les requêtes provenant à la fois du site web et du bot Discord
const authenticate = (req, res, next) => {
    if (req.headers['authorization']?.startsWith("Bearer ")) {
        (0, exports.authenticateBotToken)(req, res, next);
    }
    else {
        (0, exports.authenticateJWT)(req, res, next);
    }
};
exports.authenticate = authenticate;
