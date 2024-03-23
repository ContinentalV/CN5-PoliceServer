// create-migration.js
const { exec } = require('child_process');
const migrationName = process.argv[2] ? process.argv[2] : 'unnamed-migration';

exec(`npx sequelize-cli migration:generate --name ${migrationName}`, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
});
