// services/memberService.ts


import pool from '../config/dbConfig';
import {IServer} from "../entities/Server";
import {PoolConnection, RowDataPacket} from "mysql2/promise";

const getServerById = async (serverId: string): Promise<IServer | null> => {
    const connection: PoolConnection = await pool.getConnection();
    try {
        const query = "SELECT * FROM ServerInfo WHERE serverId = ?";
        // Type cast the result to the expected format
        const [rows] = await connection.execute<RowDataPacket[]>(query, [serverId]);
        // Assuming that IServer is compatible with RowDataPacket structure
        const server: IServer = rows[0] as unknown as IServer;
        return server || null;
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }
};

const createServer = async (server: IServer): Promise<void> => {
    const connection: PoolConnection = await pool.getConnection();
    try {
        const query = `INSERT INTO ServerInfo (serverId, serverName, owner, totalUsers, creationDate, defaultChannelId,
                                               iconUrl, inviteUrl)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        await connection.query(query, [server.serverId, server.serverName, server.owner, server.totalUsers, server.creationDate, server.defaultChannelId, server.iconUrl, server.inviteUrl]);

        // Ajouter les données de serveur.grade dans la table listrole
      
        if (server.listRole && server.listRole.length > 0) {

            for (const roleData of server.listRole) {
                const {id, name, color} = roleData;
                await connection.query(`INSERT INTO ListRole (roleId, name, color, serverId)
                                        VALUES (?, ?, ?, ?)`, [id, name, color, server.serverId]);
            }
        }

        connection.release();
    } catch (error: any) {
        connection.release();
        console.log(error.stack);
    }
};


// Plus de fonctions pour mettre à jour et supprimer des membres...

export default {
    getServerById,
    createServer,

};
