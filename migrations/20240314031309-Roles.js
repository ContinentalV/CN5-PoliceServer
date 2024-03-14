'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Roles', {
            idRole: {
                type: Sequelize.STRING,
                allowNull: false,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING
            },
            salary: {
                type: Sequelize.INTEGER
            },
            codeMetier: {
                type: Sequelize.STRING
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Roles');
    }
};
