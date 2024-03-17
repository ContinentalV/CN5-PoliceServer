"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeProcedureSqlFile = exports.checkTables = exports.testConnection2 = exports.testConnection = exports.getConnectionInfo = void 0;
const promise_1 = require("mysql2/promise");
require("dotenv/config");
const fs_1 = __importDefault(require("fs"));
const util_1 = __importDefault(require("util"));
const path_1 = __importDefault(require("path"));
const functions_1 = require("../utils/functions");
// @ts-ignore
const config_json_1 = __importDefault(require("../../config/config.json"));
require('dotenv').config();
const readFile = util_1.default.promisify(fs_1.default.readFile);
//##########################################
const environment = process.env.NODE_ENV || 'development';
const envConfig = config_json_1.default[environment];
const pool = (0, promise_1.createPool)({
    host: envConfig.host,
    user: envConfig.username,
    password: envConfig.password,
    database: envConfig.database,
    waitForConnections: true,
    queueLimit: 0
});
//##########################################
exports.default = pool;
const getConnectionInfo = async () => {
    const connection = await pool.getConnection();
    try {
        // Obtenir le nombre total de connexions actives
        const [threadsConnectedResult] = await connection.execute("SHOW STATUS WHERE 'variable_name' = 'Threads_connected'");
        if (!Array.isArray(threadsConnectedResult)) {
            throw new Error('Expected an array of RowDataPacket');
        }
        const activeConnections = threadsConnectedResult[0] && threadsConnectedResult[0].Value ? parseInt(threadsConnectedResult[0].Value.toString(), 10) : 0;
        // Obtenir des informations détaillées sur toutes les connexions
        const [processList] = await connection.execute("SHOW FULL PROCESSLIST");
        if (!Array.isArray(processList)) {
            throw new Error('Expected an array of RowDataPacket');
        }
        // Retourner les données de connexion
        return {
            process: processList,
            activeConexion: activeConnections
        };
    }
    catch (e) {
        console.error(e);
        // Retourner undefined en cas d'erreur
        return undefined;
    }
    finally {
        connection.release();
    }
};
exports.getConnectionInfo = getConnectionInfo;
//##########################################
const testConnection = async () => {
    const x = await pool.getConnection();
    try {
        return x;
    }
    catch (error) {
        if (error instanceof Error) {
            (0, functions_1.logError)('Erreur lors de la vérification des tables:', error.message);
        }
        else {
            (0, functions_1.logError)('Erreur lors de la vérification des tables:', String(error));
        }
        process.exit(1);
    }
    finally {
        x.release();
    }
};
exports.testConnection = testConnection;
const testConnection2 = async () => {
    const connection = await pool.getConnection();
    try {
        const [statusResult] = await connection.query('SHOW STATUS LIKE "Threads_connected"');
        const threadsConnected = statusResult[0]?.Value ?? 0; // Utilisation de coalescence des nuls pour une valeur par défaut
        const [processListResult] = await connection.query('SHOW FULL PROCESSLIST');
        const processList = processListResult.filter((db) => db.db === connection.config.database?.toLowerCase());
        const [variablesResult] = await connection.query('SHOW VARIABLES LIKE "max_connections"');
        const maxConnectionsRow = variablesResult.find((v) => v.Variable_name === "max_connections");
        const maxConnections = maxConnectionsRow ? Number(maxConnectionsRow.Value) : 0;
        // Construction d'un objet avec les informations souhaitées
        const connectionDetails = {
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
    }
    catch (error) {
        if (error instanceof Error) {
            (0, functions_1.logError)('Erreur lors de la vérification des tables:', error.message);
        }
        else {
            (0, functions_1.logError)('Erreur lors de la vérification des tables:', String(error));
        }
        process.exit(1);
    }
    finally {
        // Assurez-vous de libérer la connexion même en cas d'erreur
        if (connection)
            connection.release();
    }
};
exports.testConnection2 = testConnection2;
//##########################################
const checkTables = async () => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query("SHOW TABLES");
        const tables = rows.map(row => Object.values(row)[0]);
        const [rows33] = await connection.query("SHOW GRANTS FOR 'policeneo'@'127.0.0.1'");
        console.log(rows33);
        (0, functions_1.logDb)(`Il y a ${tables.length} table(s) dans la base de données.`);
        (0, functions_1.logDb)(`Table:: \n${tables.map((table) => `Vérification table:: ${table}`).join("\n")} table(s) dans la base de données.`);
        (0, functions_1.logDb)("Vérification déroulé avec succès ✅✅");
    }
    catch (error) {
        if (error instanceof Error) {
            (0, functions_1.logError)("Erreur lors de la vérification des tables: " + error.message);
        }
        else {
            (0, functions_1.logError)("Erreur lors de la vérification des tables, et l'erreur n'est pas de type Error");
        }
        process.exit(1); // Arrête le serveur si la vérification échoue
    }
};
exports.checkTables = checkTables;
//##########################################
const executeProcedureSqlFile = async (filePath) => {
    const connection = await pool.getConnection();
    try {
        const absolutePath = path_1.default.join(__dirname, filePath);
        const sqlString = await readFile(absolutePath, 'utf8');
        await connection.beginTransaction();
        await connection.query(sqlString);
        await connection.commit();
        (0, functions_1.logDb)("Procedure sql execute !");
    }
    catch (e) {
        console.error(e);
        process.exit(1);
    }
    finally {
        connection.release();
    }
};
exports.executeProcedureSqlFile = executeProcedureSqlFile;
