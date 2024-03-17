module.exports = {
    apps: [{
        name: 'policeServer',
        script: 'build/server.js', // Chemin vers le script à exécuter
        watch: true, // Activation de la surveillance des fichiers
        ignore_watch: [
            "./tmp",
            "./styles",
            './node_modules', // Ignorer le répertoire node_modules
            './logs',         // Ignorer le répertoire des logs
            '.env',         // Ignorer le fichier .env
            "./build/utils"

        ],
        env: {
            "NODE_ENV": "development",
            // Définissez ici d'autres variables d'environnement pour le mode développement
        },
        env_production: {
            "NODE_ENV": "production",
            // Définissez ici d'autres variables d'environnement pour le mode production
        },
        exec_mode: 'fork', // Exécution du script en mode fork (processus séparé)
        script: 'build-script.js' // Chemin vers le script de construction dédié
    }]
};
