import pool from '../config/dbConfig';
import {PoolConnection} from "mysql2/promise";
import {mainLogger} from "../syslog/logger";

const deleteRoleFromListRole = async (roleId: string, serverId: string) => {
    const connection: PoolConnection = await pool.getConnection();
    try {
        // D'abord, supprimer les références du rôle dans AgentRole
        const deleteAgentRoleQuery = `DELETE
                                      FROM AgentRole
                                      WHERE roleId = ?`;
        await connection.query(deleteAgentRoleQuery, [roleId]);

        // Ensuite, supprimer le rôle de la table ListRole
        const deleteListRoleQuery = `DELETE
                                     FROM ListRole
                                     WHERE roleId = ?
                                       AND serverId = ?`;
        await connection.query(deleteListRoleQuery, [roleId, serverId]);

       mainLogger.info(`|✅| Role ${roleId} successfully deleted from server ${serverId}.`);
    } catch (error) {

        throw error;
    } finally {
        connection.release();
    }
};


const createRoleFromListRole = async (roleId: string, name: string, color: string, serverId: string) => {
    const connection: PoolConnection = await pool.getConnection();
    try {
        // Insertion des données dans la table listrole
        const insertQuery = `INSERT INTO ListRole (roleId, name, color, serverId) VALUE (?, ?, ?, ?) `;
        await connection.query(insertQuery, [roleId, name, color, serverId]);

    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }
};

const updateRoleFromListRole = async (roleId: string, name: string, color: string, serverId: string) => {
    const connection: PoolConnection = await pool.getConnection();
    try {
        const updateQuery = `
            UPDATE ListRole
            SET name  = ?,
                color = ?
            WHERE roleId = ?
              AND serverId = ?`;
        await connection.query(updateQuery, [name, color, roleId, serverId]);
       mainLogger.info(`|✅| Role ${roleId} updated successfully in server ${serverId}.`);
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }
};
export default {updateRoleFromListRole, createRoleFromListRole, deleteRoleFromListRole};
