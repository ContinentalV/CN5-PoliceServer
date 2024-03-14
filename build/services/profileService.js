"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dbConfig_1 = __importDefault(require("../config/dbConfig"));
const getUserProfile = async (discordId) => {
    const connection = await dbConfig_1.default.getConnection();
    const query = `
        SELECT Users.discordId,
               Users.username,
               Users.nomRP,
               Users.avatar,
               Users.codeMetier,
               Users.dateJoin,
               Users.matricule,
               Users.idServeur,
               Services.PDS                  as dernierPDS,
               Services.FDS                  as dernierFDS,
               Services.TEMPS_SERVICE        as serviceTime,
               services.serviceIsOn          as inService,
               Services.TOTAL                as tempsTotalService,
               GROUP_CONCAT(ListRole.roleId) as roleId,   -- Modifier : Concaténation des identifiants de rôle
               GROUP_CONCAT(ListRole.name)   as roleName, -- Modifier : Concaténation des noms de rôle
               GROUP_CONCAT(ListRole.color)  as roleColor -- Modifier : Concaténation des couleurs de rôle
        FROM Users
                 LEFT JOIN Services ON Users.discordId = Services.discordAgentId
                 LEFT JOIN AgentRole ON Users.discordId = AgentRole.agentId
                 LEFT JOIN ListRole ON AgentRole.roleId = ListRole.roleId
        WHERE Users.discordId = ?
        GROUP BY Users.discordId`;
    try {
        const [results, fields] = await connection.query(query, [discordId]);
        if (Array.isArray(results)) {
            return results.length > 0 ? results[0] : null; // Casting the first result to the IUser type
        }
        else {
            // Handle unexpected result structure
            console.error('Unexpected result structure:', results);
            return null;
        }
    }
    catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
    finally {
        connection.release();
    }
};
const getSalaryForUser = async (discordId) => {
    const connection = await dbConfig_1.default.getConnection();
    let totalSalary = 0;
    try {
        await connection.query('CALL CalculateSalary(?, @totalSalary)', [discordId]);
        // Nous utilisons une assertion de type pour traiter le résultat comme un tableau de RowDataPacket
        const [salaryRows] = await connection.query('SELECT @totalSalary AS totalSalary');
        // Nous vérifions que salaryRows est bien un tableau et qu'il contient au moins un élément
        if (Array.isArray(salaryRows) && salaryRows.length > 0) {
            const row = salaryRows[0]; // Utilisation de 'as any' pour accéder à la propriété totalSalary
            totalSalary = row.totalSalary;
        }
    }
    catch (error) {
        console.error('Error fetching user salary:', error);
        throw error;
    }
    finally {
        connection.release();
    }
    return totalSalary;
};
exports.default = { getUserProfile, getSalaryForUser };
