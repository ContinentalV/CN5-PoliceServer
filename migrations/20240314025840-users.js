'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {

        await queryInterface.createTable('Users', {
            discordId: {
                type: Sequelize.STRING,
                allowNull: false,
                primaryKey: true
            },
            nomRP: {
                type: Sequelize.STRING
            },
            username: {
                type: Sequelize.STRING,
                allowNull: false
            },
            avatar: {
                type: Sequelize.STRING
            },
            codeMetier: {
                type: Sequelize.STRING
            },
            dateJoin: {
                type: Sequelize.DATE
            },
            matricule: {
                type: Sequelize.INTEGER
            },
            idServeur: {
                type: Sequelize.STRING
            },
            etatMajor: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            }
        });
    },


    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Users');
    }
};
