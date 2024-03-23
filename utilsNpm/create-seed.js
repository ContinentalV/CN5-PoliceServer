// create-seed.js
const { exec } = require('child_process');
const seedName = process.argv[2] ? process.argv[2] : 'unnamed-seed';

exec(`npx sequelize-cli seed:generate --name ${seedName}`, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log(`Seed ${seedName} created`);
    console.error(`stderr: ${stderr}`);
});
