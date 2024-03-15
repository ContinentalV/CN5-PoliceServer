import pool from "../config/dbConfig";
import {IService} from "../entities/Service";
import {FieldPacket, PoolConnection, ResultSetHeader, RowDataPacket} from "mysql2/promise";


const isUserInService = async (discordAgentId: string): Promise<IService | null> => {
    const connection: PoolConnection = await pool.getConnection()

    const query = `SELECT *
                   FROM services
                   WHERE discordAgentId = ?
                     AND serviceIsOn = true`

    try {
        const [rows]: [RowDataPacket[] | ResultSetHeader | RowDataPacket[][]] =
            await connection.query(query, [discordAgentId]) as unknown as [RowDataPacket[]];

        // Nous vérifions que rows est bien un tableau et qu'il contient au moins un élément
        return rows.length > 0 ? rows[0] as IService : null;
    } catch (e) {
        throw e
    } finally {
        connection.release()
    }

}
const startService = async (discordAgentId: string, PDS: Date) => {
    const connection: PoolConnection = await pool.getConnection()

    try {

        const query = `UPDATE services
                       SET PDS         = ?,
                           serviceIsOn = ?
                       WHERE discordAgentId = ?
        `;
        await connection.query(query, [PDS, true, discordAgentId])
    } catch (e) {
        throw e
    } finally {
        connection.release()
    }


}
const endService = async (discordAgentId: string, FDS: Date): Promise<void> => {
    const connection: PoolConnection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        // Mise à jour de FDS et serviceIsOn
        let query = `UPDATE services
                     SET FDS         = ?,
                         serviceIsOn = ?
                     WHERE discordAgentId = ?`;
        await connection.query(query, [FDS, false, discordAgentId]);

        // Sélectionner PDS, FDS, et TOTAL actuel
        query = `SELECT PDS, FDS, TOTAL
                 FROM services
                 WHERE discordAgentId = ?`;

        // Ensure the query result is treated as an array of RowDataPacket
        const [serviceRows]: [RowDataPacket[], FieldPacket[]] = await connection.query(query, [discordAgentId]) as [RowDataPacket[], FieldPacket[]];
        const service = serviceRows[0]; // Assuming you're interested in the first row

        if (service && service.PDS && service.FDS) {
            const duration = (new Date(service.FDS).getTime() - new Date(service.PDS).getTime()) / 60000; // Durée en minutes
            const newTotal = (service.TOTAL || 0) + duration; // Calcul du nouveau total

            // Mise à jour de TEMPS_SERVICE et TOTAL
            query = `UPDATE services
                     SET TEMPS_SERVICE = ?,
                         TOTAL         = ?
                     WHERE discordAgentId = ?`;
            await connection.query(query, [duration, newTotal, discordAgentId]);
        }

        await connection.commit();
    } catch (e) {
        await connection.rollback();
        throw e;
    } finally {
        connection.release();
    }
};
const manageTimeService = async (targetId: string, temps: number, mode: string): Promise<void> => {
    const connection: PoolConnection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        let query = 'SELECT TOTAL FROM services WHERE discordAgentId = ?';
        // Assert the correct full return type of the query
        const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.query(query, [targetId]) as [RowDataPacket[], FieldPacket[]];
        // Now rows is RowDataPacket[] and you can get the first result
        const service = rows[0] as any; // Cast to any temporarily, adjust as needed based on your actual type

        let newTotal = mode === 'add' ? service.TOTAL + temps : service.TOTAL - temps;

        if (newTotal < 0) newTotal = 0;

        query = 'UPDATE services SET TOTAL = ? WHERE discordAgentId = ?';
        await connection.query(query, [newTotal, targetId]);
        await connection.commit();
    } catch (e) {
        await connection.rollback();
        throw e;
    } finally {
        connection.release();
    }
};


const resetData = async (company: string) => {
    const connection = await pool.getConnection()

    try {
        let query = `UPDATE services
            INNER JOIN Users on services.discordAgentId = Users.discordId
                     SET PDS           = NULL,
                         FDS           = null,
                         TEMPS_SERVICE = DEFAULT,
                         serviceIsOn   = false,
                         TOTAL         = DEFAULT
                     WHERE Users.codeMetier = ?`

        await connection.query(query, [company])
    } catch (e) {
        throw e
    } finally {
        connection.release()
    }

}


export default {
    isUserInService,
    startService,
    endService,
    manageTimeService,
    resetData
    //   calculateShiftAndUpdate

};