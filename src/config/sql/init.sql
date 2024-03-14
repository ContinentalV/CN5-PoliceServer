CREATE TABLE IF NOT EXISTS ServerInfo
(
    serverId         VARCHAR(255) PRIMARY KEY,
    serverName       VARCHAR(255),
    owner            VARCHAR(255),
    totalUsers       INT,
    creationDate     DATETIME,
    defaultChannelId VARCHAR(255),
    iconUrl          TEXT,
    inviteUrl        TEXT,
    roleCount        INT,
    listRole         VARCHAR(250)


);

CREATE TABLE IF NOT EXISTS ServerSettings
(
    settingId    INT AUTO_INCREMENT PRIMARY KEY,
    serverId     VARCHAR(255),
    settingKey   VARCHAR(255),
    settingValue TEXT,
    FOREIGN KEY (serverId) REFERENCES ServerInfo (serverId)
);

CREATE TABLE IF NOT EXISTS Users
(
    discordId  VARCHAR(255) PRIMARY KEY,
    nomRP      VARCHAR(255),
    username   VARCHAR(255) NOT NULL,
    avatar     VARCHAR(255),
    codeMetier VARCHAR(255),
    dateJoin   DATETIME,
    matricule  INT,
    idServeur  VARCHAR(255),
    etatMajor  BOOLEAN default false

);

CREATE TABLE IF NOT EXISTS Services
(
    id             INT AUTO_INCREMENT PRIMARY KEY,
    PDS            DATETIME default null,
    FDS            DATETIME default null,
    TEMPS_SERVICE  INT      default 0,
    TOTAL          INT      default 0,
    serviceIsOn    BOOLEAN  default false,
    discordAgentId VARCHAR(255),
    FOREIGN KEY (discordAgentId) REFERENCES Users (discordId)
);



CREATE TABLE IF NOT EXISTS Roles
(
    idRole     VARCHAR(255) PRIMARY KEY,
    name       VARCHAR(255),
    salary     INT,
    codeMetier VARCHAR(255)
);


CREATE TABLE IF NOT EXISTS UserRole
(
    userId VARCHAR(255),
    roleId VARCHAR(255),
    FOREIGN KEY (userId) REFERENCES Users (discordId),
    FOREIGN KEY (roleId) REFERENCES Roles (idRole)
);
CREATE TABLE IF NOT EXISTS ListRole
(
    roleId   VARCHAR(255) PRIMARY KEY,
    name     VARCHAR(255),
    color    VARCHAR(255),
    serverId VARCHAR(255),
    FOREIGN KEY (serverId) REFERENCES ServerInfo (serverId)
);

CREATE TABLE IF NOT EXISTS AgentRole
(
    agentId VARCHAR(255),
    roleId  VARCHAR(255),
    FOREIGN KEY (agentId) REFERENCES Users (discordId),
    FOREIGN KEY (roleId) REFERENCES ListRole (roleId) -- Fait référence aux rôles spécifiques à chaque serveur
);



