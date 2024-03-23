import {createPool, PoolConnection, RowDataPacket} from 'mysql2/promise';
import 'dotenv/config';
import fs from 'fs';
import util from 'util';
import path from "path"
import {logDb, logError} from "../utils/functions";
// @ts-ignore
import config from '../../config/config.json';
import {logger} from "../syslog/logger";
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
logger.db(`\n${chalk.bgHex("#02a78e").black.bold("Database Name")}${chalk.bgBlack(envConfig.database)}${chalk.whiteBright('||')}${chalk.bgHex("#02a78e").black.bold("Logged As:")}${chalk.bgBlack(envConfig.username)}${chalk.whiteBright('||')}${chalk.bgHex("#02a78e").black.bold("Host:")}${chalk.bgBlack(envConfig.host)}${chalk.whiteBright('||')}${chalk.bgHex("#02a78e").black.bold("Dialect")}${chalk.bgBlack(envConfig.dialect)}`)
logger.db(`Connection succefull: ✅ ✅ ✅}`)
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

//##########################################
export const checkTables = async () => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query("SHOW TABLES");
        const tables = (rows as RowDataPacket[]).map(row => Object.values(row)[0]);
        const [rows33] = await connection.query("SHOW GRANTS FOR 'policeneo'@'127.0.0.1'");
        console.log(rows33)


        logDb(`Il y a ${tables.length} table(s) dans la base de données.`);
        logDb(`Table:: \n${tables.map((table) => `Vérification table:: ${table}`).join("\n")} table(s) dans la base de données.`);
        logDb("Vérification déroulé avec succès ✅✅");

    } catch (error) {
        if (error instanceof Error) {
            logError("Erreur lors de la vérification des tables: " + error.message);
        } else {
            logError("Erreur lors de la vérification des tables, et l'erreur n'est pas de type Error");
        }
        process.exit(1); // Arrête le serveur si la vérification échoue
    }
};
//##########################################

export const executeProcedureSqlFile = async (filePath: string) => {
    const connection = await pool.getConnection()
    try {
        const absolutePath = path.join(__dirname, filePath);
        const sqlString = await readFile(absolutePath, 'utf8')

        await connection.beginTransaction()
        await connection.query(sqlString)
        await connection.commit()
        logDb("Procedure sql execute !")


    } catch (e) {
        console.error(e)
        process.exit(1)
    } finally {
        connection.release()
    }

}


