'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('Roles', [
            {idRole: '1147211942818238489', name: 'Sheriff', salary: 7500000, codeMetier: 'BCSO'},
            {idRole: '1147211942818238486', name: 'Sheriff Adjoint', salary: 7500000, codeMetier: 'BCSO'},
            {idRole: '1147211942818238485', name: 'Colonel', salary: 6800000, codeMetier: 'BCSO'},
            {idRole: '1147211942797262947', name: 'Major', salary: 6700000, codeMetier: 'BCSO'},
            {idRole: '1162834027368165569', name: 'Chief-Deputy', salary: 6600000, codeMetier: 'BCSO'},
            {idRole: '1147211942797262938', name: 'Captain', salary: 4300000, codeMetier: 'BCSO'},
            {idRole: '1163531941891551362', name: 'Lieutenant-Chef', salary: 4100000, codeMetier: 'BCSO'},
            {idRole: '1147211942780473351', name: 'Lieutenant', salary: 3900000, codeMetier: 'BCSO'},
            {idRole: '1147211942780473345', name: 'Sergent-Chef', salary: 3600000, codeMetier: 'BCSO'},
            {idRole: '1147211942780473344', name: 'Sergent', salary: 3400000, codeMetier: 'BCSO'},
            {idRole: '1147211942759518316', name: 'Senior Deputy', salary: 3200000, codeMetier: 'BCSO'},
            {idRole: '1147211942759518311', name: 'Deputy III', salary: 2900000, codeMetier: 'BCSO'},
            {idRole: '1147211942759518310', name: 'Deputy II', salary: 2700000, codeMetier: 'BCSO'},
            {idRole: '1147211942759518309', name: 'Deputy I', salary: 2500000, codeMetier: 'BCSO'},
            {idRole: '1147211942742736905', name: 'Deputy Trainee', salary: 2500000, codeMetier: 'BCSO'},
            {idRole: '621715593032105985', name: 'Commandant', salary: 7500000, codeMetier: 'LSPD'},
            {idRole: '628421188796022794', name: 'Capitaine', salary: 7500000, codeMetier: 'LSPD'},
            {idRole: '665872607534383109', name: 'Chef', salary: 6800000, codeMetier: 'LSPD'},
            {idRole: '765331738804092929', name: 'Chef-adjoint', salary: 6700000, codeMetier: 'LSPD'},
            {idRole: '680221494604988437', name: 'Inspecteur-interne', salary: 6600000, codeMetier: 'LSPD'},
            {idRole: '671801929910976513', name: 'Inspecteur', salary: 4300000, codeMetier: 'LSPD'},
            {idRole: '924423493695733821', name: 'Inspecteur-Adjoint', salary: 4100000, codeMetier: 'LSPD'},
            {idRole: '628420954061537290', name: 'Lieutenant', salary: 3900000, codeMetier: 'LSPD'},
            {idRole: '924422016902238279', name: 'Sergent-Chef', salary: 3600000, codeMetier: 'LSPD'},
            {idRole: '621715823567962132', name: 'Sergent', salary: 3400000, codeMetier: 'LSPD'},
            {idRole: '1147969471672229978', name: 'SLO', salary: 3200000, codeMetier: 'LSPD'},
            {idRole: '924420875183329321', name: 'Officier-II', salary: 2900000, codeMetier: 'LSPD'},
            {idRole: '621716188363227136', name: 'Officier', salary: 2700000, codeMetier: 'LSPD'},
            {idRole: '924419872329465926', name: 'Sous-Officier', salary: 2500000, codeMetier: 'LSPD'},
            {idRole: '621716298598187008', name: 'Cadet', salary: 2500000, codeMetier: 'LSPD'}
        ], {});

    },
    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Roles', null, {});
    }
};
