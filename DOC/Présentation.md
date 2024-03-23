# Configuration du Projet API-REST

## Aperçu
Ce document décrit les éléments clés du projet `api-rest`, qui est une API REST conçue pour être utilisée avec un bot ou un tableau de bord pour l'initiative `POLICE`.

### Informations sur le Projet

- **Nom :** api-rest
- **Version :** 1.0.0
- **Description :** API REST pour une utilisation avec DASH/BOT POLICE
- **Point d'Entrée Principal :** index.js
- **Auteur :** neo-getsu
- **Licence :** ISC

### Scripts
Une collection de scripts utilitaires pour gérer le cycle de vie du projet.

- `start:dev` : Démarre le serveur de développement en utilisant `ts-node-dev`.
- `init:full-app` : Initialise l'application complète, crée la base de données, lance les migrations et seed la base de données.
- `init:db:create` : Initialise uniquement la base de données.
- `init:db:migrate` : Exécute les migrations de la base de données.
- `init:db:seedall` : Seed la base de données avec des données initiales.
- `stop` : Arrête de force tous les processus Node.js.
- `start:prod` : Démarre le serveur de production.
- `dev` : Exécute l'application en utilisant `nodemon`.
- `build` : Compile les fichiers TypeScript en JavaScript.
- `crea-mig` : Crée une nouvelle migration.
- `crea-seed` : Crée un nouveau fichier de seed.
    > ###    Exemple d'utilisation :
    > - `npm run crea-mig -- nameMigration`
    > - `npm run crea-seed -- nameSeed`

### Dépendances
Bibliothèques essentielles requises pour le bon fonctionnement de l'application.

- **Express Framework :** Fournit le serveur web et les capacités de routage.
- **Axios :** Utilisé pour effectuer des requêtes HTTP.
- **Body Parser, Cookie Parser, Cors :** Middleware pour l'analyse des corps de requête, des cookies et l'activation de CORS.
- **Dayjs :** Une bibliothèque légère pour la manipulation des dates.
- **Dotenv :** Charge les variables d'environnement à partir d'un fichier `.env`.
- **Jsonwebtoken :** Utilisé pour générer et vérifier les JSON Web Tokens.
- **Morgan :** Middleware pour l'enregistrement des requêtes HTTP.
- **Sequelize & TypeORM :** ORM pour la gestion de la base de données.
- **Winston :** Une bibliothèque de journalisation polyvalente.

### Dépendances de Développement
Bibliothèques et outils utilisés lors du processus de développement.

- **@types/\* :** Fichiers de déclaration TypeScript pour la vérification des types.
- **Nodemon :** Utilitaire qui surveille les changements dans votre source et redémarre automatiquement votre serveur.
- **Sequelize-cli & ts-node :** Outils en ligne de commande pour gérer Sequelize et exécuter des fichiers TypeScript.
- **Typedoc :** Générateur de documentation pour les projets TypeScript.
- **TypeScript :** Le compilateur TypeScript.

## Conclusion
Cette configuration pose les bases pour un environnement de développement API robuste, adapté à DASH/BOT POLICE. La sélection réfléchie des scripts et des dépendances met en avant un engagement envers l'efficacité, la fiabilité et la maintenabilité.
