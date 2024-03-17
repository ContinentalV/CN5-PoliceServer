import pool from '../config/dbConfig';
import {PoolConnection} from "mysql2/promise";

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

        console.log(`Role ${roleId} successfully deleted from server ${serverId}.`);
    } catch (error) {
        console.error('Error deleting role:', error);
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
        console.error('Error creating new role server:', error);
        throw error;
    } finally {
        connection.release();
    }
};

const updateRoleFromListRole = async (roleId: string, name: string, color: string, serverId: string) => {
    const connection: PoolConnection = await pool.getConnection();
    try {
        // Préparation de la requête de mise à jour
        const updateQuery = `
            UPDATE ListRole
            SET name  = ?,
                color = ?
            WHERE roleId = ?
              AND serverId = ?`;

        // Exécution de la requête de mise à jour avec les valeurs fournies
        await connection.query(updateQuery, [name, color, roleId, serverId]);

        // Vous pouvez ajouter un retour ou un feedback ici si nécessaire, par exemple:
        console.log(`Role ${roleId} updated successfully in server ${serverId}.`);
    } catch (error) {
        console.error('Error updating role in ListRole:', error);
        throw error;
    } finally {
        connection.release();
    }
};
export default {updateRoleFromListRole, createRoleFromListRole, deleteRoleFromListRole};
