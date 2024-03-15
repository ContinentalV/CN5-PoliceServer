import pool from '../config/dbConfig';
import {PoolConnection} from "mysql2/promise";

const addGradeMember = async (agentId: string, roleId: string,) => {
    const connection: PoolConnection = await pool.getConnection();
    await connection.beginTransaction()

    try {
        let query;

        query = `SELECT *
                 FROM police.AgentRole
                 WHERE agentId = ?
                   AND roleId = ?`
        const [rows] = await connection.query(query, [agentId, roleId]);
        console.log(rows.length)
        if (rows.length === 0) {
            query = `INSERT INTO police.AgentRole (agentId, roleId)
                     VALUES (?, ?)`

            await connection.query(query, [agentId, roleId])
            await connection.commit()
        }


    } catch (error) {
        console.error('Error adding role:', error);
        throw error;
    } finally {
        connection.release();
    }
};


const removeGradeMember = async (agentId: string, roleId: string) => {
    const connection: PoolConnection = await pool.getConnection();
    try {
        let query;
        query = `DELETE
                 FROM AgentRole
                 WHERE agentId = ?
                   AND roleId = ?`;

        await connection.query(query, [agentId, roleId])


    } catch (error) {
        console.error('Error remove role:', error);
        throw error;
    } finally {
        connection.release();
    }
};
const webAccessAdd = async (discordId: string) => {
    const connection: PoolConnection = await pool.getConnection();
    try {
        const query = `UPDATE Users
                       SET etatMajor = ?
                       WHERE discordId = ?
        `

        await connection.query(query, [true, discordId])


    } catch (error) {
        console.error('Error remove role:', error);
        throw error;
    } finally {
        connection.release();
    }
};
const webAccessRemove = async (discordId: string) => {
    const connection: PoolConnection = await pool.getConnection();
    try {
        const query = `UPDATE Users
                       SET etatMajor = ?
                       WHERE discordId = ?
        `

        await connection.query(query, [false, discordId])


    } catch (error) {
        console.error('Error remove role:', error);
        throw error;
    } finally {
        connection.release();
    }
};

export default {addGradeMember, removeGradeMember, webAccessAdd, webAccessRemove};
