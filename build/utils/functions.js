"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logRequestTimeTracker = exports.logMemory = exports.logCpu = exports.logDb = exports.logInfo = exports.logWarning = exports.logError = void 0;
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const logDirectory = path_1.default.join(__dirname, "logs");
if (!fs_1.default.existsSync(logDirectory)) {
    fs_1.default.mkdirSync(logDirectory, { recursive: true });
}
const logFilePath = path_1.default.join(logDirectory, "api-logs.txt");
async function writeToLogFile(message) {
    const logMessage = `${message}\n`;
    try {
        await fs_1.promises.appendFile(logFilePath, logMessage);
    }
    catch (err) {
        console.error(chalk_1.default.red("Erreur lors de l'écriture dans le fichier de logs"), err);
    }
}
function getTimestamp() {
    return new Date().toLocaleString();
}
function formatValue(value) {
    if (typeof value === 'object' && value !== null) {
        // Utiliser une couleur plus claire pour les objets et tableaux
        return JSON.stringify(value, null, 2)
            .split('\n')
            .map(line => chalk_1.default.hex('#88C0D0')(line))
            .join('\n');
    }
    else {
        // Utiliser une couleur différente pour les chaînes et les nombres
        return chalk_1.default.cyan(value);
    }
}
function formatObjectForLogging(obj) {
    return Object.entries(obj)
        .map(([key, value]) => {
        // Utiliser une couleur plus claire pour les clés
        const keyColor = chalk_1.default.cyanBright;
        // Appeler formatValue pour obtenir une valeur formatée avec une couleur appropriée
        return `${keyColor(key)}: ${formatValue(value)}`;
    })
        .join("\n");
}
function logWithMetadata(level, message, commandOrEventName) {
    const timestamp = getTimestamp();
    let formattedMessage = `[${chalk_1.default.grey(timestamp)}]${commandOrEventName ? ` [${chalk_1.default.magenta(commandOrEventName)}]` : ''}`;
    let levelColor;
    // Déterminez la couleur de niveau en fonction du contenu du message pour les logs 'reqtimetracker'
    if (level === "reqtimetracker") {
        const messageStr = typeof message === "object" ? JSON.stringify(message) : message;
        if (messageStr.includes("GOOD")) {
            levelColor = chalk_1.default.greenBright;
        }
        else if (messageStr.includes("AVERAGE")) {
            levelColor = chalk_1.default.keyword('orange');
        }
        else if (messageStr.includes("CRITICAL")) {
            levelColor = chalk_1.default.redBright;
        }
        else {
            levelColor = chalk_1.default.magentaBright; // Couleur par défaut si aucune des conditions n'est remplie
        }
    }
    else {
        // Configuration des couleurs pour les autres niveaux de logs
        switch (level) {
            case "error":
                levelColor = chalk_1.default.redBright;
                break;
            case "warn":
                levelColor = chalk_1.default.keyword('orange');
                break;
            case "info":
                levelColor = chalk_1.default.blue;
                break;
            case "db":
                levelColor = chalk_1.default.green;
                break;
            case "cpu":
                levelColor = chalk_1.default.yellowBright;
                break;
            case "memory":
                levelColor = chalk_1.default.blueBright;
                break;
            default:
                levelColor = chalk_1.default.white;
                break;
        }
    }
    formattedMessage += ` ${levelColor(`${level.toUpperCase()}:`)} ${typeof message === "object" ? formatObjectForLogging(message) : levelColor(message)}`;
    console.log(formattedMessage);
    writeToLogFile(stripAnsiColors(formattedMessage)); // Strip ANSI colors for log file
}
// Fonction pour enlever les couleurs ANSI pour les fichiers logs
function stripAnsiColors(str) {
    return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nq-uy=><]/g, '');
}
const logError = (message, commandName) => logWithMetadata("error", message, commandName);
exports.logError = logError;
const logWarning = (message, commandName) => logWithMetadata("warn", message, commandName);
exports.logWarning = logWarning;
const logInfo = (message, commandName) => logWithMetadata("info", message, commandName);
exports.logInfo = logInfo;
const logDb = (message, commandName) => logWithMetadata("db", message, commandName);
exports.logDb = logDb;
const logCpu = (message, commandName) => logWithMetadata("cpu", message, commandName);
exports.logCpu = logCpu;
const logMemory = (message, commandName) => logWithMetadata("memory", message, commandName);
exports.logMemory = logMemory;
const logRequestTimeTracker = (message, commandName) => logWithMetadata("reqtimetracker", message, commandName);
exports.logRequestTimeTracker = logRequestTimeTracker;
