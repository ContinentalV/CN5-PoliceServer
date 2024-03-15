import pool from '../config/dbConfig';
import {PoolConnection, RowDataPacket} from "mysql2/promise";

interface MatriculeData {
    LSPD: number[];
    BCSO: number[];
}

const getAllMatricule = async (): Promise<MatriculeData> => {
    const connection: PoolConnection = await pool.getConnection();
    try {
        const connection: PoolConnection = await pool.getConnection();
        const query = 'SELECT Matricule, codeMetier FROM Users';
        const [rows] = (await connection.query(query)) as unknown as [RowDataPacket[]]; // Correct two-step type assertion

        connection.release();

        const matriculeData: MatriculeData = {
            LSPD: [],
            BCSO: []
        };

        rows.forEach((row: any): void => {
            if (row.codeMetier === 'LSPD') {
                matriculeData.LSPD.push(row.Matricule);
            } else if (row.codeMetier === 'BCSO') {
                matriculeData.BCSO.push(row.Matricule);
            }
        });

        return matriculeData;
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }

};

const getAllDataProfile = async (metierCode: string): Promise<any> => {

    const connection = await pool.getConnection()
    const query = `
        SELECT Users.discordId,
               Users.username,
               Users.nomRP,
               Users.avatar,
               Users.codeMetier,
               Users.dateJoin,
               Users.matricule,
               Services.PDS         as dernierPDS,
               Services.serviceIsOn as inService,
               Services.TOTAL       as tempsTotalService,
               ListRole.roleId      as roleId,
               ListRole.name        as roleName,
               ListRole.color       as roleColor
        FROM Users
                 LEFT JOIN Services ON Users.discordId = Services.discordAgentId
                 LEFT JOIN AgentRole ON Users.discordId = AgentRole.agentId
                 LEFT JOIN ListRole ON AgentRole.roleId = ListRole.roleId
        WHERE Users.codeMetier = ?
        GROUP BY Users.discordId`;
    try {
        const [rows] = await connection.query(query, [metierCode]);
        return rows; // Assure le retour des données ou un tableau vide
    } catch (e) {
        throw e
    } finally {
        connection.release()
    }

}

const getBaseSalarialGrade = async (code: string) => {
    const connection = await pool.getConnection()
    console.log('from service')

    try {
        const query = `SELECT *
                       FROM Roles
                       WHERE codeMetier = ?`;
        const [rows] = await connection.query(query, [code]);
        return rows;
    } catch (e) {
        throw e
    } finally {
        connection.release()
    }

}

const getAllGrade = async (serverId: string) => {

    const connection = await pool.getConnection()
    try {
        const query = `SELECT *
                       FROM Listrole
                       WHERE serverId = ?`
        const [rows] = await connection.query(query, [serverId]);
        return rows


    } catch (e) {
        throw e
    } finally {
        connection.release()
    }

}
// Plus de fonctions pour mettre à jour et supprimer des membres...

export default {
    getAllMatricule,
    getAllDataProfile,
    getBaseSalarialGrade,
    getAllGrade

};
