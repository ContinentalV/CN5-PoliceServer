"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dbConfig_1 = __importDefault(require("../config/dbConfig"));
const deleteRoleFromListRole = async (roleId, serverId) => {
    const connection = await dbConfig_1.default.getConnection();
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
    }
    catch (error) {
        console.error('Error deleting role:', error);
        throw error;
    }
    finally {
        connection.release();
    }
};
const createRoleFromListRole = async (roleId, name, color, serverId) => {
    const connection = await dbConfig_1.default.getConnection();
    try {
        // Insertion des données dans la table listrole
        const insertQuery = `INSERT INTO listrole (roleId, name, color, serverId) VALUE (?, ?, ?, ?) `;
        await connection.query(insertQuery, [roleId, name, color, serverId]);
    }
    catch (error) {
        console.error('Error creating new role server:', error);
        throw error;
    }
    finally {
        connection.release();
    }
};
const updateRoleFromListRole = async (roleId, name, color, serverId) => {
    const connection = await dbConfig_1.default.getConnection();
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
    }
    catch (error) {
        console.error('Error updating role in ListRole:', error);
        throw error;
    }
    finally {
        connection.release();
    }
};
exports.default = { updateRoleFromListRole, createRoleFromListRole, deleteRoleFromListRole };
