import chalk from "chalk";
import fs, {promises as fsPromises} from "fs";
import path from "path";

const logDirectory = path.join(__dirname, "logs");
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, {recursive: true});
}

const logFilePath = path.join(logDirectory, "api-logs.txt");

async function writeToLogFile(message: string): Promise<void> {
    const logMessage = `${message}\n`;
    try {
        await fsPromises.appendFile(logFilePath, logMessage);
    } catch (err) {
        console.error(chalk.red("Erreur lors de l'écriture dans le fichier de logs"), err);
    }
}

function getTimestamp(): string {
    return new Date().toLocaleString();
}

function formatValue(value: unknown): string {
    if (typeof value === 'object' && value !== null) {
        // Utiliser une couleur plus claire pour les objets et tableaux
        return JSON.stringify(value, null, 2)
            .split('\n')
            .map(line => chalk.hex('#88C0D0')(line))
            .join('\n');
    } else {
        // Utiliser une couleur différente pour les chaînes et les nombres
        return chalk.cyan(value as string);
    }
}

function formatObjectForLogging(obj: Record<string, unknown>): string {
    return Object.entries(obj)
        .map(([key, value]) => {
            // Utiliser une couleur plus claire pour les clés
            const keyColor = chalk.cyanBright;
            // Appeler formatValue pour obtenir une valeur formatée avec une couleur appropriée
            return `${keyColor(key)}: ${formatValue(value)}`;
        })
        .join("\n");
}

function logWithMetadata(level: "error" | "warn" | "info" | "db" | "cpu" | "reqtimetracker" | "memory", message: string | Record<string, unknown>, commandOrEventName?: string): void {
    const timestamp = getTimestamp();
    let formattedMessage = `[${chalk.grey(timestamp)}]${commandOrEventName ? ` [${chalk.magenta(commandOrEventName)}]` : ''}`;
    let levelColor;

    // Déterminez la couleur de niveau en fonction du contenu du message pour les logs 'reqtimetracker'
    if (level === "reqtimetracker") {
        const messageStr = typeof message === "object" ? JSON.stringify(message) : message;
        if (messageStr.includes("GOOD")) {
            levelColor = chalk.greenBright;
        } else if (messageStr.includes("AVERAGE")) {
            levelColor = chalk.keyword('orange');
        } else if (messageStr.includes("CRITICAL")) {
            levelColor = chalk.redBright;
        } else {
            levelColor = chalk.magentaBright; // Couleur par défaut si aucune des conditions n'est remplie
        }
    } else {
        // Configuration des couleurs pour les autres niveaux de logs
        switch (level) {
            case "error":
                levelColor = chalk.redBright;
                break;
            case "warn":
                levelColor = chalk.keyword('orange');
                break;
            case "info":
                levelColor = chalk.blue;
                break;
            case "db":
                levelColor = chalk.green;
                break;
            case "cpu":
                levelColor = chalk.yellowBright;
                break;
            case "memory":
                levelColor = chalk.blueBright;
                break;
            default:
                levelColor = chalk.white;
                break;
        }
    }

    formattedMessage += ` ${levelColor(`${level.toUpperCase()}:`)} ${typeof message === "object" ? formatObjectForLogging(message) : levelColor(message)}`;

    console.log(formattedMessage);
    writeToLogFile(stripAnsiColors(formattedMessage)); // Strip ANSI colors for log file
}

// Fonction pour enlever les couleurs ANSI pour les fichiers logs
function stripAnsiColors(str: string): string {
    return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nq-uy=><]/g, '');
}

export const logError = (message: string, commandName?: string) => logWithMetadata("error", message, commandName);
export const logWarning = (message: string, commandName?: string) => logWithMetadata("warn", message, commandName);
export const logInfo = (message: string | Record<string, unknown>, commandName?: string) => logWithMetadata("info", message, commandName);
export const logDb = (message: string | Record<string, unknown>, commandName?: string) => logWithMetadata("db", message, commandName);
export const logCpu = (message: string | Record<string, unknown>, commandName?: string) => logWithMetadata("cpu", message, commandName);
export const logMemory = (message: string | Record<string, unknown>, commandName?: string) => logWithMetadata("memory", message, commandName);
export const logRequestTimeTracker = (message: string | Record<string, unknown>, commandName?: string) => logWithMetadata("reqtimetracker", message, commandName);
