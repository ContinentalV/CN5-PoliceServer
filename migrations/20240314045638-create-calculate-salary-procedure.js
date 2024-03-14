'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        const procedure = `CREATE PROCEDURE CalculateSalary(IN p_discordId VARCHAR(255), OUT p_totalSalary INT)
BEGIN
    DECLARE v_baseSalary INT DEFAULT 0;
    DECLARE v_totalServiceMinutes INT DEFAULT 0;
    DECLARE v_roleId VARCHAR(255);

    SELECT ur.roleId INTO v_roleId FROM UserRole ur WHERE ur.userId = p_discordId LIMIT 1;
    SELECT r.salary INTO v_baseSalary FROM Roles r WHERE r.idRole = v_roleId;
    SELECT IFNULL(MAX(s.TOTAL), 0) INTO v_totalServiceMinutes FROM Services s WHERE s.discordAgentId = p_discordId;

    IF v_totalServiceMinutes < 690 THEN
        SET p_totalSalary = 0;
    ELSE
        SET p_totalSalary = v_baseSalary + FLOOR((v_totalServiceMinutes - 690) / 300) * 250000;
    END IF;
END;`;

        return queryInterface.sequelize.query(procedure);
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.sequelize.query("DROP PROCEDURE IF EXISTS CalculateSalary;");
    }
};
