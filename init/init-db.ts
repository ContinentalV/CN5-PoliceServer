const {Sequelize} = require('sequelize');
const config = require('../config/config.json');

const environment = process.env.NODE_ENV || 'development';
const envConfig = config[environment];

async function createDatabaseAndUser() {
    try {
        // Connexion administrative à ajuster selon votre environnement
        const sequelizeAdmin = new Sequelize('mysql://root@localhost/');

        const dbName = envConfig.database;
        const dbUser = envConfig.username;
        const dbPassword = envConfig.password;

        // Créer la base de données
        await sequelizeAdmin.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        console.log(`Base de données ${dbName} créée ou existait déjà.`);

        // Créer l'utilisateur (Notez que la création d'utilisateurs peut varier selon vos besoins de sécurité et configuration MySQL)
        await sequelizeAdmin.query(`CREATE USER IF NOT EXISTS '${dbUser}'@'127.0.0.1' IDENTIFIED BY '${dbPassword}';`);
        console.log(`Utilisateur ${dbUser} créé ou existait déjà.`);

        // Attribuer les privilèges à l'utilisateur
        await sequelizeAdmin.query(`GRANT ALL PRIVILEGES ON \`${dbName}\`.* TO '${dbUser}'@'127.0.0.1';`);
        await sequelizeAdmin.query(`GRANT SELECT ON police.agentrole TO '${dbUser}'@'127.0.0.1';`);
        await sequelizeAdmin.query(`GRANT INSERT ON police.agentrole TO '${dbUser}'@'127.0.0.1';`);
        await sequelizeAdmin.query(`FLUSH PRIVILEGES;`);
        console.log(`Privileges attribués à l'utilisateur ${dbUser}.`);

        await sequelizeAdmin.close();

    } catch (error) {
        console.error('Erreur lors de la création de la base de données ou de l\'utilisateur:', error);
    }
}

createDatabaseAndUser();
