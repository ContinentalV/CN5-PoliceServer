// services/memberService.ts


import pool from '../config/dbConfig';
import {IUser} from '../entities/Member';
import {FieldPacket, PoolConnection, RowDataPacket} from "mysql2/promise";
import {mainLogger} from "../syslog/logger";

//TODO ajouter fonction update grades.  - Ajouter list grade de l'agent a la fonction profile

const getMemberById = async (discordId: string): Promise<IUser | null> => {
    const connection = await pool.getConnection();
    try {
        const query = `SELECT *
                       FROM Users
                       WHERE discordId = ?`;
        const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.query(query, [discordId]) as [RowDataPacket[], FieldPacket[]];
        if (rows.length) {
            const row = rows[0];
            const user: IUser = {
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
    } catch (error) {
        throw error;
    } finally {
        connection.release()
    }
};

const createMember = async (member: IUser): Promise<void> => {
    const connection = await pool.getConnection();
    try {
        const query = `INSERT INTO Users (discordId, username, nomRP, avatar, codeMetier, dateJoin, matricule,
                                          idServeur)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        await connection.query(query, [member.discordId, member.username, member.nomRP, member.avatar, member.codeMetier, member.dateJoin, member.matricule, member.idServeur]);


    } catch (error: any) {
        console.log(error.stack)
        throw error
    } finally {
        connection.release()
    }
};


const deleteMember = async (discordId: string): Promise<void> => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query(`DELETE
                                FROM services
                                WHERE discordAgentId = ?`, [discordId])
        await connection.query(`DELETE
                                FROM Userrole
                                WHERE userId = ?`, [discordId])
        await connection.query(`DELETE
                                FROM AgentRole
                                WHERE agentId = ?`, [discordId])
        await connection.query(`DELETE
                                FROM Users
                                WHERE discordId = ?`, [discordId])

        await connection.commit()
    } catch (e: any) {
        await connection.rollback();
        throw e
    } finally {
        connection.release()
    }


}
const roleMember = async (member: IUser): Promise<void> => {
    const connection = await pool.getConnection()
    try {
        if (member.roles && member.roles.length >= 1) {
            const query = `INSERT INTO Userrole (userId, roleId)
                           VALUES (?, ?)`;
            await connection.query(query, [member.discordId, member.roles[0]]);
        } else {
             mainLogger.info(`✅ Aucun rôle à ajouter pour l'utilisateur ${member.discordId}`)
        }
    } catch (e: any) {
        throw e
    } finally {
        connection.release()
    }

}
const createGradeEntryForMember = async (agentId: string, grades: []): Promise<void> => {
    const connection = await pool.getConnection()
    try {
        for (const grade of grades) {
            const query = `INSERT INTO AgentRole (agentId, roleId)
                           VALUES (?, ?)`;
            await connection.query(query, [agentId, grade]);
        }
    } catch (e: any) {
        throw e
    } finally {
        connection.release()
    }
}

const gradeMember = async (member: IUser): Promise<void> => {
    const connection = await pool.getConnection();
    try {
        if (member.grade && member.grade.length > 0) {
            const insertPromises = member.grade.map(async (role) => {
                const query = `INSERT INTO AgentRole (agentId, roleId)
                               VALUES (?, ?)`;
                await connection.query(query, [member.discordId, role.id]);
            });
            await Promise.all(insertPromises);
        }
    } catch (error: any) {
        throw error;
    } finally {
        connection.release();
    }
};

const updateMemberMatricule = async (discordId: string, newMatricule: number, codeMetier: string): Promise<void> => {
    const connection: PoolConnection = await pool.getConnection();
    try {
        // Vérification de l'unicité du matricule dans la catégorie
        const checkQuery = `SELECT COUNT(*) as count
                            FROM Users
                            WHERE matricule = ?
                              AND codeMetier = ?`;
        const [checkResult] = await connection.query(checkQuery, [newMatricule, codeMetier]);


        if (Array.isArray(checkResult)) {
            const countResult = checkResult[0] as RowDataPacket; // Type assertion
            if (countResult.count > 0) {
                throw new Error("|⛔| Ce matricule est déjà pris");
            }
        } else {
            throw new Error("|❌| Invalid query result format");     }
        // Mise à jour du matricule
        const updateQuery = `UPDATE Users
                             SET matricule = ?
                             WHERE discordId = ?`;
        await connection.query(updateQuery, [newMatricule, discordId]);
    } catch (e: any) {
        throw e;
    } finally {
        connection.release();
    }
};
// Ajouter cette fonction dans memberService.ts


const createServiceEntryForMember = async (discordAgentId: string): Promise<void> => {
    const connection = await pool.getConnection();
    try {
        const query = `INSERT INTO services (discordAgentId)
                       VALUES (?)`;
        await connection.query(query, [discordAgentId]);
    } catch (error) {
        throw error
    } finally {
        connection.release();
    }
};

const updateMemberInfo = async (discordId: string, updates: any): Promise<void> => {
    const connection = await pool.getConnection();
    try {
        let updateClauses = [];
        let queryParams = [];

        for (const [key, value] of Object.entries(updates)) {
            if (value !== null) {
                updateClauses.push(`${key} = ?`);
                queryParams.push(value);
            }
        }
        if (updateClauses.length === 0) return;
        queryParams.push(discordId);
        const updateQuery = `UPDATE Users
                             SET ${updateClauses.join(', ')}
                             WHERE discordId = ?`;
        await connection.query(updateQuery, queryParams);
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }
};

const updateMemberRole = async (discordId: string, newRoleId: string): Promise<void> => {
    const connection = await pool.getConnection();
    try {
        const [users] = await connection.query(
            `SELECT * FROM Userrole WHERE userId = ?`,
            [discordId]
        );

        if (users.length === 0) {
            await connection.query(
                `INSERT INTO Userrole (userId, roleId) VALUES (?, ?)`,
                [discordId, newRoleId]
            );
        } else {
            await connection.query(
                `UPDATE Userrole SET roleId = ? WHERE userId = ?`,
                [newRoleId, discordId]
            );
        }

    } catch (e) {
        throw e;
    } finally {
        connection.release();
    }
};





export default {
    getMemberById,
    createMember,
    updateMemberMatricule,
    createServiceEntryForMember,
    roleMember, updateMemberInfo, updateMemberRole, deleteMember, gradeMember, createGradeEntryForMember
};
