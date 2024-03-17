"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dbConfig_1 = __importDefault(require("../config/dbConfig"));
const getAllMatricule = async () => {
    const connection = await dbConfig_1.default.getConnection();
    try {
        const connection = await dbConfig_1.default.getConnection();
        const query = 'SELECT Matricule, codeMetier FROM Users';
        const [rows] = (await connection.query(query)); // Correct two-step type assertion
        connection.release();
        const matriculeData = {
            LSPD: [],
            BCSO: []
        };
        rows.forEach((row) => {
            if (row.codeMetier === 'LSPD') {
                matriculeData.LSPD.push(row.Matricule);
            }
            else if (row.codeMetier === 'BCSO') {
                matriculeData.BCSO.push(row.Matricule);
            }
        });
        return matriculeData;
    }
    catch (error) {
        throw error;
    }
    finally {
        connection.release();
    }
};
const getAllDataProfile = async (metierCode) => {
    const connection = await dbConfig_1.default.getConnection();
    const query = `
        SELECT Users.discordId,
               Users.username,
               Users.nomRP,
               Users.avatar,
               Users.codeMetier,
               Users.dateJoin,
               Users.matricule,
               services.PDS         as dernierPDS,
               services.serviceIsOn as inService,
               services.TOTAL       as tempsTotalService,
               ListRole.roleId      as roleId,
               ListRole.name        as roleName,
               ListRole.color       as roleColor
        FROM Users
                 LEFT JOIN services ON Users.discordId = services.discordAgentId
                 LEFT JOIN AgentRole ON Users.discordId = AgentRole.agentId
                 LEFT JOIN ListRole ON AgentRole.roleId = ListRole.roleId
        WHERE Users.codeMetier = ?
        GROUP BY Users.discordId`;
    try {
        const [rows] = await connection.query(query, [metierCode]);
        return rows; // Assure le retour des données ou un tableau vide
    }
    catch (e) {
        console.error('Error fetching user salary:', e);
        throw e;
    }
    finally {
        connection.release();
    }
};
const getBaseSalarialGrade = async (code) => {
    const connection = await dbConfig_1.default.getConnection();
    console.log('from service');
    try {
        const query = `SELECT *
                       FROM Roles
                       WHERE codeMetier = ?`;
        const [rows] = await connection.query(query, [code]);
        return rows;
    }
    catch (e) {
        throw e;
    }
    finally {
        connection.release();
    }
};
const getAllGrade = async (serverId) => {
    const connection = await dbConfig_1.default.getConnection();
    try {
        const query = `SELECT *
                       FROM Listrole
                       WHERE serverId = ?`;
        const [rows] = await connection.query(query, [serverId]);
        return rows;
    }
    catch (e) {
        throw e;
    }
    finally {
        connection.release();
    }
};
// Plus de fonctions pour mettre à jour et supprimer des membres...
exports.default = {
    getAllMatricule,
    getAllDataProfile,
    getBaseSalarialGrade,
    getAllGrade
};
