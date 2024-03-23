import { createLogger, format, transports, config } from "winston";
import chalk from "chalk";

// Définition du format pour la console avec Chalk
const consoleFormat = format.combine(
    format.timestamp({ format: "DD-MM-YYYY | HH:mm:ss" }),
    format.printf(info => {
        const timestamp = chalk.bgBlack.whiteBright(` ${info.timestamp} `) + chalk.bgGrey.whiteBright('|::|');
        let level = '';
        let message = '';

        switch (info.level) {
            case 'error':
            case 'errorDB':
                level = chalk.bgRedBright.black(` ${info.level.toUpperCase()} `);
                message = chalk.red(info.message);
                break;
            case 'db':
               level = chalk.bgHex('#e89a00').black.bold(` ${info.level.toUpperCase()} `);
                message = chalk.red(info.message);
                break;
            case 'warn':
                level = chalk.bgYellowBright.black(` ${info.level.toUpperCase()} `);
                message = chalk.yellowBright(info.message);
                break;
            case 'info':
                level = chalk.bgGreenBright.black(` ${info.level.toUpperCase()} `);
                message = chalk.greenBright(info.message);
                break;
            default:
                level = chalk.bgWhiteBright(` ${info.level.toUpperCase()} `);
                message = chalk.whiteBright(info.message);
                break;
        }

        return `${timestamp}${level}: ${message}`;
    })
);

// Définition du format pour les fichiers sans Chalk
const fileFormat = format.combine(
    format.timestamp({ format: "DD-MM-YYYY | HH:mm:ss" }),
    format.printf(info => `${info.timestamp} |::| ${info.level} |::| ${info.message}`)
);

// Définition du format pour les fichiers réseau
const fileNetworkFormat = format.combine(
    format.timestamp({ format: "DD-MM-YYYY | HH:mm:ss" }),
    format.printf(info => `${info.timestamp} |::| NETWORK |::| ${info.message}`) // Utilisez NETWORK comme tag
);

// Définition des niveaux de journalisation personnalisés
const customLevels = {
    levels: {
        db:-1,
        error: 0,
        warn: 1,
        info: 2,
        http: 3, // Ajoutez le niveau 'http'
        network: 4 // Ajoutez le niveau 'network'
    },
    colors: {
        db: 'orange',
        error: 'red',
        warn: 'yellow',
        info: 'green',
        http: 'blue', // Définissez une couleur pour le niveau 'http' (facultatif)
        network: 'magenta' // Définissez une couleur pour le niveau 'network' (facultatif)
    }
};

// Appliquez les niveaux de journalisation personnalisés à la configuration de Winston
config.addColors(customLevels.colors);

// Créer un deuxième logger spécifiquement pour les logs réseau
const networkLogger = createLogger({
    levels: customLevels.levels,
    transports: [
        new transports.File({
            filename: 'logs/network.log',
            format: fileNetworkFormat,
            level: 'network' // Niveau 'network' pour ce transport uniquement
        })
    ]
});

// Créer le logger principal pour les autres logs
const mainLogger = createLogger({
    levels: customLevels.levels,
    transports: [
        new transports.Console({
            format: consoleFormat
        }),
        new transports.File({
            filename: 'logs/combined.log',
            format: fileFormat
        }),
        new transports.File({
            filename: 'logs/error.log',
            format: fileFormat,
            level: 'error'
        })
    ]
});

// Définir les méthodes pour les logs réseau
const logger = {
    info: (message: string) => mainLogger.info(message),
    error: (message: string) => mainLogger.error(message),
    warn: (message: string) => mainLogger.warn(message),
    db:(message: string) => mainLogger.db(message),
    // Définir d'autres méthodes si nécessaire...
    network: (client: string, ip: string, token: string, requestURL: string, success: boolean, statusCode: number, data: any) => {
        const logInfo = `CLIENT: ${client} | IP: ${ip} | Token: ${token} | RequestURL: ${requestURL} | Success: ${success ? '✅' : '📛'} | StatusCode: ${statusCode} | Data: ${JSON.stringify(data)}`;
        networkLogger.log({ level: 'network', message: logInfo });
    }
};

export { logger };
