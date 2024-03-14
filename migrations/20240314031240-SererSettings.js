'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('ServerSettings', {
            settingId: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            serverId: {
                type: Sequelize.STRING,
                references: {
                    model: 'ServerInfo',
                    key: 'serverId'
                }
            },
            settingKey: Sequelize.STRING,
            settingValue: Sequelize.TEXT
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('ServerSettings');
    }
};
