'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Userrole', {
            userId: {
                type: Sequelize.STRING,
                references: {model: 'Users', key: 'discordId'}
            },
            roleId: {
                type: Sequelize.STRING,
                references: {model: 'Roles', key: 'idRole'}
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Userrole');
    }
};
