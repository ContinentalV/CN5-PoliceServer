import {createPool, PoolConnection, RowDataPacket} from 'mysql2/promise';
import 'dotenv/config';
import fs from 'fs';
import util from 'util';
import path from "path"
import {logDb, logError} from "../utils/functions";
import Table from 'cli-table3';
// @ts-ignore
import config from '../../config/config.json';

import chalk from "chalk";


require('dotenv').config();

export interface ConnectionDetails {
    host: string;
    port: number;
    user: string;
    database: string;
    threadId: number;
    threadsConnected: number;
    processList: RowDataPacket[];
    maxConnections: number;
}

//REFAIRE UNE VRAI TEST CONNEXION
const readFile = util.promisify(fs.readFile);
//##########################################
const environment = process.env.CUSTOM_ENV || 'development';
const envConfig = config[environment];
const table = new Table({
    head: [
        chalk.hex('#02a78e').bold('Database Name'),
        chalk.hex('#02a78e').bold('Logged As'),
        chalk.hex('#02a78e').bold('Host'),
        chalk.hex('#02a78e').bold('Dialect')
    ],
    colWidths: [20, 20, 20, 20], // Ajustez selon votre besoin
    style: {
        head: [],  // Désactive le formatage par défaut du header
        border: [], // Désactive le formatage par défaut du bord
    },
    chars: {
        'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗',
        'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝',
        'left': '║', 'mid': '─', 'mid-mid': '┼',
        'right': '║', 'middle': '│', 'left-mid': '╟', 'right-mid': '╢'
    }
});




// Ajout des informations de connexion à la table
table.push(
    [
        chalk.bgBlack(envConfig.database),
        chalk.bgBlack(envConfig.username),
        chalk.bgBlack(envConfig.host),
        chalk.bgBlack(envConfig.dialect)
    ]
);

// Affichage de la table
console.log(table.toString());
//logger.db(`Connection succefull: ✅ ✅ ✅}`)
const pool = createPool({
    host: envConfig.host,
    user: envConfig.username,
    password: envConfig.password,
    database: envConfig.database,
    waitForConnections: true,
    queueLimit: 0
});
//##########################################
export default pool;

export const getConnectionInfo = async (): Promise<{
    process: RowDataPacket[],
    activeConexion: number
} | undefined> => {
    const connection: PoolConnection = await pool.getConnection();

    try {
        // Obtenir le nombre total de connexions actives
        const [threadsConnectedResult] = await connection.execute<RowDataPacket[]>("SHOW STATUS WHERE 'variable_name' = 'Threads_connected'");
        if (!Array.isArray(threadsConnectedResult)) {
            throw new Error('Expected an array of RowDataPacket');
        }

        const activeConnections = threadsConnectedResult[0] && threadsConnectedResult[0].Value ? parseInt(threadsConnectedResult[0].Value.toString(), 10) : 0;

        // Obtenir des informations détaillées sur toutes les connexions
        const [processList] = await connection.execute<RowDataPacket[]>("SHOW FULL PROCESSLIST");
        if (!Array.isArray(processList)) {
            throw new Error('Expected an array of RowDataPacket');
        }

        // Retourner les données de connexion
        return {
            process: processList,
            activeConexion: activeConnections
        };
    } catch (e) {
        console.error(e);
        // Retourner undefined en cas d'erreur
        return undefined;
    } finally {
        connection.release();
    }
};

//##########################################
export const testConnection = async () => {
    const x = await pool.getConnection();
    try {


        return x
    } catch (error) {
        if (error instanceof Error) {
            logError('Erreur lors de la vérification des tables:', error.message);
        } else {
            logError('Erreur lors de la vérification des tables:', String(error));
        }
        process.exit(1);
    } finally {
        x.release()
    }


};
export const testConnection2 = async () => {
    const connection = await pool.getConnection();
    try {
        const [statusResult] = await connection.query<RowDataPacket[]>('SHOW STATUS LIKE "Threads_connected"');
        const threadsConnected = statusResult[0]?.Value ?? 0; // Utilisation de coalescence des nuls pour une valeur par défaut

        const [processListResult] = await connection.query<RowDataPacket[]>('SHOW FULL PROCESSLIST');
        const processList = processListResult.filter((db: RowDataPacket) => db.db === connection.config.database?.toLowerCase());

        const [variablesResult] = await connection.query<RowDataPacket[]>('SHOW VARIABLES LIKE "max_connections"');
        const maxConnectionsRow = variablesResult.find((v: RowDataPacket) => v.Variable_name === "max_connections");
        const maxConnections = maxConnectionsRow ? Number(maxConnectionsRow.Value) : 0;

        // Construction d'un objet avec les informations souhaitées
        const connectionDetails: ConnectionDetails = {
            host: connection.config.host ?? 'defaultHost', // Fournissez une valeur par défaut ou gérez l'`undefined`
            port: connection.config.port ?? 3306, // Port MySQL par défaut ou une autre valeur de votre choix
            user: connection.config.user ?? 'defaultUser',
            database: connection.config.database ?? 'defaultDatabase',
            threadId: connection.threadId,
            threadsConnected: Number(threadsConnected),
            processList: processList,
            maxConnections: maxConnections,
        };


        // Retourner l'objet d'informations
        return connectionDetails;
    } catch (error) {
        if (error instanceof Error) {
            logError('Erreur lors de la vérification des tables:', error.message);
        } else {
            logError('Erreur lors de la vérification des tables:', String(error));
        }
        process.exit(1);
    } finally {
        // Assurez-vous de libérer la connexion même en cas d'erreur
        if (connection) connection.release();
    }
};




