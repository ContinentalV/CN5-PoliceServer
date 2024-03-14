'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('ListRole', {
            roleId: {
                type: Sequelize.STRING,
                allowNull: false,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING
            },
            color: {
                type: Sequelize.STRING
            },
            serverId: {
                type: Sequelize.STRING,
                references: {model: 'ServerInfo', key: 'serverId'}
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('ListRole');
    }
};
