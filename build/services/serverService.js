"use strict";
// services/memberService.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dbConfig_1 = __importDefault(require("../config/dbConfig"));
const getServerById = async (serverId) => {
    const connection = await dbConfig_1.default.getConnection();
    try {
        const query = "SELECT * FROM ServerInfo WHERE serverId = ?";
        // Type cast the result to the expected format
        const [rows] = await connection.execute(query, [serverId]);
        // Assuming that IServer is compatible with RowDataPacket structure
        const server = rows[0];
        return server || null;
    }
    catch (error) {
        throw error;
    }
    finally {
        connection.release();
    }
};
const createServer = async (server) => {
    const connection = await dbConfig_1.default.getConnection();
    try {
        const query = `INSERT INTO ServerInfo (serverId, serverName, owner, totalUsers, creationDate, defaultChannelId,
                                               iconUrl, inviteUrl)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        await connection.query(query, [server.serverId, server.serverName, server.owner, server.totalUsers, server.creationDate, server.defaultChannelId, server.iconUrl, server.inviteUrl]);
        // Ajouter les données de serveur.grade dans la table listrole
        if (server.listRole && server.listRole.length > 0) {
            for (const roleData of server.listRole) {
                const { id, name, color } = roleData;
                await connection.query(`INSERT INTO ListRole (roleId, name, color, serverId)
                                        VALUES (?, ?, ?, ?)`, [id, name, color, server.serverId]);
            }
        }
        connection.release();
    }
    catch (error) {
        connection.release();
        console.log(error.stack);
    }
};
// Plus de fonctions pour mettre à jour et supprimer des membres...
exports.default = {
    getServerById,
    createServer,
};
