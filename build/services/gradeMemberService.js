"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dbConfig_1 = __importDefault(require("../config/dbConfig"));
const addGradeMember = async (agentId, roleId) => {
    const connection = await dbConfig_1.default.getConnection();
    await connection.beginTransaction();
    try {
        let query;
        query = `SELECT *
                 FROM police.agentrole
                 WHERE agentId = ?
                   AND roleId = ?`;
        const [rows] = await connection.query(query, [agentId, roleId]);
        console.log(rows.length);
        if (rows.length === 0) {
            query = `INSERT INTO police.agentrole (agentId, roleId)
                     VALUES (?, ?)`;
            await connection.query(query, [agentId, roleId]);
            await connection.commit();
        }
    }
    catch (error) {
        console.error('Error adding role:', error);
        throw error;
    }
    finally {
        connection.release();
    }
};
const removeGradeMember = async (agentId, roleId) => {
    const connection = await dbConfig_1.default.getConnection();
    try {
        let query;
        query = `DELETE
                 FROM agentrole
                 WHERE agentId = ?
                   AND roleId = ?`;
        await connection.query(query, [agentId, roleId]);
    }
    catch (error) {
        console.error('Error remove role:', error);
        throw error;
    }
    finally {
        connection.release();
    }
};
const webAccessAdd = async (discordId) => {
    const connection = await dbConfig_1.default.getConnection();
    try {
        const query = `UPDATE users
                       SET etatMajor = ?
                       WHERE discordId = ?
        `;
        await connection.query(query, [true, discordId]);
    }
    catch (error) {
        console.error('Error remove role:', error);
        throw error;
    }
    finally {
        connection.release();
    }
};
const webAccessRemove = async (discordId) => {
    const connection = await dbConfig_1.default.getConnection();
    try {
        const query = `UPDATE users
                       SET etatMajor = ?
                       WHERE discordId = ?
        `;
        await connection.query(query, [false, discordId]);
    }
    catch (error) {
        console.error('Error remove role:', error);
        throw error;
    }
    finally {
        connection.release();
    }
};
exports.default = { addGradeMember, removeGradeMember, webAccessAdd, webAccessRemove };
