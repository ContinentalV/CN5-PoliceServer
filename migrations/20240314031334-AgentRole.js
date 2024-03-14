'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('AgentRole', {
            agentId: {
                type: Sequelize.STRING,
                references: {model: 'Users', key: 'discordId'}
            },
            roleId: {
                type: Sequelize.STRING,
                references: {model: 'ListRole', key: 'roleId'}
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('AgentRole');
    }
};
