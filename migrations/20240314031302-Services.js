'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('services', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            PDS: Sequelize.DATE,
            FDS: Sequelize.DATE,
            TEMPS_SERVICE: Sequelize.INTEGER,
            TOTAL: Sequelize.INTEGER,
            serviceIsOn: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            discordAgentId: {
                type: Sequelize.STRING,
                references: {
                    model: 'Users', // Assurez-vous que cela correspond au nom de la table tel que défini dans votre migration pour les utilisateurs
                    key: 'discordId'
                }
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('services');
    }
};
