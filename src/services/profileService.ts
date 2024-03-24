import pool from '../config/dbConfig';
import {IProfile} from '../entities/Profile';
import {PoolConnection, RowDataPacket} from "mysql2/promise";
import {IUser} from "../entities/Member";
import {mainLogger} from "../syslog/logger";

const getUserProfile = async (discordId: string): Promise<IProfile | null> => {
    const connection: PoolConnection = await pool.getConnection();
    const query = `
        SELECT Users.discordId,
               Users.username,
               Users.nomRP,
               Users.avatar,
               Users.codeMetier,
               Users.dateJoin,
               Users.matricule,
               Users.idServeur,
               services.PDS                  as dernierPDS,
               services.FDS                  as dernierFDS,
               services.TEMPS_SERVICE        as serviceTime,
               services.serviceIsOn          as inService,
               services.TOTAL                as tempsTotalService,
               GROUP_CONCAT(ListRole.roleId) as roleId,   -- Modifier : Concaténation des identifiants de rôle
               GROUP_CONCAT(ListRole.name)   as roleName, -- Modifier : Concaténation des noms de rôle
               GROUP_CONCAT(ListRole.color)  as roleColor -- Modifier : Concaténation des couleurs de rôle
        FROM Users
                 LEFT JOIN services ON Users.discordId = services.discordAgentId
                 LEFT JOIN AgentRole ON Users.discordId = AgentRole.agentId
                 LEFT JOIN ListRole ON AgentRole.roleId = ListRole.roleId
        WHERE Users.discordId = ?
        GROUP BY Users.discordId`;

    try {
        const [results, fields] = await connection.query(query, [discordId]);
        if (Array.isArray(results)) {
            return results.length > 0 ? (results[0] as IUser) : null; // Casting the first result to the IUser type
        } else {
            mainLogger.warn('|🟠| Unexpected result structure:' + JSON.stringify(results));
            return null;
        }
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }
}


const getSalaryForUser = async (discordId: string): Promise<number> => {
    const connection: PoolConnection = await pool.getConnection();
    let totalSalary: number = 0;

    try {
        await connection.query('CALL CalculateSalary(?, @totalSalary)', [discordId]);
        const [salaryRows]: [RowDataPacket[]] | any = await connection.query('SELECT @totalSalary AS totalSalary');
        if (Array.isArray(salaryRows) && salaryRows.length > 0) {
            const row = salaryRows[0] as any; // Utilisation de 'as any' pour accéder à la propriété totalSalary
            totalSalary = row.totalSalary;        }
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }
    return totalSalary;
};

export default {getUserProfile, getSalaryForUser};
