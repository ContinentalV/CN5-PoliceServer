import {createPool, PoolConnection, RowDataPacket} from 'mysql2/promise';
import 'dotenv/config';
import fs from 'fs';
import util from 'util';
import Table from 'cli-table3';
import config from '../../config/config.json';
import chalk from "chalk";
import {Configurations} from "../interface";


require('dotenv').config();





//##########################################
const environment: keyof Configurations = (process.env.CUSTOM_ENV as keyof Configurations) || 'development';
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











