'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('ServerInfo', {
            serverId: {
                type: Sequelize.STRING,
                allowNull: false,
                primaryKey: true
            },
            serverName: Sequelize.STRING,
            owner: Sequelize.STRING,
            totalUsers: Sequelize.INTEGER,
            creationDate: Sequelize.DATE,
            defaultChannelId: Sequelize.STRING,
            iconUrl: Sequelize.TEXT,
            inviteUrl: Sequelize.TEXT,
            roleCount: Sequelize.INTEGER,
            listRole: Sequelize.STRING
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('ServerInfo');
    }
};
