"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dbConfig_1 = __importDefault(require("../config/dbConfig"));
const isUserInService = async (discordAgentId) => {
    const connection = await dbConfig_1.default.getConnection();
    const query = `SELECT *
                   FROM Services
                   WHERE discordAgentId = ?
                     AND serviceIsOn = true`;
    try {
        const [rows] = await connection.query(query, [discordAgentId]);
        // Nous vérifions que rows est bien un tableau et qu'il contient au moins un élément
        return rows.length > 0 ? rows[0] : null;
    }
    catch (e) {
        throw e;
    }
    finally {
        connection.release();
    }
};
const startService = async (discordAgentId, PDS) => {
    const connection = await dbConfig_1.default.getConnection();
    try {
        const query = `UPDATE services
                       SET PDS         = ?,
                           serviceIsOn = ?
                       WHERE discordAgentId = ?
        `;
        await connection.query(query, [PDS, true, discordAgentId]);
    }
    catch (e) {
        throw e;
    }
    finally {
        connection.release();
    }
};
const endService = async (discordAgentId, FDS) => {
    const connection = await dbConfig_1.default.getConnection();
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
        const [serviceRows] = await connection.query(query, [discordAgentId]);
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
    }
    catch (e) {
        await connection.rollback();
        throw e;
    }
    finally {
        connection.release();
    }
};
const manageTimeService = async (targetId, temps, mode) => {
    const connection = await dbConfig_1.default.getConnection();
    try {
        await connection.beginTransaction();
        let query = 'SELECT TOTAL FROM services WHERE discordAgentId = ?';
        // Assert the correct full return type of the query
        const [rows] = await connection.query(query, [targetId]);
        // Now rows is RowDataPacket[] and you can get the first result
        const service = rows[0]; // Cast to any temporarily, adjust as needed based on your actual type
        let newTotal = mode === 'add' ? service.TOTAL + temps : service.TOTAL - temps;
        if (newTotal < 0)
            newTotal = 0;
        query = 'UPDATE services SET TOTAL = ? WHERE discordAgentId = ?';
        await connection.query(query, [newTotal, targetId]);
        await connection.commit();
    }
    catch (e) {
        await connection.rollback();
        throw e;
    }
    finally {
        connection.release();
    }
};
const resetData = async (company) => {
    const connection = await dbConfig_1.default.getConnection();
    try {
        let query = `UPDATE services
            INNER JOIN Users on services.discordAgentId = Users.discordId
                     SET PDS           = NULL,
                         FDS           = null,
                         TEMPS_SERVICE = DEFAULT,
                         serviceIsOn   = false,
                         TOTAL         = DEFAULT
                     WHERE Users.codeMetier = ?`;
        await connection.query(query, [company]);
    }
    catch (e) {
        throw e;
    }
    finally {
        connection.release();
    }
};
exports.default = {
    isUserInService,
    startService,
    endService,
    manageTimeService,
    resetData
    //   calculateShiftAndUpdate
};
