"use strict";
// services/memberService.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dbConfig_1 = __importDefault(require("../config/dbConfig"));
//TODO ajouter fonction update grades.  - Ajouter list grade de l'agent a la fonction profile
const getMemberById = async (discordId) => {
    const connection = await dbConfig_1.default.getConnection();
    try {
        const query = `SELECT *
                       FROM Users
                       WHERE discordId = ?`;
        const [rows] = await connection.query(query, [discordId]);
        if (rows.length) {
            const row = rows[0];
            const user = {
                discordId: row.discordId,
                username: row.username,
                nomRP: row.nomRP,
                avatar: row.avatar,
                codeMetier: row.codeMetier,
                dateJoin: row.dateJoin,
                matricule: row.matricule,
                idServeur: row.idServeur,
                roles: row.roles,
                etatMajor: row.etatMajor
            };
            return user;
        }
        return null;
    }
    catch (error) {
        throw error;
    }
    finally {
        connection.release();
    }
};
const createMember = async (member) => {
    const connection = await dbConfig_1.default.getConnection();
    try {
        const query = `INSERT INTO Users (discordId, username, nomRP, avatar, codeMetier, dateJoin, matricule,
                                          idServeur)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        await connection.query(query, [member.discordId, member.username, member.nomRP, member.avatar, member.codeMetier, member.dateJoin, member.matricule, member.idServeur]);
    }
    catch (error) {
        console.log(error.stack);
        throw error;
    }
    finally {
        connection.release();
    }
};
const deleteMember = async (discordId) => {
    const connection = await dbConfig_1.default.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query(`DELETE
                                FROM services
                                WHERE discordAgentId = ?`, [discordId]);
        await connection.query(`DELETE
                                FROM Userrole
                                WHERE userId = ?`, [discordId]);
        await connection.query(`DELETE
                                FROM AgentRole
                                WHERE agentId = ?`, [discordId]);
        await connection.query(`DELETE
                                FROM Users
                                WHERE discordId = ?`, [discordId]);
        await connection.commit();
    }
    catch (e) {
        console.log(e);
        await connection.rollback();
        throw e;
    }
    finally {
        connection.release();
    }
};
const roleMember = async (member) => {
    const connection = await dbConfig_1.default.getConnection();
    try {
        if (member.roles && member.roles.length >= 1) {
            const query = `INSERT INTO Userrole (userId, roleId)
                           VALUES (?, ?)`;
            await connection.query(query, [member.discordId, member.roles[0]]);
        }
        else {
            // Gérer la situation où member.roles est null ou vide
            console.log(`Aucun rôle à ajouter pour l'utilisateur ${member.discordId}`);
        }
    }
    catch (e) {
        throw e;
        console.log(e);
    }
    finally {
        connection.release();
    }
};
const createGradeEntryForMember = async (agentId, grades) => {
    const connection = await dbConfig_1.default.getConnection();
    try {
        for (const grade of grades) {
            const query = `INSERT INTO AgentRole (agentId, roleId)
                           VALUES (?, ?)`;
            await connection.query(query, [agentId, grade]);
        }
    }
    catch (e) {
        throw e;
        console.log(e);
    }
    finally {
        connection.release();
    }
};
const gradeMember = async (member) => {
    const connection = await dbConfig_1.default.getConnection();
    try {
        if (member.grade && member.grade.length > 0) {
            const insertPromises = member.grade.map(async (role) => {
                const query = `INSERT INTO AgentRole (agentId, roleId)
                               VALUES (?, ?)`;
                await connection.query(query, [member.discordId, role.id]);
            });
            await Promise.all(insertPromises);
        }
        else {
            // Gérer la situation où member.grade est null ou vide
            console.log(`Aucun grade à ajouter pour l'utilisateur ${member.discordId}`);
        }
    }
    catch (error) {
        console.error(`Une erreur s'est produite lors de l'ajout des grades pour l'utilisateur ${member.discordId}: ${error.message}`);
        throw error;
    }
    finally {
        connection.release();
    }
};
const updateMemberMatricule = async (discordId, newMatricule, codeMetier) => {
    const connection = await dbConfig_1.default.getConnection();
    try {
        // Vérification de l'unicité du matricule dans la catégorie
        const checkQuery = `SELECT COUNT(*) as count
                            FROM Users
                            WHERE matricule = ?
                              AND codeMetier = ?`;
        const [checkResult] = await connection.query(checkQuery, [newMatricule, codeMetier]);
        if (Array.isArray(checkResult)) {
            const countResult = checkResult[0]; // Type assertion
            if (countResult.count > 0) {
                throw new Error("Ce matricule est déjà pris");
            }
        }
        else {
            throw new Error("Invalid query result format");
        }
        // Mise à jour du matricule
        const updateQuery = `UPDATE Users
                             SET matricule = ?
                             WHERE discordId = ?`;
        await connection.query(updateQuery, [newMatricule, discordId]);
    }
    catch (e) {
        throw e;
    }
    finally {
        connection.release();
    }
};
// Ajouter cette fonction dans memberService.ts
const createServiceEntryForMember = async (discordAgentId) => {
    const connection = await dbConfig_1.default.getConnection();
    try {
        const query = `INSERT INTO services (discordAgentId)
                       VALUES (?)`;
        await connection.query(query, [discordAgentId]);
    }
    catch (error) {
        console.error(error);
        throw error;
    }
    finally {
        connection.release();
    }
};
const updateMemberInfo = async (discordId, updates) => {
    const connection = await dbConfig_1.default.getConnection();
    try {
        let updateClauses = [];
        let queryParams = [];
        for (const [key, value] of Object.entries(updates)) {
            if (value !== null) {
                updateClauses.push(`${key} = ?`);
                queryParams.push(value);
            }
        }
        if (updateClauses.length === 0) {
            // Si aucun champ à mettre à jour n'est fourni, on sort de la fonction
            console.log("Aucune information à mettre à jour.");
            return;
        }
        // Ajout de l'ID à la fin des paramètres de la requête
        queryParams.push(discordId);
        // Construction de la requête de mise à jour avec les clauses dynamiques
        const updateQuery = `UPDATE Users
                             SET ${updateClauses.join(', ')}
                             WHERE discordId = ?`;
        await connection.query(updateQuery, queryParams);
    }
    catch (error) {
        throw error;
    }
    finally {
        connection.release();
    }
};
const updateMemberRole = async (discordId, newRoleId) => {
    const connection = await dbConfig_1.default.getConnection();
    try {
        // Vérifiez d'abord si l'utilisateur existe
        const [users] = await connection.query(`SELECT * FROM Userrole WHERE userId = ?`, [discordId]);
        if (users.length === 0) {
            // L'utilisateur n'existe pas, donc nous l'insérons
            await connection.query(`INSERT INTO Userrole (userId, roleId) VALUES (?, ?)`, [discordId, newRoleId]);
        }
        else {
            // L'utilisateur existe, donc nous mettons à jour son rôle
            await connection.query(`UPDATE Userrole SET roleId = ? WHERE userId = ?`, [newRoleId, discordId]);
        }
    }
    catch (e) {
        // Gestion des erreurs
        throw e;
    }
    finally {
        // Assurez-vous de libérer la connexion dans tous les cas
        connection.release();
    }
};
// Plus de fonctions pour mettre à jour et supprimer des membres...
exports.default = {
    getMemberById,
    createMember,
    updateMemberMatricule,
    createServiceEntryForMember,
    roleMember, updateMemberInfo, updateMemberRole, deleteMember, gradeMember, createGradeEntryForMember
};
