CREATE
    DEFINER = root@localhost PROCEDURE CalculateSalary(IN p_discordId VARCHAR(255), OUT p_totalSalary INT)
BEGIN
    DECLARE v_baseSalary INT DEFAULT 0;
    DECLARE v_totalServiceMinutes INT DEFAULT 0;
    DECLARE v_roleId VARCHAR(255);

    -- Récupération de l'idRole pour cet utilisateur
    SELECT ur.roleId INTO v_roleId FROM UserRole ur WHERE ur.userId = p_discordId LIMIT 1;

    -- Récupération du salaire de base en fonction de l'idRole
    SELECT r.salary INTO v_baseSalary FROM Roles r WHERE r.idRole = v_roleId;

    -- Récupération des minutes de service totales de cet utilisateur
    SELECT IFNULL(MAX(s.TOTAL), 0) INTO v_totalServiceMinutes FROM Services s WHERE s.discordAgentId = p_discordId;

    -- Calcul du salaire
    IF v_totalServiceMinutes < 690 THEN
        SET p_totalSalary = 0;
    ELSE
        SET p_totalSalary = v_baseSalary + FLOOR((v_totalServiceMinutes - 690) / 300) * 250000;
    END IF;
END;
