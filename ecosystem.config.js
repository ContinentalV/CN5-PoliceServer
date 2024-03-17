// ecosystem.config.js
module.exports = {
    apps: [
        {
            name: 'policeServer',
            script: 'build/server.js',
            instances: 1,
            autorestart: true,
            watch: true, // Active la surveillance des fichiers
            ignore_watch: [
                // Ajoutez les répertoires que vous souhaitez ignorer ici
                'node_modules',
                'logs',
                '.env',
                'build/utils',
            ],
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'development',
            },
            env_production: {
                NODE_ENV: 'production',
            },
            exec_mode: 'fork',
            // Hooks pour les étapes d'installation et de construction

        },
    ],
};
