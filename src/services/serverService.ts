// services/memberService.ts


import pool from '../config/dbConfig';
import {IServer} from "../entities/Server";
import {PoolConnection, RowDataPacket} from "mysql2/promise";

const getServerById = async (serverId: string): Promise<IServer | null> => {
    const connection: PoolConnection = await pool.getConnection();
    try {
        const query = "SELECT * FROM ServerInfo WHERE serverId = ?";
        const [rows] = await connection.execute<RowDataPacket[]>(query, [serverId]);
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
      
        if (server.listRole && server.listRole.length > 0) {
            for (const roleData of server.listRole) {
                const {id, name, color} = roleData;
                await connection.query(`INSERT INTO ListRole (roleId, name, color, serverId)
                                        VALUES (?, ?, ?, ?)`, [id, name, color, server.serverId]);
            }
        }
    } catch (error: any) {
         throw error
    }finally {
        connection.release()
    }
};

export default {
    getServerById,
    createServer,

};
