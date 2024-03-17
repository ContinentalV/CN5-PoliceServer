// ecosystem.config.js
module.exports = {
    apps: [
        {
            name: 'policeServer',
            script: 'build/server.js',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'development',
            },
            env_production: {
                NODE_ENV: 'production',
            },
            exec_mode: 'fork',
            // Hooks pour gérer les étapes d'installation et de construction
            hooks: {
                'pre-setup': 'npm install --production',
                'post-setup': 'npm run build',
                'pre-deploy': 'npm install --production',
                'post-deploy': 'npm run build && pm2 startOrRestart ecosystem.config.js --env production',
                'pre-restart': 'npm run build',
                'post-restart': 'echo "Application restarted"',
            },
        },
    ],
};
